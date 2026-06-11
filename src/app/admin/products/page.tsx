
"use client";

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, Plus, Trash2, Edit, Loader2, Sparkles, AlertCircle, Star } from 'lucide-react';
import { collection, query, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { Product, Framework, Category } from '@/lib/types';
import { generateProductDescriptionAndFeatures } from '@/ai/flows/generate-product-description-and-features-flow';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const ADMIN_EMAILS = ['mekonghost@gmail.com', 'chhayheng@gmail.com'];

export default function AdminProductsPage() {
  const { user, profile, loading: authLoading } = useUser();
  const { db } = useFirestore();
  const { toast } = useToast();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-promote admin emails
  useEffect(() => {
    if (user && profile && profile.role !== 'admin' && db) {
      if (ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
        const userRef = doc(db, 'users', user.uid);
        updateDoc(userRef, { role: 'admin' }).catch(() => {});
      }
    }
  }, [user, profile, db]);

  // Use simple query without orderBy to ensure data loads instantly without index requirements
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'));
  }, [db]);

  const { data: products, loading: productsLoading, error: productsError } = useCollection<Product>(productsQuery);

  if (authLoading || !mounted) return <div className="min-h-screen flex items-center justify-center font-headline font-bold text-xs">INITIALIZING ADMIN SESSION...</div>;
  
  const isAdmin = profile?.role === 'admin' || (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));
  if (!user || !isAdmin) return <div className="min-h-screen flex items-center justify-center font-headline font-bold text-xs">ACCESS RESTRICTED</div>;

  const handleSaveProduct = () => {
    if (!db) {
      toast({ title: "Database Error", description: "Connection unavailable.", variant: "destructive" });
      return;
    }
    
    if (!editingProduct?.name) {
      toast({ title: "Missing Name", description: "Please enter a script name.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const productId = editingProduct.id || doc(collection(db, 'products')).id;
    const productRef = doc(db, 'products', productId);

    const productData: Product = {
      id: productId,
      name: editingProduct.name || "Untitled Script",
      description: editingProduct.description || "",
      price: Number(editingProduct.price ?? 0),
      framework: (editingProduct.framework as Framework) || 'QBCore',
      category: (editingProduct.category as Category) || 'QBCore Scripts',
      features: Array.isArray(editingProduct.features) 
        ? editingProduct.features 
        : (editingProduct.features as any || "").split('\n').map((f: string) => f.trim()).filter((f: string) => f !== ''),
      requirements: Array.isArray(editingProduct.requirements)
        ? editingProduct.requirements
        : (editingProduct.requirements as any || "").split('\n').map((r: string) => r.trim()).filter((r: string) => r !== ''),
      previewImageUrl: editingProduct.previewImageUrl || "",
      videoUrl: editingProduct.videoUrl || "",
      downloadUrl: editingProduct.downloadUrl || "",
      isFeatured: !!editingProduct.isFeatured,
      createdAt: editingProduct.createdAt || Date.now(),
    };

    // Use non-blocking mutation for better persistence and UX
    setDoc(productRef, productData, { merge: true })
      .then(() => {
        toast({ title: "Product Saved", description: `${productData.name} is now live.` });
        setIsDialogOpen(false);
        setEditingProduct(null);
      })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: productRef.path,
          operation: 'write',
          requestResourceData: productData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleDeleteProduct = (productId: string) => {
    if (!db || !confirm("Permanently delete this product?")) return;
    const productRef = doc(db, 'products', productId);
    
    deleteDoc(productRef)
      .then(() => toast({ title: "Deleted", description: "Product removed successfully." }))
      .catch(async () => {
        const permissionError = new FirestorePermissionError({ path: productRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleOptimizeDescription = async () => {
    if (!editingProduct?.name || !editingProduct?.description) {
      toast({ title: "AI Optimization", description: "Fill in name and description first.", variant: "destructive" });
      return;
    }
    setIsAiLoading(true);
    try {
      const result = await generateProductDescriptionAndFeatures({
        scriptName: editingProduct.name,
        rawDescription: editingProduct.description,
        rawFeatures: Array.isArray(editingProduct.features) ? editingProduct.features : (editingProduct.features as any || "").split('\n'),
        framework: (editingProduct.framework as Framework) || 'QBCore',
        price: Number(editingProduct.price) || 0,
      });
      setEditingProduct(prev => ({
        ...prev,
        description: result.description,
        features: result.features.join('\n')
      }));
      toast({ title: "AI Optimization Complete" });
    } catch (error) {
      toast({ title: "AI Optimization Failed", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Navbar />
      <div className="container mx-auto px-4">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-headline text-4xl font-bold mb-2 uppercase tracking-wider text-primary">PRODUCT <span className="text-white">MANAGEMENT</span></h1>
            <p className="text-muted-foreground font-medium">Add and edit scripts in the marketplace catalog.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-background font-headline hover:bg-primary/90 neon-glow" onClick={() => setEditingProduct({ framework: 'QBCore', category: 'QBCore Scripts', isFeatured: false, price: 0 })}>
                <Plus className="w-4 h-4 mr-2" /> ADD NEW SCRIPT
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl glass border-primary/20 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl uppercase">{editingProduct?.id ? 'Edit' : 'Add'} Product</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Script Name</label>
                    <Input value={editingProduct?.name || ''} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} className="bg-black/40 border-white/10" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Price ($)</label>
                      <Input type="number" value={editingProduct?.price ?? ''} onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value === '' ? 0 : Number(e.target.value) })} className="bg-black/40 border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Framework</label>
                      <select value={editingProduct?.framework || 'QBCore'} onChange={e => setEditingProduct({ ...editingProduct, framework: e.target.value as Framework })} className="w-full bg-black/40 border-white/10 rounded-md p-2 text-sm">
                        <option value="QBCore">QBCore</option>
                        <option value="ESX">ESX</option>
                        <option value="Standalone">Standalone</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Description</label>
                      <Button onClick={handleOptimizeDescription} disabled={isAiLoading} variant="outline" size="sm" className="h-7 text-[10px] border-primary/50 text-primary">
                        {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />} AI OPTIMIZE
                      </Button>
                    </div>
                    <Textarea rows={6} value={editingProduct?.description || ''} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} className="bg-black/40 border-white/10" />
                  </div>
                  <div className="flex items-center space-x-2 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Checkbox id="featured" checked={!!editingProduct?.isFeatured} onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, isFeatured: !!checked })} />
                    <label htmlFor="featured" className="text-xs font-bold uppercase tracking-widest cursor-pointer">Feature on Homepage</label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category</label>
                    <select value={editingProduct?.category || 'QBCore Scripts'} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value as Category })} className="w-full bg-black/40 border-white/10 rounded-md p-2 text-sm">
                      <option value="QBCore Scripts">QBCore Scripts</option>
                      <option value="ESX Scripts">ESX Scripts</option>
                      <option value="UI / HUD">UI / HUD</option>
                      <option value="Casino Scripts">Casino Scripts</option>
                      <option value="Job Scripts">Job Scripts</option>
                      <option value="Vehicle Scripts">Vehicle Scripts</option>
                      <option value="Maps / MLO">Maps / MLO</option>
                      <option value="Custom Scripts">Custom Scripts</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Features (One per line)</label>
                    <Textarea rows={4} value={Array.isArray(editingProduct?.features) ? editingProduct?.features.join('\n') : editingProduct?.features || ''} onChange={e => setEditingProduct({ ...editingProduct, features: e.target.value })} className="bg-black/40 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Requirements (One per line)</label>
                    <Textarea rows={2} value={Array.isArray(editingProduct?.requirements) ? editingProduct?.requirements.join('\n') : editingProduct?.requirements || ''} onChange={e => setEditingProduct({ ...editingProduct, requirements: e.target.value })} className="bg-black/40 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Preview Image URL</label>
                    <Input value={editingProduct?.previewImageUrl || ''} onChange={e => setEditingProduct({ ...editingProduct, previewImageUrl: e.target.value })} className="bg-black/40 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Download URL</label>
                    <Input value={editingProduct?.downloadUrl || ''} onChange={e => setEditingProduct({ ...editingProduct, downloadUrl: e.target.value })} className="bg-black/40 border-white/10" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>CANCEL</Button>
                <Button className="bg-primary text-background" onClick={handleSaveProduct} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingProduct?.id ? 'SAVE CHANGES' : 'CREATE PRODUCT'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <Card className="glass border-white/5 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Product</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Framework</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest text-center">Featured</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Price</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-headline text-xs">SCANNING DATABASE...</TableCell></TableRow>
                ) : productsError ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-destructive"><AlertCircle className="w-4 h-4 mx-auto mb-2" /> Connection interupted.</TableCell></TableRow>
                ) : products && products.length > 0 ? (
                  products.map(p => (
                    <TableRow key={p.id} className="hover:bg-white/5 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                            {p.previewImageUrl ? (
                              <img src={p.previewImageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">{p.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{p.category}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">{p.framework}</Badge></TableCell>
                      <TableCell className="text-center">
                        {p.isFeatured && <Star className="w-4 h-4 text-yellow-400 mx-auto fill-yellow-400" />}
                      </TableCell>
                      <TableCell className="font-headline font-bold text-primary">${p.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="hover:text-primary" onClick={() => { setEditingProduct(p); setIsDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground">Marketplace catalog is empty.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

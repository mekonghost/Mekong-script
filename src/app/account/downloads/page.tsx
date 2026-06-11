
'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle, Package, Zap } from 'lucide-react';
import { collection, query, where, doc, getDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { Order, Product } from '@/lib/types';
import { useState, useEffect } from 'react';

export default function MyDownloadsPage() {
  const { user, profile, loading: authLoading } = useUser();
  const { db } = useFirestore();
  const [downloadableProducts, setDownloadableProducts] = useState<Product[]>([]);
  const [fetchingProducts, setFetchingProducts] = useState(false);

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'orders'), where('customerId', '==', user.uid), where('status', '==', 'delivered'));
  }, [db, user]);

  const { data: deliveredOrders, loading: ordersLoading } = useCollection<Order>(ordersQuery);

  useEffect(() => {
    if (!db || !deliveredOrders || deliveredOrders.length === 0) return;

    const fetchProducts = async () => {
      setFetchingProducts(true);
      const products: Product[] = [];
      for (const order of deliveredOrders) {
        const pDoc = await getDoc(doc(db, 'products', order.productId));
        if (pDoc.exists()) {
          products.push(pDoc.data() as Product);
        }
      }
      setDownloadableProducts(products);
      setFetchingProducts(false);
    };

    fetchProducts();
  }, [db, deliveredOrders]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center">Please Login.</div>;

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Navbar />
      <div className="container mx-auto px-4">
        <header className="mb-12">
          <h1 className="font-headline text-4xl font-bold mb-2 uppercase tracking-wider text-primary">MY <span className="text-white">DOWNLOADS</span></h1>
          <p className="text-muted-foreground font-medium">Access and download your purchased scripts.</p>
        </header>

        {ordersLoading || fetchingProducts ? (
          <div className="text-center py-20 text-muted-foreground">Checking for downloads...</div>
        ) : downloadableProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {downloadableProducts.map(product => (
              <Card key={product.id} className="glass border-primary/20 hover:border-primary/50 transition-all group">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-green-400 uppercase tracking-widest bg-green-500/10 px-2 py-1 rounded">
                      <CheckCircle className="w-3 h-3" /> VERIFIED
                    </div>
                  </div>
                  <CardTitle className="font-headline text-xl uppercase mb-1">{product.name}</CardTitle>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{product.framework} • {product.category}</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-6">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4">
                    <Zap className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Latest Version</p>
                      <p className="text-sm font-bold">V1.0.0 Stable</p>
                    </div>
                  </div>
                  <Button asChild className="w-full h-12 bg-primary text-background font-headline hover:bg-primary/90 neon-glow">
                    <a href={product.downloadUrl || '#'} target="_blank">
                      <Download className="w-4 h-4 mr-2" /> DOWNLOAD SCRIPT
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass border-white/5 p-20 text-center">
            <Download className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
            <h3 className="font-headline text-2xl font-bold mb-4">NO DOWNLOADS AVAILABLE</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Your downloads will appear here once your orders have been verified and marked as delivered by an administrator.
            </p>
            <Button asChild variant="outline" className="border-primary/20 text-primary">
              <Link href="/account/orders">VIEW ORDER STATUS</Link>
            </Button>
          </Card>
        )}
      </div>
    </main>
  );
}

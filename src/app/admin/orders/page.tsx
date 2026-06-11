"use client";

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Clock, CheckCircle, Package, User, Check, X } from 'lucide-react';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const ADMIN_EMAILS = ['mekonghost@gmail.com', 'chhayheng@gmail.com'];

export default function AdminOrdersPage() {
  const { user, profile, loading: authLoading } = useUser();
  const { db } = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-promote hardcoded admin emails
  useEffect(() => {
    if (user && profile && profile.role !== 'admin' && db) {
      if (ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
        const userRef = doc(db, 'users', user.uid);
        updateDoc(userRef, { role: 'admin' });
      }
    }
  }, [user, profile, db]);

  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: orders, loading: ordersLoading } = useCollection<Order>(ordersQuery);

  if (authLoading || !mounted) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  const isAdmin = profile?.role === 'admin' || (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));
  if (!user || !isAdmin) return <div className="min-h-screen flex items-center justify-center">Access Denied.</div>;

  const updateOrderStatus = (orderId: string, status: 'pending' | 'paid' | 'delivered') => {
    if (!db) return;
    const orderRef = doc(db, 'orders', orderId);
    updateDoc(orderRef, { status })
      .then(() => toast({ title: "Order Updated", description: `Status changed to ${status}.` }))
      .catch(async () => {
        const permissionError = new FirestorePermissionError({ path: orderRef.path, operation: 'update' });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Navbar />
      <div className="container mx-auto px-4">
        <header className="mb-12">
          <h1 className="font-headline text-4xl font-bold mb-2 uppercase tracking-wider text-primary">CUSTOMER <span className="text-white">ORDERS</span></h1>
          <p className="text-muted-foreground font-medium">Manage payments and delivery of script orders.</p>
        </header>

        <Card className="glass border-white/5 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Order ID</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Customer</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Product</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Price</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Status</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground">Loading orders...</TableCell></TableRow>
                ) : orders && orders.length > 0 ? (
                  orders.map(order => (
                    <TableRow key={order.id} className="hover:bg-white/5 transition-colors">
                      <TableCell className="font-mono text-[10px] text-primary">{order.id}</TableCell>
                      <TableCell>
                        <div className="text-xs font-medium">{order.customerEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">{order.productName}</div>
                      </TableCell>
                      <TableCell className="font-headline font-bold text-white text-xs">${order.amount}</TableCell>
                      <TableCell>
                        <Badge className={`${
                          order.status === 'delivered' ? 'bg-green-500/10 text-green-400' : 
                          order.status === 'paid' ? 'bg-blue-500/10 text-blue-400' : 
                          'bg-secondary/10 text-secondary'
                        } text-[8px] uppercase border-white/5`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {order.status === 'pending' && (
                            <Button size="sm" variant="outline" className="h-7 text-[9px] border-blue-500/20 text-blue-400 hover:bg-blue-500/10" onClick={() => updateOrderStatus(order.id, 'paid')}>
                              <Check className="w-3 h-3 mr-1" /> MARK PAID
                            </Button>
                          )}
                          {order.status === 'paid' && (
                            <Button size="sm" variant="outline" className="h-7 text-[9px] border-green-500/20 text-green-400 hover:bg-green-500/10" onClick={() => updateOrderStatus(order.id, 'delivered')}>
                              <CheckCircle className="w-3 h-3 mr-1" /> DELIVER
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground">No orders found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
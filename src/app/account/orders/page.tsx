"use client";

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Clock, CheckCircle, Package, ExternalLink } from 'lucide-react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { Order } from '@/lib/types';
import Link from 'next/link';

export default function MyOrdersPage() {
  const { user, profile, loading: authLoading } = useUser();
  const { db } = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'orders'), where('customerId', '==', user.uid), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: orders, loading: ordersLoading } = useCollection<Order>(ordersQuery);

  if (authLoading || !mounted) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center">Please Login.</div>;

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Navbar />
      <div className="container mx-auto px-4">
        <header className="mb-12">
          <h1 className="font-headline text-4xl font-bold mb-2 uppercase tracking-wider">MY <span className="text-primary">ORDERS</span></h1>
          <p className="text-muted-foreground font-medium">Track your script purchases and payment status.</p>
        </header>

        <Card className="glass border-white/5 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Order ID</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Product</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Price</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Status</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Date</TableHead>
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
                        <div className="text-xs font-bold">{order.productName}</div>
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
                      <TableCell className="text-[10px] text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {order.status === 'delivered' && (
                          <Button asChild size="sm" variant="ghost" className="h-7 text-[9px] text-primary">
                            <Link href="/account/downloads">VIEW DOWNLOADS</Link>
                          </Button>
                        )}
                        {order.status === 'pending' && (
                          <Button asChild size="sm" variant="ghost" className="h-7 text-[9px] text-secondary">
                            <Link href="https://discord.gg/mekong" target="_blank">CONTACT ADMIN</Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-40">
                      <div className="flex flex-col items-center gap-4">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground/20" />
                        <p className="text-muted-foreground">No orders yet.</p>
                        <Button asChild size="sm" className="bg-primary text-background"><Link href="/store">BROWSE STORE</Link></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingBag, Clock, CheckCircle, TrendingUp, Users, Plus, ArrowRight } from 'lucide-react';
import { collection, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';

const ADMIN_EMAILS = ['mekonghost@gmail.com', 'chhayheng@gmail.com'];

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useUser();
  const { db } = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-promote hardcoded admin emails if they aren't already admins
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
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
  }, [db]);

  const { data: recentOrders, loading: ordersLoading } = useCollection(ordersQuery);
  
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(5));
  }, [db]);
  const { data: products } = useCollection(productsQuery);

  if (authLoading || !mounted) return <div className="min-h-screen flex items-center justify-center">Loading Admin...</div>;
  
  const isAdmin = profile?.role === 'admin' || (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));
  if (!user || !isAdmin) return <div className="min-h-screen flex items-center justify-center">Access Denied.</div>;

  const totalSales = recentOrders?.reduce((acc, order) => acc + (order.status !== 'pending' ? order.amount : 0), 0) || 0;

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Navbar />
      <div className="container mx-auto px-4">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-4xl font-bold mb-2 uppercase tracking-wider text-primary">ADMIN <span className="text-white">COMMAND CENTER</span></h1>
            <p className="text-muted-foreground font-medium">Global marketplace overview and management.</p>
          </div>
          <div className="glass px-6 py-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="text-primary w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Est. Revenue</div>
              <div className="text-xl font-headline font-bold text-white">${totalSales.toFixed(2)}</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Package, title: "Products", val: products?.length || 0, color: "text-primary", link: "/admin/products" },
            { icon: ShoppingBag, title: "Orders", val: "42", color: "text-white", link: "/admin/orders" },
            { icon: Clock, title: "Pending", val: "12", color: "text-secondary", link: "/admin/orders" },
            { icon: Users, title: "Customers", val: "156", color: "text-green-400", link: "/admin/customers" }
          ].map((stat, idx) => (
            <Card key={idx} className="glass border-white/5 overflow-hidden hover:border-primary/20 transition-all">
              <Link href={stat.link}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                      <p className={`text-2xl font-headline font-bold ${stat.color}`}>{stat.val}</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-xl font-bold uppercase">Recent Sales</h2>
              <Button asChild variant="ghost" size="sm" className="text-primary font-bold text-[10px] tracking-widest">
                <Link href="/admin/orders">VIEW ALL <ArrowRight className="ml-1 w-3 h-3" /></Link>
              </Button>
            </div>
            <div className="glass rounded-2xl overflow-hidden border border-white/5">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow>
                    <TableHead className="font-bold text-[10px] tracking-widest uppercase">ID</TableHead>
                    <TableHead className="font-bold text-[10px] tracking-widest uppercase">Customer</TableHead>
                    <TableHead className="font-bold text-[10px] tracking-widest uppercase">Product</TableHead>
                    <TableHead className="font-bold text-[10px] tracking-widest uppercase">Status</TableHead>
                    <TableHead className="font-bold text-[10px] tracking-widest uppercase text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Loading orders...</TableCell></TableRow>
                  ) : recentOrders?.map(order => (
                    <TableRow key={order.id} className="hover:bg-white/5 transition-colors">
                      <TableCell className="font-mono text-[10px] text-primary">{order.id.substring(0, 8)}</TableCell>
                      <TableCell className="text-xs truncate max-w-[120px]">{order.customerEmail}</TableCell>
                      <TableCell className="text-xs font-medium">{order.productName}</TableCell>
                      <TableCell>
                        <Badge className={`${order.status === 'delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-secondary/10 text-secondary border-secondary/20'} text-[8px] uppercase`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-headline font-bold text-white text-xs">${order.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-headline text-xl font-bold uppercase">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              <Button asChild className="h-16 justify-start gap-4 glass hover:bg-primary hover:text-background border-primary/20 transition-all font-headline">
                <Link href="/admin/products">
                  <div className="p-2 rounded-lg bg-primary/20"><Plus className="w-5 h-5" /></div>
                  ADD NEW PRODUCT
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 justify-start gap-4 border-white/10 hover:border-secondary transition-all font-headline">
                <Link href="/admin/orders">
                  <div className="p-2 rounded-lg bg-secondary/20"><Clock className="w-5 h-5 text-secondary" /></div>
                  PENDING APPROVALS
                </Link>
              </Button>
            </div>
            
            <div className="glass p-6 rounded-2xl border-primary/10">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Market Share</h3>
              <div className="space-y-4">
                {['QBCore', 'ESX', 'Standalone'].map(fw => (
                  <div key={fw} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-muted-foreground">{fw}</span>
                      <span>45%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
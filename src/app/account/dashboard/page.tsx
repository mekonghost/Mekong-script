"use client";

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Download, MessageCircle, User, Clock, CheckCircle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, limit, doc, updateDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';

export default function CustomerDashboard() {
  const { user, profile, loading: authLoading } = useUser();
  const { db } = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-promote hardcoded admin emails if they aren't already admins
  useEffect(() => {
    if (user && profile && profile.role !== 'admin' && db) {
      const adminEmails = ['mekonghost@gmail.com', 'chhayheng@gmail.com'];
      if (adminEmails.includes(user.email?.toLowerCase() || '')) {
        const userRef = doc(db, 'users', user.uid);
        updateDoc(userRef, { role: 'admin' });
      }
    }
  }, [user, profile, db]);

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'orders'), where('customerId', '==', user.uid), limit(5));
  }, [db, user]);

  const { data: recentOrders, loading: ordersLoading } = useCollection(ordersQuery);

  if (authLoading || !mounted) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center">Please login.</div>;

  const isAdminEmail = ['mekonghost@gmail.com', 'chhayheng@gmail.com'].includes(user.email?.toLowerCase() || '');

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Navbar />
      <div className="container mx-auto px-4">
        {isAdminEmail && profile?.role !== 'admin' && (
          <div className="mb-8 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-primary w-5 h-5" />
              <p className="text-sm font-medium">Your account is being upgraded to Administrator status. Please refresh the page.</p>
            </div>
            <Button size="sm" onClick={() => window.location.reload()} className="bg-primary text-background font-bold text-xs">REFRESH NOW</Button>
          </div>
        )}

        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-4xl font-bold mb-2 uppercase tracking-wider">
              CUSTOMER <span className="text-primary">DASHBOARD</span>
            </h1>
            <p className="text-muted-foreground font-medium">Welcome back, {profile?.name || user.email}.</p>
          </div>
          {isAdminEmail && (
            <Button asChild className="bg-primary text-background font-headline hover:bg-primary/90 neon-glow">
              <Link href="/admin/dashboard">GO TO ADMIN PANEL</Link>
            </Button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="space-y-6">
            <Card className="glass border-primary/10 overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg uppercase font-headline">
                  <User className="w-5 h-5 text-primary" /> Profile Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Discord</p>
                  <p className="text-sm font-medium">{profile?.discordUsername || 'Not set'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Telegram</p>
                  <p className="text-sm font-medium">{profile?.telegramUsername || 'Not set'}</p>
                </div>
                <Button asChild variant="outline" className="w-full border-white/10 hover:border-primary text-xs">
                  <Link href="/account/profile">EDIT PROFILE</Link>
                </Button>
              </CardContent>
            </Card>

            <div className="glass p-6 rounded-2xl border-secondary/20">
              <h3 className="font-headline font-bold text-secondary mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> NEED SUPPORT?
              </h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                If you have any issues with your scripts, contact our support team on Discord.
              </p>
              <Button asChild className="w-full bg-secondary text-white hover:bg-secondary/90">
                <a href="https://discord.gg/mekong" target="_blank">JOIN DISCORD</a>
              </Button>
            </div>
          </div>

          {/* Activity Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass border-white/5">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Orders</p>
                    <p className="text-2xl font-headline font-bold">{recentOrders?.length || 0}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass border-white/5">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Available Downloads</p>
                    <p className="text-2xl font-headline font-bold">
                      {recentOrders?.filter(o => o.status === 'delivered').length || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass border-white/5">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 mb-6">
                <CardTitle className="font-headline text-xl uppercase">Recent Orders</CardTitle>
                <Button asChild variant="ghost" className="text-primary text-xs font-bold uppercase tracking-widest">
                  <Link href="/account/orders">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <p className="text-center text-muted-foreground py-10">Loading orders...</p>
                ) : recentOrders && recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${order.status === 'delivered' ? 'bg-green-500/10 text-green-400' : 'bg-secondary/10 text-secondary'}`}>
                            {order.status === 'delivered' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{order.productName}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{order.id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-headline font-bold text-primary">${order.amount}</p>
                          <Badge className={`text-[9px] uppercase ${order.status === 'delivered' ? 'bg-green-500/10 text-green-400' : 'bg-secondary/10 text-secondary'}`}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white/5 rounded-2xl">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders found.</p>
                    <Button asChild variant="link" className="text-primary mt-2">
                      <Link href="/store">Start Shopping</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, User, Mail, Shield, MessageSquare, Phone } from 'lucide-react';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-collection';
import { UserProfile } from '@/lib/types';

const ADMIN_EMAILS = ['mekonghost@gmail.com', 'chhayheng@gmail.com'];

export default function AdminCustomersPage() {
  const { user, profile, loading: authLoading } = useUser();
  const { db } = useFirestore();
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

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: users, loading: usersLoading } = useCollection<UserProfile>(usersQuery);

  if (authLoading || !mounted) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  const isAdmin = profile?.role === 'admin' || (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));
  if (!user || !isAdmin) return <div className="min-h-screen flex items-center justify-center">Access Denied.</div>;

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Navbar />
      <div className="container mx-auto px-4">
        <header className="mb-12">
          <h1 className="font-headline text-4xl font-bold mb-2 uppercase tracking-wider text-primary">CUSTOMER <span className="text-white">DIRECTORY</span></h1>
          <p className="text-muted-foreground font-medium">Manage and view registered user accounts.</p>
        </header>

        <Card className="glass border-white/5 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">User</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Role</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Discord</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Telegram</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest">Phone</TableHead>
                  <TableHead className="uppercase text-[10px] font-bold tracking-widest text-right">Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground">Loading users...</TableCell></TableRow>
                ) : users?.map(u => (
                  <TableRow key={u.uid} className="hover:bg-white/5 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">{u.name}</div>
                          <div className="text-[10px] text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${u.role === 'admin' ? 'bg-primary/20 text-primary border-primary/20' : 'bg-white/5 text-muted-foreground'} text-[8px] uppercase`}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{u.discordUsername || '-'}</TableCell>
                    <TableCell className="text-xs font-mono">{u.telegramUsername || '-'}</TableCell>
                    <TableCell className="text-xs font-mono">{u.phoneNumber || '-'}</TableCell>
                    <TableCell className="text-right text-[10px] text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
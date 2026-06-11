"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

const ADMIN_EMAILS = ['mekonghost@gmail.com', 'chhayheng@gmail.com'];

export default function AdminPage() {
  const router = useRouter();
  const { user, profile, loading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (loading || !mounted) return;
    
    const isAdmin = profile?.role === 'admin' || (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));
    
    if (!user || !isAdmin) {
      router.push('/auth/login');
    } else {
      router.push('/admin/dashboard');
    }
  }, [user, profile, loading, mounted, router]);

  return <div className="min-h-screen flex items-center justify-center">Redirecting to Dashboard...</div>;
}
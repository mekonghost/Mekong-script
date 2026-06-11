'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { auth } = useAuth();
  const { db } = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth || !db) {
      toast({ 
        title: 'Connection Error', 
        description: 'The database is not connected. Please check your Firebase configuration.', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        toast({ title: 'Welcome Back', description: `Logged in as ${userData.name || email}` });
        
        if (userData.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/account/dashboard');
        }
      } else {
        toast({ title: 'Profile Error', description: 'User profile not found.', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const isConfigMissing = !auth || !db;

  // Prevent hydration mismatch by only rendering conditional UI after mount
  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 pt-20">
        <Navbar />
        <Card className="w-full max-w-md glass border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl font-bold text-primary uppercase">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">Loading...</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-20">
      <Navbar />
      <Card className="w-full max-w-md glass border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl font-bold text-primary uppercase">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Login to your Mekong Scripts Store account to manage your scripts, orders, and downloads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConfigMissing && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-xs text-destructive-foreground font-medium">
                Backend connection is missing. Please ensure your Firebase API keys are correctly set.
              </div>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10 bg-black/40 border-white/10 focus:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 bg-black/40 border-white/10 focus:border-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 bg-primary text-background font-headline hover:bg-primary/90 neon-glow">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'LOGIN TO ACCOUNT'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account? <Link href="/auth/register" className="text-primary hover:underline font-bold">Register here</Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}

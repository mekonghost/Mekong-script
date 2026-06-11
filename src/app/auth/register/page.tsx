'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Lock, Phone, MessageSquare, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    discord: '',
    telegram: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { auth } = useAuth();
  const { db } = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
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
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const uid = userCredential.user.uid;

      // Automatically assign admin role to authorized emails
      const adminEmails = ['mekonghost@gmail.com', 'chhayheng@gmail.com'];
      const role = adminEmails.includes(formData.email.toLowerCase()) ? 'admin' : 'customer';

      await setDoc(doc(db, 'users', uid), {
        uid,
        name: formData.name,
        email: formData.email,
        discordUsername: formData.discord,
        telegramUsername: formData.telegram,
        phoneNumber: formData.phone,
        role: role,
        createdAt: Date.now()
      });

      toast({ 
        title: 'Account Created', 
        description: role === 'admin' ? 'Welcome, Administrator!' : 'Welcome to Mekong Scripts!' 
      });
      
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/account/dashboard');
      }
    } catch (error: any) {
      toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const isConfigMissing = !auth || !db;

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 pt-32 pb-20">
        <Navbar />
        <Card className="w-full max-w-2xl glass border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl font-bold text-primary uppercase">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">Loading...</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-32 pb-20">
      <Navbar />
      <Card className="w-full max-w-2xl glass border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl font-bold text-primary uppercase">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Join the community and get access to premium FiveM resources.
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
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input name="name" placeholder="John Doe" className="pl-10 bg-black/40 border-white/10" value={formData.name} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input name="email" type="email" placeholder="john@example.com" className="pl-10 bg-black/40 border-white/10" value={formData.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input name="password" type="password" placeholder="••••••••" className="pl-10 bg-black/40 border-white/10" value={formData.password} onChange={handleChange} required />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Discord Username</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input name="discord" placeholder="username#0000" className="pl-10 bg-black/40 border-white/10" value={formData.discord} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Telegram Username</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input name="telegram" placeholder="@username" className="pl-10 bg-black/40 border-white/10" value={formData.telegram} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input name="phone" placeholder="+1234567890" className="pl-10 bg-black/40 border-white/10" value={formData.phone} onChange={handleChange} />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="col-span-full h-14 bg-primary text-background font-headline hover:bg-primary/90 neon-glow mt-4">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'CREATE MY ACCOUNT'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <div className="text-sm text-muted-foreground">
            Already have an account? <Link href="/auth/login" className="text-primary hover:underline font-bold">Login here</Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}

"use client";

import Link from 'next/link';
import { ShoppingCart, LayoutDashboard, Menu, X, LogOut, User, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useUser();
  const { auth } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  const adminEmails = ['mekonghost@gmail.com', 'chhayheng@gmail.com'];
  const isAdmin = profile?.role === 'admin' || (user?.email && adminEmails.includes(user.email.toLowerCase()));

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-primary/20 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded bg-primary/20 border border-primary flex items-center justify-center neon-glow group-hover:scale-110 transition-transform">
            <span className="text-primary font-headline font-bold">M</span>
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-white group-hover:text-primary transition-colors">
            MEKONG <span className="text-primary">SCRIPTS</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-xs font-bold hover:text-primary transition-colors uppercase tracking-widest">Home</Link>
          <Link href="/store" className="text-xs font-bold hover:text-primary transition-colors uppercase tracking-widest">Store</Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm" className={`text-xs font-bold ${isAdmin ? 'text-primary' : 'hover:text-primary'}`}>
                <Link href={isAdmin ? "/admin/dashboard" : "/account/dashboard"} className="flex items-center gap-2">
                  {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                  {isAdmin ? 'ADMIN PANEL' : 'DASHBOARD'}
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-white/10 p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                      <AvatarFallback className="bg-primary/20 text-primary uppercase font-bold text-xs">
                        {user.email?.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass border-white/10" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">{profile?.name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem asChild className="focus:bg-primary focus:text-background cursor-pointer">
                    <Link href="/account/dashboard">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="focus:bg-primary focus:text-background cursor-pointer text-primary">
                      <Link href="/admin/dashboard">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={handleLogout} className="focus:bg-destructive focus:text-white cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-xs font-bold hover:text-primary transition-colors uppercase tracking-widest">Login</Link>
              <Button asChild className="bg-primary text-background hover:bg-primary/90 neon-glow font-headline text-xs px-6">
                <Link href="/auth/register">GET STARTED</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass absolute top-20 left-0 w-full p-6 flex flex-col gap-4 border-b border-primary/20">
          <Link href="/" className="text-sm font-bold py-2" onClick={() => setIsOpen(false)}>HOME</Link>
          <Link href="/store" className="text-sm font-bold py-2" onClick={() => setIsOpen(false)}>STORE</Link>
          {user ? (
            <>
              <Link href="/account/dashboard" className="text-sm font-bold py-2" onClick={() => setIsOpen(false)}>
                DASHBOARD
              </Link>
              {isAdmin && (
                <Link href="/admin/dashboard" className="text-sm font-bold py-2 text-primary" onClick={() => setIsOpen(false)}>
                  ADMIN PANEL
                </Link>
              )}
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-sm font-bold text-left py-2 text-destructive">
                LOGOUT
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="text-sm font-bold py-2 text-primary" onClick={() => setIsOpen(false)}>
              LOGIN / REGISTER
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

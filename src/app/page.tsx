
'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Cpu, Code, Headset, CreditCard, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-collection";
import { Product } from "@/lib/types";

export default function Home() {
  const { db } = useFirestore();

  const featuredQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'), 
      where('isFeatured', '==', true),
      limit(3)
    );
  }, [db]);

  const { data: featuredProducts, loading } = useCollection<Product>(featuredQuery);

  return (
    <main className="min-h-screen pt-20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30">
          <Image 
            src="https://picsum.photos/seed/cyber1/1920/1080" 
            alt="Hero Background"
            fill
            className="object-cover"
            priority
            data-ai-hint="cyberpunk city"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-pulse-cyan">
            < Zap className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-widest text-primary uppercase">Elite Resource Hub</span>
          </div>
          
          <h1 className="font-headline text-5xl md:text-7xl font-bold mb-6 leading-tight">
            PREMIUM <span className="text-primary neon-text">FIVEM</span> SCRIPTS <br />
            & CUSTOM RESOURCES
          </h1>
          
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg mb-10 font-medium">
            Buy high-quality FiveM scripts, QBCore systems, ESX resources, UI packs, casino systems, shops, jobs, and custom server features.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-10 text-lg bg-primary text-background hover:bg-primary/90 neon-glow font-headline">
              <Link href="/store">BROWSE SCRIPTS</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 text-lg border-secondary text-secondary hover:bg-secondary/10 font-headline">
              <Link href="https://discord.gg/mekong" target="_blank">CONTACT FOR CUSTOM SCRIPT</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Scripts */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-headline text-3xl font-bold mb-2">FEATURED <span className="text-primary">PRODUCTS</span></h2>
            <div className="w-20 h-1 bg-primary rounded-full" />
          </div>
          <Link href="/store" className="text-primary flex items-center gap-2 hover:underline font-bold text-sm tracking-widest">
            VIEW ALL <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : featuredProducts && featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-muted-foreground">No featured scripts available yet.</p>
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-card/20 border-y border-white/5">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold text-center mb-16 uppercase tracking-widest">WHY <span className="text-primary">CHOOSE</span> US</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { icon: Cpu, title: "Optimized Code", desc: "Our scripts are highly optimized to ensure maximum server performance." },
              { icon: Shield, title: "Secure & Clean", desc: "Built with security in mind to prevent exploits and ensure data integrity." },
              { icon: Headset, title: "Expert Support", desc: "Dedicated support team to help you install and configure our resources." }
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-primary transition-all duration-300 neon-glow">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-headline text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/40">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/20 border border-primary flex items-center justify-center">
              <span className="text-primary font-headline font-bold text-xs">M</span>
            </div>
            <span className="font-headline font-bold text-lg tracking-tight text-white">MEKONG <span className="text-primary">SCRIPTS</span></span>
          </div>
          
          <p className="text-xs text-muted-foreground font-medium">
            © 2024 MEKONG SCRIPTS STORE. ALL RIGHTS RESERVED. NOT AFFILIATED WITH ROCKSTAR GAMES.
          </p>
          
          <div className="flex gap-6">
            <Link href="https://discord.gg/mekong" target="_blank" className="text-muted-foreground hover:text-primary transition-colors text-sm">Discord</Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms of Service</Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

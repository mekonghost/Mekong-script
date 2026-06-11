
"use client";

import { use, useState } from "react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Video, ShoppingCart, MessageSquare, ChevronRight, Info, Loader2, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Product } from "@/lib/types";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { db } = useFirestore();
  
  const productRef = useMemoFirebase(() => {
    if (!db || !resolvedParams.id) return null;
    return doc(db, 'products', resolvedParams.id);
  }, [db, resolvedParams.id]);

  const productDoc = useDoc<Product>(productRef);
  const product = productDoc.data;
  const loading = productDoc.loading;

  if (loading) {
    return (
      <main className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </main>
    );
  }

  if (!product && !loading) {
    notFound();
  }

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Navbar />
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground uppercase mb-8">
          <Link href="/store" className="hover:text-primary">STORE</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">{product?.category}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="glass rounded-2xl overflow-hidden relative aspect-video border border-white/10 group">
              {product?.previewImageUrl && (
                <Image 
                  src={product.previewImageUrl} 
                  alt={product.name}
                  fill
                  className="object-cover"
                  data-ai-hint="gaming interface"
                />
              )}
              {product?.videoUrl && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button asChild variant="outline" className="h-16 w-16 rounded-full border-primary bg-primary/20 backdrop-blur-md">
                    <Link href={product.videoUrl} target="_blank">
                      <Video className="w-8 h-8 text-primary" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            <div className="glass p-8 rounded-2xl">
              <h2 className="font-headline text-2xl font-bold mb-6 flex items-center gap-2">
                <Info className="w-6 h-6 text-primary" /> DESCRIPTION
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-10 whitespace-pre-wrap">
                {product?.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-headline text-xl font-bold mb-6 text-primary">KEY FEATURES</h3>
                  <ul className="space-y-4">
                    {product?.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold mb-6 text-secondary">REQUIREMENTS</h3>
                  <ul className="space-y-4">
                    {product?.requirements?.map((req, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-secondary mt-2 shrink-0" />
                        <span className="text-sm font-medium">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Purchase Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass p-8 rounded-2xl border-primary/20 sticky top-32">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="font-headline text-3xl font-bold mb-2 uppercase">{product?.name}</h1>
                  <Badge className="bg-primary/20 text-primary border-primary/30 uppercase">{product?.framework}</Badge>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 mb-8 flex items-baseline justify-between border border-white/5">
                <span className="text-muted-foreground font-bold text-sm tracking-widest uppercase">Price</span>
                <span className="text-4xl font-headline font-bold text-primary neon-text">${product?.price}</span>
              </div>

              <div className="space-y-4">
                <Button asChild size="lg" className="w-full h-14 bg-primary text-background font-headline text-lg hover:bg-primary/90 neon-glow">
                  <Link href={`/checkout?id=${product?.id}`}>
                    <ShoppingCart className="mr-2 w-5 h-5" /> BUY NOW
                  </Link>
                </Button>
                {product?.videoUrl && (
                  <Button asChild variant="outline" size="lg" className="w-full h-14 border-secondary text-secondary hover:bg-secondary/10 font-headline">
                    <Link href={product.videoUrl} target="_blank">
                      <Video className="mr-2 w-5 h-5" /> WATCH PREVIEW
                    </Link>
                  </Button>
                )}
                <Button asChild variant="ghost" className="w-full text-muted-foreground hover:text-white">
                  <Link href="https://discord.gg/mekong" target="_blank">
                    <MessageSquare className="mr-2 w-4 h-4" /> CONTACT DEVELOPER
                  </Link>
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <Zap className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-primary uppercase mb-1">Instant Delivery</h4>
                    <p className="text-[10px] text-muted-foreground leading-tight">Your script will be available for download immediately after payment confirmation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

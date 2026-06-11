"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";
import { ArrowRight, ShoppingCart, ImageOff } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="glass group rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-300 flex flex-col">
      <div className="relative h-48 w-full overflow-hidden bg-black/20">
        {product.previewImageUrl ? (
          <Image 
            src={product.previewImageUrl} 
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            data-ai-hint="gaming interface"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
            <ImageOff className="w-12 h-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
        <Badge className="absolute top-4 left-4 bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
          {product.framework}
        </Badge>
        <div className="absolute bottom-4 right-4 font-headline text-2xl font-bold text-primary neon-text">
          ${product.price}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-headline text-lg font-bold mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {product.description}
        </p>
        
        <div className="mt-auto pt-4 flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1 border-white/10 hover:border-primary">
            <Link href={`/products/${product.id}`}>
              DETAILS
            </Link>
          </Button>
          <Button asChild size="sm" className="flex-1 bg-primary text-background hover:bg-primary/90 neon-glow">
            <Link href={`/products/${product.id}`}>
              BUY NOW
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { useFirestore, useCollection } from "@/firebase";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import { Category, Framework, Product } from "@/lib/types";
import { collection, query } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-collection";

const CATEGORIES: Category[] = [
  'QBCore Scripts', 'ESX Scripts', 'Casino Scripts', 'Job Scripts', 
  'Vehicle Scripts', 'UI / HUD', 'Maps / MLO', 'Custom Scripts'
];

const FRAMEWORKS: Framework[] = ['QBCore', 'ESX', 'Standalone'];

export default function StorePage() {
  const { db } = useFirestore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeFramework, setActiveFramework] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use simple query without orderBy to bypass potential Firestore index generation delays
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'));
  }, [db]);

  const { data: products, loading } = useCollection<Product>(productsQuery);

  // Sorting and filtering handled client-side for maximum resilience and instant updates
  const filteredProducts = (products || [])
    .filter(p => {
      const matchesSearch = (p.name || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !activeCategory || p.category === activeCategory;
      const matchesFramework = !activeFramework || p.framework === activeFramework;
      return matchesSearch && matchesCategory && matchesFramework;
    })
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  if (!mounted) {
    return (
      <main className="min-h-screen pt-32 pb-20">
        <Navbar />
        <div className="container mx-auto px-4">
          <header className="mb-12">
            <h1 className="font-headline text-4xl font-bold mb-4 uppercase tracking-wider">
              SCRIPTS <span className="text-primary">LIBRARY</span>
            </h1>
          </header>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Navbar />
      <div className="container mx-auto px-4">
        <header className="mb-12">
          <h1 className="font-headline text-4xl font-bold mb-4 uppercase tracking-wider">
            SCRIPTS <span className="text-primary">LIBRARY</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            Explore our professional collection of high-performance FiveM resources.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="space-y-8">
            <div className="glass p-6 rounded-xl border border-white/5">
              <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search scripts..." 
                  className="pl-10 bg-black/40 border-white/10 focus:border-primary transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <Filter className="w-3 h-3" /> Framework
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setActiveFramework(null)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${!activeFramework ? 'bg-primary text-background border-primary' : 'border-white/10 text-muted-foreground hover:border-primary/50'}`}
                    >
                      ALL
                    </button>
                    {FRAMEWORKS.map(f => (
                      <button 
                        key={f}
                        onClick={() => setActiveFramework(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activeFramework === f ? 'bg-primary text-background border-primary' : 'border-white/10 text-muted-foreground hover:border-primary/50'}`}
                      >
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-primary mb-4">Categories</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setActiveCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!activeCategory ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-white/5'}`}
                    >
                      All Categories
                    </button>
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeCategory === cat ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-white/5'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-40 flex-col gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-headline text-xs font-bold uppercase tracking-widest text-muted-foreground">Syncing catalog...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="glass rounded-xl p-20 text-center flex flex-col items-center justify-center gap-4">
                <Search className="w-12 h-12 text-muted-foreground opacity-20" />
                <h3 className="text-xl font-headline font-bold">NO SCRIPTS FOUND</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
                <Button variant="outline" onClick={() => { setSearch(""); setActiveCategory(null); setActiveFramework(null); }}>
                  CLEAR ALL FILTERS
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

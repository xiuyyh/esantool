"use client";

import Link from "next/link";
import { useState, useCallback, useMemo, use, useEffect } from "react";
import { Zap, ChevronRight, Terminal, MessageSquare, Layers } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";

export default function Home(props: { params: Promise<any> }) {
  const params = use(props.params);
  const [year, setYear] = useState<number | null>(null);
  
  const db = useFirestore();
  const { data: products, loading } = useCollection(db ? collection(db, "groups") : null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const headlineMain = "Buy";
  const headlineAccent = "High quality private TG groups";
  const fullHeadline = `${headlineMain} ${headlineAccent}`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Moving Ad Section (Ticker) */}
      <section className="py-2.5 bg-accent/5 border-b border-white/5 overflow-hidden whitespace-nowrap relative">
        <div className="flex animate-marquee items-center gap-12 w-max">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="font-headline text-sm font-bold uppercase tracking-tight text-foreground/80">
                {headlineMain}
              </span>
              <span className="font-headline text-sm font-bold uppercase tracking-tight text-accent">
                {headlineAccent}
              </span>
              <Terminal className="h-3.5 w-3.5 text-accent/40" />
            </div>
          ))}
        </div>
      </section>

      {/* Market Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h2 className="font-headline text-3xl font-bold mb-2">
                Premium Marketplace
              </h2>
              <p className="text-muted-foreground">Explore high-performance Telegram communities.</p>
            </div>
            <Link href="/products" className="text-accent text-sm font-bold flex items-center hover:opacity-80 transition-opacity">
              Explore All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-20">
                <p className="animate-pulse font-headline uppercase tracking-widest text-accent">Loading Marketplace...</p>
              </div>
            ) : products.length > 0 ? (
              products.slice(0, 6).map((p: any) => (
                <ProductCard 
                  key={p.id} 
                  id={p.id}
                  title={p.title}
                  country={p.country}
                  price={p.price}
                  description={p.description}
                  imageUrls={p.imageUrls || [p.imageUrl]}
                  imageHint="telegram network"
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <Terminal className="h-12 w-12 mb-4" />
                <p className="text-sm uppercase tracking-widest font-bold">No groups available yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Populate listings from the Command Center.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="mt-auto py-12 border-t border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-accent/10 p-1.5 rounded-md">
              <Terminal className="h-4 w-4 text-accent" />
            </div>
            <span className="font-headline font-bold text-sm tracking-widest text-foreground uppercase">ESAN TOOLS</span>
          </div>
          <p className="mb-2">Exclusive Telegram private group marketplace.</p>
          © {year || "..."} Esan Tools. All rights reserved.
        </div>
      </footer>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { Globe, Terminal } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useFirestore, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  
  const db = useFirestore();
  const { data: allProducts, loading } = useCollection(db ? collection(db, "groups") : null);
  const { data: countries } = useCollection(db ? collection(db, "countries") : null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const filteredProducts = allProducts.filter((p: any) => {
    const matchesCountry = !selectedCountry || p.country === selectedCountry;
    return matchesCountry;
  });

  const headlineMain = "Shop";
  const headlineAccent = "Premium Private Groups";

  return (
    <div className="flex flex-col flex-1 w-full min-w-0">
      {/* Ticker Section - Added pointer-events-none to prevent interception on desktop */}
      <section className="py-2.5 bg-accent/5 border-b border-white/5 overflow-hidden whitespace-nowrap relative w-full pointer-events-none select-none z-10">
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

      <div className="max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full min-w-0 mx-auto">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
            <div className="space-y-2">
              <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight">Marketplace</h1>
              <p className="text-muted-foreground text-base sm:text-lg">Browse available private groups by region.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-full sm:w-64">
              <Select 
                value={selectedCountry || "all"} 
                onValueChange={(val) => setSelectedCountry(val === "all" ? null : val)}
              >
                <SelectTrigger className="glass-card border-white/10 h-11">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-accent" />
                    <SelectValue placeholder="Select Region" />
                  </div>
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="all" className="text-xs uppercase font-bold">All Regions</SelectItem>
                  {countries.map((c: any) => (
                    <SelectItem key={c.id} value={c.name} className="text-xs uppercase font-bold">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="h-10 w-10 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="font-headline uppercase tracking-widest text-xs text-accent font-bold">Loading Marketplace Assets...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredProducts.map((p: any) => (
                <ProductCard 
                  key={p.id} 
                  id={p.id}
                  title={p.title}
                  country={p.country}
                  price={p.price}
                  description={p.description}
                  imageUrls={p.imageUrls || []}
                  imageHint="network data"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 glass-card rounded-3xl border-dashed border-2 border-white/10 text-center px-6">
              <Globe className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-2xl font-bold font-headline uppercase tracking-tight">Region Silent</h3>
              <p className="text-muted-foreground mt-2 text-base">No active nodes found in this region.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-auto py-12 border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-screen-2xl px-4 sm:px-6 lg:px-8 text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-accent/10 p-2.5 rounded-xl">
              <Terminal className="h-5 w-5 text-accent" />
            </div>
            <span className="font-headline font-bold text-lg tracking-tighter text-foreground">ESAN TOOLS</span>
          </div>
          <p className="mb-2 opacity-60">Private Group Marketplace</p>
          <p>© {year || "..."} Esan Tools. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

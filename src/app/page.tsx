
"use client";

import { useState, useEffect } from "react";
import { Search, Globe, Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { useFirestore, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  
  const db = useFirestore();
  const { data: allProducts, loading } = useCollection(db ? collection(db, "groups") : null);
  const { data: countries } = useCollection(db ? collection(db, "countries") : null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const filteredProducts = allProducts.filter((p: any) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = !selectedCountry || p.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const headlineMain = "Shop";
  const headlineAccent = "Premium Private Groups";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Ticker Section */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
            <div className="space-y-2">
              <h1 className="font-headline text-4xl font-bold tracking-tight">Marketplace</h1>
              <p className="text-muted-foreground text-base">Browse available private groups by region.</p>
            </div>
            
            <div className="relative w-full sm:w-80 lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search groups..." 
                className="pl-12 h-11 glass-card border-white/10 focus:border-accent/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              variant={!selectedCountry ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCountry(null)}
              className="text-[10px] uppercase font-bold px-4"
            >
              All Regions
            </Button>
            {countries.map((c: any) => (
              <Button 
                key={c.id}
                variant={selectedCountry === c.name ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedCountry(c.name)}
                className="text-[10px] uppercase font-bold gap-1.5 px-4"
              >
                <Globe className="h-3 w-3" />
                {c.name}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="font-headline uppercase tracking-widest text-[10px] text-accent font-bold">Loading Marketplace...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <Search className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-bold font-headline uppercase tracking-tight">No Groups Found</h3>
              <p className="text-muted-foreground mt-1 text-sm">Try a different search or region.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-auto py-10 border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-accent/10 p-2 rounded-lg">
              <Terminal className="h-4 w-4 text-accent" />
            </div>
            <span className="font-headline font-bold text-sm tracking-tighter text-foreground">ESAN TOOLS</span>
          </div>
          <p className="mb-2 opacity-60">Premium Private Group Marketplace</p>
          <p>© {year || "..."} Esan Tools. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

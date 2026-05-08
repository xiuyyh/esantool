"use client";

import { useState, useEffect } from "react";
import { Globe, Terminal, Cpu, Database, Network } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
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
  const groupsQuery = useMemoFirebase(() => db ? collection(db, "groups") : null, [db]);
  const { data: allProducts, loading } = useCollection(groupsQuery);
  
  const countriesQuery = useMemoFirebase(() => db ? collection(db, "countries") : null, [db]);
  const { data: countries } = useCollection(countriesQuery);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const filteredProducts = allProducts.filter((p: any) => {
    const matchesCountry = !selectedCountry || p.country === selectedCountry;
    return matchesCountry;
  });

  return (
    <div className="flex flex-col flex-1 w-full min-w-0">
      <section className="py-3 bg-black/40 border-b border-accent/20 overflow-hidden whitespace-nowrap relative w-full pointer-events-none select-none z-10">
        <div className="flex animate-marquee items-center gap-16 w-max">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-accent/40">
                System Status: Online
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
                Security: {i % 2 === 0 ? "Verified" : "Active"}
              </span>
              <Cpu className="h-3 w-3 text-accent/20" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-accent/40">
                Location: {countries[i % countries.length]?.name || "Global"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-screen-2xl px-6 sm:px-10 py-12 flex-1 w-full min-w-0 mx-auto">
        <div className="flex flex-col space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-accent/10 pb-10 relative">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-accent/60 font-mono text-xs tracking-[0.4em] uppercase">
                <Network className="h-4 w-4" />
                Store Listings
              </div>
              <h1 className="font-headline text-5xl sm:text-7xl font-bold tracking-tighter uppercase text-white">
                Marketplace
              </h1>
              <p className="text-muted-foreground text-sm uppercase font-mono tracking-widest max-w-xl">
                Browse and buy access to private Telegram groups and regional communities.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase text-accent/40 tracking-widest text-right">Filter By Region</span>
              <Select 
                value={selectedCountry || "all"} 
                onValueChange={(val) => setSelectedCountry(val === "all" ? null : val)}
              >
                <SelectTrigger className="glass-card border-accent/20 h-12 w-full sm:w-64 rounded-none font-mono text-[10px] uppercase tracking-widest text-accent">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    <SelectValue placeholder="Select Country" />
                  </div>
                </SelectTrigger>
                <SelectContent className="glass-card border-accent/20 rounded-none">
                  <SelectItem value="all" className="text-[10px] uppercase font-mono font-bold py-3">All Regions</SelectItem>
                  {countries.map((c: any) => (
                    <SelectItem key={c.id} value={c.name} className="text-[10px] uppercase font-mono font-bold py-3">
                      {c.name.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
              <div className="h-16 w-16 border-2 border-accent border-t-transparent rounded-none animate-spin"></div>
              <p className="font-mono uppercase tracking-[0.5em] text-[10px] text-accent animate-pulse">Loading Groups...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((p: any) => (
                <ProductCard 
                  key={p.id} 
                  id={p.id}
                  title={p.title}
                  country={p.country}
                  price={p.price}
                  description={p.description}
                  imageUrls={p.imageUrls || []}
                  imageHint="group preview"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 glass-card rounded-none border-dashed border-2 border-accent/10 text-center px-6 tech-border">
              <Database className="h-12 w-12 text-accent/20 mb-6" />
              <h3 className="text-2xl font-bold font-headline uppercase tracking-tighter text-white">No Groups Found</h3>
              <p className="text-muted-foreground mt-2 text-sm font-mono tracking-widest uppercase opacity-60">There are no groups available in this region yet.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-auto py-16 border-t border-accent/10 bg-black/40 backdrop-blur-md">
        <div className="max-w-screen-2xl px-10 text-center mx-auto">
          <div className="flex items-center justify-center space-x-4 mb-10">
            <div className="bg-accent/10 p-4 border border-accent/20">
              <Terminal className="h-6 w-6 text-accent" />
            </div>
            <div className="text-left">
              <span className="font-headline font-bold text-2xl tracking-tighter text-white block leading-none">ESAN TOOLS</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-accent/60">Professional Digital Service</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 opacity-40 font-mono text-[10px] uppercase tracking-[0.2em]">
            <p>All transactions are secure. Support available 24/7.</p>
            <p>© {year || "..."} ESAN TOOLS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

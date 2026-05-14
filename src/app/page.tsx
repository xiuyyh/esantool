"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Globe, Terminal, Cpu, Database, Network, Search, Check, Crown, Zap, Info, Monitor, HardDrive } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function HomeContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "bundles" | "exclusive">("all");
  const [year, setYear] = useState<number | null>(null);
  
  const db = useFirestore();
  const groupsQuery = useMemoFirebase(() => db ? collection(db, "groups") : null, [db]);
  const { data: allProducts, loading: groupsLoading } = useCollection(groupsQuery);

  const countriesQuery = useMemoFirebase(() => db ? collection(db, "countries") : null, [db]);
  const { data: countries } = useCollection(countriesQuery);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (tabParam && ["all", "bundles", "exclusive"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const filteredCountries = useMemo(() => {
    return countries.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [countries, searchTerm]);

  const filteredProducts = allProducts.filter((p: any) => {
    const matchesCountry = !selectedCountry || p.country === selectedCountry;
    const isAvailable = p.type !== 'exclusive' || !p.isSold;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'bundles' && (p.type === 'bundle' || !p.type)) ||
      (activeTab === 'exclusive' && p.type === 'exclusive');

    return matchesCountry && isAvailable && matchesTab;
  });

  return (
    <div className="flex flex-col flex-1 w-full min-w-0">
      <section className="py-3 bg-black/60 border-b border-accent/30 overflow-hidden whitespace-nowrap relative w-full pointer-events-none select-none z-10">
        <div className="flex animate-marquee items-center gap-16 w-max">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
                System Status: Online
              </span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-white">
                Delivery: Instant
              </span>
              <Cpu className="h-4 w-4 text-accent" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
                Support: Active
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-screen-2xl px-6 sm:px-10 py-12 flex-1 w-full min-w-0 mx-auto">
        <div className="flex flex-col space-y-12">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-accent/20 pb-10 relative">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-accent font-mono text-xs tracking-[0.4em] uppercase font-bold">
                <Network className="h-5 w-5" />
                Trusted Group Access
              </div>
              <h1 className="font-headline text-5xl sm:text-7xl font-bold tracking-tighter uppercase text-white drop-shadow-lg">
                ESAN SHOP
              </h1>
              <p className="text-white text-base font-medium tracking-wide max-w-xl leading-relaxed">
                Private Telegram group links (singles + bundles). Get instant access to exclusive communities. Fast, private, and reliable.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              <div className="space-y-3 w-full sm:w-auto">
                <span className="font-mono text-[11px] uppercase text-accent tracking-widest font-bold">Category</span>
                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
                   <TabsList className="bg-white/10 h-12 border border-white/20 p-1">
                      <TabsTrigger value="all" className="uppercase text-[10px] font-bold tracking-widest text-white data-[state=active]:bg-accent data-[state=active]:text-background">All</TabsTrigger>
                      <TabsTrigger value="bundles" className="uppercase text-[10px] font-bold tracking-widest text-white data-[state=active]:bg-accent data-[state=active]:text-background">Bundles</TabsTrigger>
                      <TabsTrigger value="exclusive" className="uppercase text-[10px] font-bold tracking-widest text-white data-[state=active]:bg-accent data-[state=active]:text-background">
                        <Crown className="h-3.5 w-3.5 mr-1.5" /> Single (Exclusive)
                      </TabsTrigger>
                   </TabsList>
                </Tabs>
              </div>

              <div className="space-y-3 w-full sm:w-auto">
                <span className="font-mono text-[11px] uppercase text-accent tracking-widest text-left block font-bold">Region</span>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="glass-card border-accent/40 h-12 w-full sm:w-64 rounded-none font-mono text-[11px] uppercase tracking-widest text-accent justify-between hover:bg-accent/10 font-bold"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {selectedCountry || "All Countries"}
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="glass-card border-accent/40 rounded-none p-2 w-full sm:w-64" align="end">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-accent/20 mb-2">
                      <Search className="h-4 w-4 text-accent" />
                      <Input 
                        placeholder="Search Country..." 
                        className="h-9 border-none bg-transparent font-mono text-[11px] uppercase tracking-widest focus-visible:ring-0 p-0 text-white placeholder:text-white/40"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <ScrollArea className="h-[200px]">
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full justify-start text-[11px] uppercase font-mono py-2.5 h-auto rounded-none mb-1 font-bold",
                          !selectedCountry ? "bg-accent text-background" : "text-white hover:bg-accent/10 hover:text-accent"
                        )}
                        onClick={() => {
                          setSelectedCountry(null);
                          setIsPopoverOpen(false);
                        }}
                      >
                        All Countries
                      </Button>
                      {filteredCountries.map((c: any) => (
                        <Button
                          key={c.id}
                          variant="ghost"
                          className={cn(
                            "w-full justify-between text-[11px] uppercase font-mono py-2.5 h-auto rounded-none mb-1 text-left font-bold",
                            selectedCountry === c.name ? "bg-accent text-background" : "text-white hover:bg-accent/10 hover:text-accent"
                          )}
                          onClick={() => {
                            setSelectedCountry(c.name);
                            setIsPopoverOpen(false);
                          }}
                        >
                          {c.name}
                          {selectedCountry === c.name && <Check className="h-4 w-4" />}
                        </Button>
                      ))}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="p-5 bg-accent/10 border border-accent/40 flex items-center gap-4 shadow-lg shadow-accent/5">
             <Info className="h-5 w-5 text-accent shrink-0" />
             <p className="text-[11px] sm:text-xs uppercase font-bold tracking-widest text-accent leading-relaxed">
                Notice: Single groups marked as <span className="underline decoration-2">Exclusive</span> are unique and will be permanently removed from the shop after the first purchase.
             </p>
          </div>

          {groupsLoading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
              <div className="h-16 w-16 border-4 border-accent border-t-transparent rounded-none animate-spin"></div>
              <p className="font-mono uppercase tracking-[0.5em] text-xs text-accent animate-pulse font-bold">Opening Shop...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((p: any) => (
                <ProductCard 
                  key={p.id} 
                  id={p.id}
                  title={p.title}
                  country={p.country}
                  price={p.price}
                  salesCount={p.salesCount || 0}
                  description={p.description}
                  imageUrls={p.imageUrls || []}
                  imageHint="group links"
                />
              ))}
            </div>
          )}
          
          {!groupsLoading && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 glass-card rounded-none border-dashed border-2 border-accent/20 text-center px-6 tech-border">
              <Database className="h-14 w-14 text-accent mb-6" />
              <h3 className="text-3xl font-bold font-headline uppercase tracking-tighter text-white">No Results</h3>
              <p className="text-white mt-2 text-sm font-mono tracking-widest uppercase font-bold">Try selecting a different category or country.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-auto py-20 border-t border-accent/20 bg-black/60 backdrop-blur-xl">
        <div className="max-w-screen-2xl px-10 text-center mx-auto">
          <div className="flex items-center justify-center space-x-5 mb-12">
            <div className="bg-accent/20 p-4 border border-accent/40 shadow-lg shadow-accent/5">
              <Terminal className="h-7 w-7 text-accent" />
            </div>
            <div className="text-left">
              <span className="font-headline font-bold text-3xl tracking-tighter text-white block leading-none">ESAN TOOLS</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent font-bold">Digital Group Marketplace</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] font-bold text-white/60">
            <p className="text-accent">Instant Delivery Active.</p>
            <p>© {year || "..."} ESAN TOOLS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-40 space-y-6">
        <div className="h-16 w-16 border-4 border-accent border-t-transparent rounded-none animate-spin"></div>
        <p className="font-mono uppercase tracking-[0.5em] text-xs text-accent animate-pulse font-bold">Loading...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
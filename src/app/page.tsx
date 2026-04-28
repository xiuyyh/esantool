"use client";

import Link from "next/link";
import { useState, useCallback, useMemo, use } from "react";
import { Zap, ChevronRight, Terminal, MessageSquare, Target, Cpu, TrendingUp, Layers } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Home(props: { params: Promise<any> }) {
  const params = use(props.params);
  const [magic, setMagic] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const triggerMagic = useCallback(() => {
    if (magic) return;
    setMagic(true);
    setTimeout(() => setMagic(false), 1000);
  }, [magic]);

  const categories = [
    { name: "All", icon: Layers },
    { name: "Crypto", icon: Target },
    { name: "Tech", icon: Cpu },
    { name: "Alpha", icon: Zap },
    { name: "DeFi", icon: TrendingUp },
  ];

  const products = [
    {
      id: "tg-1",
      title: "Alpha Crypto HQ",
      category: "Crypto",
      price: 15000,
      description: "Exclusive high-signal crypto discussions and early alpha leaks.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'telegram-service')?.imageUrl || "",
      imageHint: "telegram network"
    },
    {
      id: "tg-2",
      title: "Whale Alerts Insider",
      category: "Crypto",
      price: 25000,
      description: "Real-time tracking of large wallet movements with expert analysis.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'telegram-service')?.imageUrl || "",
      imageHint: "telegram network"
    },
    {
      id: "tg-3",
      title: "DeFi Degen Hub",
      category: "DeFi",
      price: 10000,
      description: "The primary source for new DeFi projects and yield farming strategies.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'telegram-service')?.imageUrl || "",
      imageHint: "telegram network"
    },
    {
      id: "tg-4",
      title: "Tech Alpha Network",
      category: "Tech",
      price: 20000,
      description: "Private discussions on emerging technologies and startup opportunities.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'telegram-service')?.imageUrl || "",
      imageHint: "telegram network"
    },
    {
      id: "tg-5",
      title: "Bitcoin Maxi Club",
      category: "Crypto",
      price: 12000,
      description: "Hardcore BTC discussions and long-term accumulation strategies.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'telegram-service')?.imageUrl || "",
      imageHint: "telegram network"
    },
    {
      id: "tg-6",
      title: "Venture Capital Leaks",
      category: "Alpha",
      price: 50000,
      description: "Insider info on upcoming funding rounds and private sales.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'telegram-service')?.imageUrl || "",
      imageHint: "telegram network"
    }
  ];

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const headlineMain = "Buy";
  const headlineAccent = "High quality private TG groups";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section 
        className="py-32 relative overflow-hidden cursor-pointer select-none"
        onClick={triggerMagic}
      >
        {/* Decorative Background Icons */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
          <MessageSquare 
            className={cn(
              "absolute top-10 left-[10%] h-32 w-32 rotate-12 transition-all duration-700",
              magic && "rotate-[360deg] scale-150 text-accent opacity-40"
            )} 
          />
          <MessageSquare 
            className={cn(
              "absolute bottom-10 right-[15%] h-24 w-24 -rotate-12 text-accent transition-all duration-700",
              magic && "rotate-[-360deg] scale-150 text-white opacity-40"
            )} 
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="font-headline text-5xl sm:text-7xl font-bold text-foreground tracking-tight leading-tight flex flex-wrap justify-center gap-x-[0.3em]">
            <span className="inline-flex">
              {headlineMain.split("").map((char, i) => (
                <span
                  key={`main-${i}`}
                  className={cn(
                    "inline-block animate-fall-in opacity-0 hover:text-accent hover:-translate-y-6 hover:scale-110 transition-all duration-300",
                    magic && "animate-bounce text-accent"
                  )}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {char}
                </span>
              ))}
            </span>

            <span className="inline-flex flex-wrap justify-center gap-x-[0.2em] text-accent">
              {headlineAccent.split(" ").map((word, wordIdx) => (
                <span key={`word-${wordIdx}`} className="inline-flex">
                  {word.split("").map((char, charIdx) => (
                    <span
                      key={`char-${wordIdx}-${charIdx}`}
                      className={cn(
                        "inline-block animate-fall-in opacity-0 hover:text-white hover:-translate-y-6 hover:rotate-12 hover:scale-110 transition-all duration-300",
                        magic && "animate-bounce text-white"
                      )}
                      style={{ animationDelay: `${(headlineMain.length + wordIdx * 3 + charIdx) * 0.04}s` }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              ))}
            </span>
          </h1>
        </div>
      </section>

      {/* Market Section */}
      <section className="py-16 border-t border-white/5">
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

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-3 mb-12">
            {categories.map((cat) => (
              <Button
                key={cat.name}
                variant={activeCategory === cat.name ? "default" : "outline"}
                className={cn(
                  "h-12 px-6 rounded-full border-white/10 font-bold transition-all",
                  activeCategory === cat.name ? "bg-accent text-black scale-105" : "hover:border-accent/50"
                )}
                onClick={() => setActiveCategory(cat.name)}
              >
                <cat.icon className={cn("h-4 w-4 mr-2", activeCategory === cat.name ? "text-black" : "text-accent")} />
                {cat.name}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                <Terminal className="h-12 w-12 mb-4" />
                <p>No groups available in this category yet.</p>
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
          © {new Date().getFullYear()} Esan Tools. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

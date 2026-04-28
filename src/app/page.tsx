
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
  const [magic, setMagic] = useState(false);
  const [year, setYear] = useState<number | null>(null);
  
  const db = useFirestore();
  const { data: products, loading } = useCollection(db ? collection(db, "groups") : null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const triggerMagic = useCallback(() => {
    if (magic) return;
    setMagic(true);
    setTimeout(() => setMagic(false), 1000);
  }, [magic]);

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
                  category={p.category}
                  price={p.price}
                  description={p.description}
                  imageUrls={p.imageUrls || [p.imageUrl]}
                  imageHint="telegram network"
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                <Terminal className="h-12 w-12 mb-4" />
                <p>No groups available yet. Add them from the admin panel.</p>
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

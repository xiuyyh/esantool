"use client";

import Link from "next/link";
import { Zap, ChevronRight, Terminal, MessageSquare } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const products = [
    {
      id: "tg-1",
      title: "Alpha Crypto HQ",
      category: "Private Group",
      price: 24.99,
      description: "Exclusive high-signal crypto discussions and early alpha leaks.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'telegram-service')?.imageUrl || "",
      imageHint: "telegram network"
    },
    {
      id: "tg-2",
      title: "Whale Alerts Insider",
      category: "Private Group",
      price: 49.00,
      description: "Real-time tracking of large wallet movements with expert analysis.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'telegram-service')?.imageUrl || "",
      imageHint: "telegram network"
    },
    {
      id: "tg-3",
      title: "DeFi Degen Hub",
      category: "Private Group",
      price: 15.00,
      description: "The primary source for new DeFi projects and yield farming strategies.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'telegram-service')?.imageUrl || "",
      imageHint: "telegram network"
    },
    {
      id: "tg-4",
      title: "Tech Alpha Network",
      category: "Private Group",
      price: 35.00,
      description: "Private discussions on emerging technologies and startup opportunities.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'telegram-service')?.imageUrl || "",
      imageHint: "telegram network"
    }
  ];

  const headlineMain = "Buy";
  const headlineAccent = "High quality private TG groups";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Decorative Floating Icons */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <MessageSquare className="absolute top-10 left-[10%] h-32 w-32 rotate-12" />
          <MessageSquare className="absolute bottom-10 right-[15%] h-24 w-24 -rotate-12 text-accent" />
          <MessageSquare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 opacity-20" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex justify-center mb-10">
            <div className="bg-accent/10 p-5 rounded-2xl border border-accent/20 animate-bounce transition-transform duration-700">
              <MessageSquare className="h-14 w-14 text-accent" />
            </div>
          </div>
          
          <h1 className="font-headline text-5xl sm:text-7xl font-bold text-foreground tracking-tight leading-tight flex flex-wrap justify-center gap-x-[0.3em]">
            {/* "Buy" */}
            <span className="inline-flex">
              {headlineMain.split("").map((char, i) => (
                <span
                  key={`main-${i}`}
                  className="inline-block animate-fall-in opacity-0 hover:text-accent hover:-translate-y-6 hover:scale-110 transition-all duration-300 cursor-default"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {char}
                </span>
              ))}
            </span>

            {/* "High quality private TG groups" */}
            <span className="inline-flex flex-wrap justify-center gap-x-[0.2em] text-accent">
              {headlineAccent.split(" ").map((word, wordIdx) => (
                <span key={`word-${wordIdx}`} className="inline-flex">
                  {word.split("").map((char, charIdx) => (
                    <span
                      key={`char-${wordIdx}-${charIdx}`}
                      className="inline-block animate-fall-in opacity-0 hover:text-white hover:-translate-y-6 hover:rotate-12 hover:scale-110 transition-all duration-300 cursor-default"
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

      {/* Featured Products */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-headline text-2xl font-bold flex items-center">
              <Zap className="h-6 w-6 mr-2 text-accent fill-accent" />
              Featured Groups
            </h2>
            <Link href="/products" className="text-accent text-sm font-bold flex items-center hover:opacity-80 transition-opacity">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
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

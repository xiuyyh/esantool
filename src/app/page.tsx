"use client";

import Link from "next/link";
import { Zap, ChevronRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-headline text-5xl sm:text-7xl font-bold text-foreground mb-6 tracking-tight">
            Buy <span className="text-accent">High quality private TG groups</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-lg">
            Instant access to elite Telegram communities. Vetted, high-signal, and exclusively private.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 px-10 py-6 text-lg font-bold shadow-[0_0_20px_rgba(234,255,0,0.2)]">
              Browse Groups
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products - Compact Grid */}
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
            <Terminal className="h-5 w-5 text-accent" />
            <span className="font-headline font-bold text-sm tracking-widest text-foreground">ESAN TOOLS</span>
          </div>
          <p className="mb-2">Premium digital asset marketplace.</p>
          © {new Date().getFullYear()} Esan Tools. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

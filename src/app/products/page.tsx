"use client";

import { useState } from "react";
import { Search, Filter, SlidersHorizontal, Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const allProducts = [
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
    },
    {
      id: "tg-5",
      title: "Growth Hackers Circle",
      category: "Private Group",
      price: 29.99,
      description: "Marketing strategies and growth hacks for SaaS founders.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'telegram-service')?.imageUrl || "",
      imageHint: "telegram network"
    },
    {
      id: "tg-6",
      title: "NFT Alpha Squad",
      category: "Private Group",
      price: 19.99,
      description: "Upcoming NFT drops, whitelists, and market trends.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'telegram-service')?.imageUrl || "",
      imageHint: "telegram network"
    }
  ];

  const filteredProducts = allProducts.filter(p => {
    return p.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <h1 className="font-headline text-5xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-muted-foreground text-lg">Browse our exclusive selection of private Telegram communities.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-80 lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search groups..." 
                className="pl-12 h-12 glass-card border-white/10 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-12 border-white/10 px-5">
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 glass-card rounded-3xl border-dashed border-2 border-white/10">
            <Terminal className="h-16 w-16 text-muted-foreground mb-6 opacity-20" />
            <h3 className="text-2xl font-bold">No groups found</h3>
            <p className="text-muted-foreground mt-2">Try searching for a different keyword.</p>
            <Button 
              variant="link" 
              className="mt-6 text-accent text-lg"
              onClick={() => setSearchQuery("")}
            >
              Show all groups
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

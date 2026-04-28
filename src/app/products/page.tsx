
"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { useFirestore, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const db = useFirestore();
  const { data: allProducts, loading } = useCollection(db ? collection(db, "groups") : null);

  const filteredProducts = allProducts.filter((p: any) => {
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
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <p className="animate-pulse font-headline uppercase tracking-widest text-accent">Loading Marketplace Assets...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProducts.map((p: any) => (
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
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 glass-card rounded-3xl border-dashed border-2 border-white/10">
            <Terminal className="h-16 w-16 text-muted-foreground mb-6 opacity-20" />
            <h3 className="text-2xl font-bold">No groups found</h3>
            <p className="text-muted-foreground mt-2">Try searching for a different keyword or check back later.</p>
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

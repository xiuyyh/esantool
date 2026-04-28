
"use client";

import { useState } from "react";
import { Search, Globe, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  const db = useFirestore();
  const groupsQuery = useMemoFirebase(() => db ? collection(db, "groups") : null, [db]);
  const { data: allProducts, loading } = useCollection(groupsQuery);
  
  const countriesQuery = useMemoFirebase(() => db ? collection(db, "countries") : null, [db]);
  const { data: countries } = useCollection(countriesQuery);

  const filteredProducts = allProducts.filter((p: any) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = !selectedCountry || p.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <h1 className="font-headline text-5xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-muted-foreground text-lg">Acquire entry into elite private regions.</p>
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
          <div className="flex items-center justify-center py-32">
            <p className="animate-pulse font-headline uppercase tracking-widest text-accent">Decoding Marketplace Assets...</p>
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
          <div className="flex flex-col items-center justify-center py-32 glass-card rounded-3xl border-dashed border-2 border-white/10 text-center">
            <h3 className="text-2xl font-bold font-headline uppercase tracking-tight">Region Silent</h3>
            <p className="text-muted-foreground mt-2">No active nodes found in this region.</p>
          </div>
        )}
      </div>
    </div>
  );
}

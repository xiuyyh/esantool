
"use client";

import { useState } from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  const allProducts = [
    {
      id: "1",
      title: "Premium Telegram HQ Group Link",
      category: "Telegram",
      price: 24.99,
      description: "Exclusive access to private high-traffic crypto discussion groups.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'telegram-service')?.imageUrl || "",
      imageHint: "telegram network"
    },
    {
      id: "2",
      title: "Aged Social Accounts Log",
      category: "Logs",
      price: 45.00,
      description: "Verified accounts with established activity for professional marketing.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'social-logs')?.imageUrl || "",
      imageHint: "social dashboard"
    },
    {
      id: "3",
      title: "Gigabit VPN Access Log",
      category: "VPN",
      price: 12.50,
      description: "Secure, high-speed tunnel access for any location. Instant delivery.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'vpn-logs')?.imageUrl || "",
      imageHint: "vpn security"
    },
    {
      id: "4",
      title: "Custom SaaS Landing Page",
      category: "Web Dev",
      price: 499.00,
      description: "Modern, high-converting React-based landing page for your startup.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'web-dev')?.imageUrl || "",
      imageHint: "coding development"
    },
    {
      id: "5",
      title: "Netflix Premium Account Logs",
      category: "Logs",
      price: 5.00,
      description: "High quality streaming accounts with guaranteed uptime.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'social-logs')?.imageUrl || "",
      imageHint: "social dashboard"
    },
    {
      id: "6",
      title: "Telegram Bot Development",
      category: "Web Dev",
      price: 150.00,
      description: "Automate your business with custom built Telegram bots.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'web-dev')?.imageUrl || "",
      imageHint: "coding development"
    }
  ];

  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || p.category.toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-headline text-4xl font-bold">Marketplace</h1>
            <p className="text-muted-foreground">Find the perfect digital tool or service for your needs.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 glass-card border-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select onValueChange={setCategory}>
                <SelectTrigger className="w-[140px] glass-card border-white/10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="logs">Logs</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="vpn">VPN</SelectItem>
                  <SelectItem value="web dev">Web Dev</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-white/10">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 glass-card rounded-2xl border-dashed">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            <Button 
              variant="link" 
              className="mt-4 text-accent"
              onClick={() => { setSearchQuery(""); setCategory("all"); }}
            >
              Reset all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

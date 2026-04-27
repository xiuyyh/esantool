
"use client";

import Link from "next/link";
import { Terminal, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const products = [
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
      description: "Secure, high-speed tunnel access for any location.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'vpn-logs')?.imageUrl || "",
      imageHint: "vpn security"
    },
    {
      id: "4",
      title: "Custom SaaS Landing Page",
      category: "Web Dev",
      price: 499.00,
      description: "Modern, high-converting React-based landing page.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'web-dev')?.imageUrl || "",
      imageHint: "coding development"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-headline text-4xl sm:text-6xl font-bold text-foreground mb-6">
            Buy <span className="text-accent">High quality private TG groups</span>
          </h1>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Browse All
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products - Compact Grid */}
      <section className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline text-xl font-bold flex items-center">
              <Zap className="h-5 w-5 mr-2 text-accent" />
              Latest Drops
            </h2>
            <Link href="/products" className="text-accent text-sm flex items-center hover:underline">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-auto py-8 border-t border-white/5 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Terminal className="h-4 w-4 text-accent" />
            <span className="font-headline font-bold">ESAN TOOLS</span>
          </div>
          © {new Date().getFullYear()} Esan Tools.
        </div>
      </footer>
    </div>
  );
}

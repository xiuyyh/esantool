
"use client";

import Link from "next/link";
import { Terminal, Shield, Zap, Globe, ChevronRight } from "lucide-react";
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
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-accent text-sm font-medium">
                <Zap className="h-4 w-4" />
                <span>v2.0 Marketplace Now Live</span>
              </div>
              <h1 className="font-headline text-5xl sm:text-7xl font-bold text-foreground leading-tight">
                Digital Sophistication. <span className="text-accent">Unmatched Access.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Securely acquire high-quality digital assets, logs, and bespoke development services tailored for the modern technological landscape.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                  Browse Marketplace
                </Button>
                <Button size="lg" variant="outline" className="border-white/10 hover:border-accent text-lg px-8">
                  View Services
                </Button>
              </div>
              <div className="flex items-center space-x-8 pt-4">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold font-headline">5k+</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Active Buyers</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold font-headline">24/7</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Live Support</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold font-headline">100%</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Secure Delivery</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-2xl blur opacity-25"></div>
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-square">
                <img 
                  src={PlaceHolderImages.find(img => img.id === 'hero-image')?.imageUrl} 
                  alt="Digital Grid" 
                  className="object-cover w-full h-full opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 p-6 glass-card rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                      <Terminal className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">System Status: Optimal</h4>
                      <p className="text-xs text-muted-foreground">All delivery channels online</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Terminal, label: "Logs & Data", color: "text-accent" },
              { icon: Shield, label: "Security VPN", color: "text-primary" },
              { icon: Globe, label: "Web Services", color: "text-accent" },
              { icon: Zap, label: "Telegram Tools", color: "text-primary" },
            ].map((cat, i) => (
              <div key={i} className="flex items-center space-x-3 p-4 glass-card rounded-lg hover:bg-white/10 transition-colors cursor-pointer group">
                <cat.icon className={`h-6 w-6 ${cat.color} group-hover:scale-110 transition-transform`} />
                <span className="font-medium text-sm">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-bold">Newest Additions</h2>
              <p className="text-muted-foreground">Latest verified drops in our marketplace.</p>
            </div>
            <Link href="/products" className="text-accent flex items-center hover:underline">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-white/5 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center space-x-2">
                <Terminal className="h-6 w-6 text-accent" />
                <span className="font-headline text-lg font-bold">ESAN TOOLS</span>
              </div>
              <p className="text-muted-foreground max-w-sm">
                The premier destination for high-quality digital assets and development services. Built with security and performance in mind.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">Marketplace</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/products" className="hover:text-accent">All Products</Link></li>
                <li><Link href="/products?cat=logs" className="hover:text-accent">Accounts & Logs</Link></li>
                <li><Link href="/products?cat=vpn" className="hover:text-accent">VPN Access</Link></li>
                <li><Link href="/services" className="hover:text-accent">Website Dev</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-accent">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-accent">Privacy Policy</Link></li>
                <li><Link href="/support" className="hover:text-accent">Support Center</Link></li>
                <li><Link href="/contact" className="hover:text-accent">Contact Admin</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Esan Tools Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

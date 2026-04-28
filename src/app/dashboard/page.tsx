"use client";

import { use } from "react";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product-card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function UserDashboard(props: { params: Promise<any> }) {
  const params = use(props.params);
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  
  const userRef = user && db ? doc(db, "users", user.uid) : null;
  const { data: profile, loading: profileLoading } = useDoc(userRef);

  const dashboardGroups = [
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
      id: "tg-4",
      title: "Tech Alpha Network",
      category: "Tech",
      price: 20000,
      description: "Private discussions on emerging technologies and startup opportunities.",
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
    },
    {
      id: "tg-7",
      title: "Privacy & OpSec Elite",
      category: "Security",
      price: 18000,
      description: "Master the art of digital anonymity and advanced security protocols.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'vpn-logs')?.imageUrl || "",
      imageHint: "vpn security"
    },
    {
      id: "tg-8",
      title: "Fintech Alpha Hub",
      category: "Tech",
      price: 22000,
      description: "Disruptive fintech trends and payment gateway vulnerabilities.",
      imageUrl: PlaceHolderImages.find(img => img.id === 'web-dev')?.imageUrl || "",
      imageHint: "coding development"
    }
  ];

  if (userLoading || profileLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <Skeleton className="h-40 w-full md:w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const balance = profile?.balance || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass-card border-white/5 relative overflow-hidden group hover:border-accent/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-accent">Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline">₦{balance.toLocaleString()}</div>
            <Button size="sm" className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-8 uppercase tracking-tighter">
              Add Funds
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">Marketplace Spotlight</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest hidden sm:block">Recommended Access</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardGroups.map((group) => (
            <ProductCard key={group.id} {...group} />
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2 pt-4">
          {["Crypto", "Tech", "Alpha", "Security"].map((tag) => (
            <Button key={tag} variant="outline" className="border-white/5 bg-white/5 hover:bg-white/10 text-[10px] h-7 px-3 rounded-full uppercase font-bold tracking-widest">
              {tag}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

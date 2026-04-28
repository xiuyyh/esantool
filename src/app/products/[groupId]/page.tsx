
"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShoppingCart, ShieldCheck, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function GroupDetailsPage(props: { params: Promise<{ groupId: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const db = useFirestore();
  
  const groupRef = db ? doc(db, "groups", params.groupId) : null;
  const { data: group, loading, error } = useDoc(groupRef);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 space-y-8">
        <Skeleton className="h-10 w-40" />
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Group not found</h2>
        <p className="text-muted-foreground mt-2">The group you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-6" onClick={() => router.push("/products")}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link 
        href="/products" 
        className="inline-flex items-center text-sm font-bold text-accent hover:opacity-80 transition-opacity uppercase tracking-widest"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Preview Image Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 glass-card">
            {group.imageUrl ? (
              <Image
                src={group.imageUrl}
                alt={group.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-secondary/10">
                <MessageSquare className="h-20 w-20 text-muted-foreground opacity-20" />
              </div>
            )}
            <div className="absolute top-4 left-4">
              <Badge className="bg-accent text-accent-foreground font-bold px-3 py-1 text-xs uppercase">
                {group.category}
              </Badge>
            </div>
          </div>
          
          <Card className="glass-card border-white/5">
            <CardContent className="p-8 space-y-6">
              <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">Intelligence Report</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {group.description}
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Access Status</p>
                  <div className="flex items-center text-green-500 text-sm font-bold">
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    VERIFIED
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Network</p>
                  <p className="text-sm font-bold">TELEGRAM</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Delivery</p>
                  <p className="text-sm font-bold uppercase">Instant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="glass-card border-accent/20 sticky top-24">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2">
                <h1 className="font-headline text-4xl font-bold tracking-tighter leading-none">
                  {group.title}
                </h1>
                <p className="text-muted-foreground text-sm">Official Private Access Key</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground text-sm uppercase tracking-widest">Pricing</span>
                  <span className="text-4xl font-bold font-headline text-accent">
                    ₦{group.price?.toLocaleString()}
                  </span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-1/3" />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg uppercase tracking-widest group">
                  <ShoppingCart className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Acquire Access
                </Button>
                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                  Secure checkout via account balance
                </p>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 space-y-4 border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Lifetime Entry</h4>
                    <p className="text-[10px] text-muted-foreground mt-1">Pay once, stay in the loop forever. No recurring fees.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Buyer Protection</h4>
                    <p className="text-[10px] text-muted-foreground mt-1">Verified link integrity guaranteed by Esan Tools.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

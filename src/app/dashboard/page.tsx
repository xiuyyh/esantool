
"use client";

import { useMemo } from "react";
import { useUser, useDoc, useFirestore, useCollection } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product-card";
import { Globe, ShieldCheck, Lock, ExternalLink, Key } from "lucide-react";
import Link from "next/link";

export default function UserDashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  
  const userRef = user && db ? doc(db, "users", user.uid) : null;
  const { data: profile, loading: profileLoading } = useDoc(userRef);
  
  const { data: allGroups, loading: groupsLoading } = useCollection(db ? collection(db, "groups") : null);

  const purchasedGroups = useMemo(() => {
    if (!profile?.purchasedGroups || !allGroups) return [];
    return allGroups.filter((g: any) => profile.purchasedGroups.includes(g.id));
  }, [profile?.purchasedGroups, allGroups]);

  const availableGroups = useMemo(() => {
    if (!allGroups) return [];
    const purchasedIds = profile?.purchasedGroups || [];
    return allGroups.filter((g: any) => !purchasedIds.includes(g.id));
  }, [profile?.purchasedGroups, allGroups]);

  if (userLoading || profileLoading || groupsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const balance = profile?.balance || 0;
  const purchasedCount = profile?.purchasedGroups?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass-card border-white/5 relative overflow-hidden group hover:border-accent/30 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Account Credit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline">₦{balance.toLocaleString()}</div>
            <Button size="sm" className="mt-4 bg-primary hover:bg-primary/90 text-white font-bold h-8 uppercase tracking-widest text-[10px]">
              Recharge Credits
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Access Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline">{purchasedCount}</div>
            <p className="text-[10px] text-muted-foreground mt-4 uppercase tracking-widest">Authenticated Connections</p>
          </CardContent>
        </Card>
      </div>

      {/* Purchased Assets Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="font-headline text-xl font-bold uppercase tracking-tight flex items-center gap-2">
            <Key className="h-5 w-5 text-accent" />
            Secured Intelligence Assets
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {purchasedGroups.length > 0 ? (
            purchasedGroups.map((group: any) => (
              <Card key={group.id} className="glass-card border-accent/20 overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex p-4 gap-4">
                    <div className="h-20 w-20 rounded-xl overflow-hidden border border-white/10 shrink-0">
                      <img src={group.imageUrls?.[0] || "https://picsum.photos/seed/default/200/200"} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-headline font-bold text-lg truncate">{group.title}</h3>
                        <div className="text-[10px] font-bold text-accent uppercase tracking-tighter flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {group.country}
                        </div>
                      </div>
                      <div className="mt-2 p-2 rounded-lg bg-accent/5 border border-accent/10 flex items-center justify-between gap-3">
                        <code className="text-[10px] font-mono text-accent truncate opacity-80">
                          {group.accessLink}
                        </code>
                        <Button asChild size="icon" className="h-7 w-7 bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                          <a href={group.accessLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-40">
              <Lock className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xs uppercase tracking-widest font-bold">No active assets found in your vault.</p>
              <Button variant="link" asChild className="mt-2 text-accent">
                <Link href="/products">Explore Marketplace</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Discovery Section */}
      {availableGroups.length > 0 && (
        <section className="space-y-6 pt-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-headline text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              Unexplored Regions
            </h2>
            <Link href="/products" className="text-[10px] font-bold uppercase tracking-widest text-accent hover:opacity-80">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableGroups.slice(0, 4).map((group: any) => (
              <ProductCard 
                key={group.id} 
                id={group.id}
                title={group.title}
                country={group.country}
                price={group.price}
                description={group.description}
                imageUrls={group.imageUrls || []}
                imageHint="region intel"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

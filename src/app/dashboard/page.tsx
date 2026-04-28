
"use client";

import { use } from "react";
import { useUser, useDoc, useFirestore, useCollection } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product-card";
import { Globe, ShieldCheck } from "lucide-react";

export default function UserDashboard(props: { params: Promise<any> }) {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  
  const userRef = user && db ? doc(db, "users", user.uid) : null;
  const { data: profile, loading: profileLoading } = useDoc(userRef);
  
  const { data: dashboardGroups, loading: groupsLoading } = useCollection(db ? collection(db, "groups") : null);

  if (userLoading || profileLoading || groupsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Skeleton className="h-40 w-1/3" />
      </div>
    );
  }

  const balance = profile?.balance || 0;
  const purchasedCount = profile?.purchasedGroups?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
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

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="font-headline text-xl font-bold uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            Regional Hotspots
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardGroups.length > 0 ? (
            dashboardGroups.map((group: any) => (
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
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-muted-foreground">
              <p className="text-xs uppercase tracking-widest">No intelligence found in database.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

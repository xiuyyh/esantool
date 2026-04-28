
"use client";

import { use } from "react";
import { useUser, useDoc, useFirestore, useCollection } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product-card";

export default function UserDashboard(props: { params: Promise<any> }) {
  const params = use(props.params);
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  
  const userRef = user && db ? doc(db, "users", user.uid) : null;
  const { data: profile, loading: profileLoading } = useDoc(userRef);
  
  const { data: dashboardGroups, loading: groupsLoading } = useCollection(db ? collection(db, "groups") : null);

  if (userLoading || profileLoading || groupsLoading) {
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
          {dashboardGroups.length > 0 ? (
            dashboardGroups.map((group: any) => (
              <ProductCard 
                key={group.id} 
                id={group.id}
                title={group.title}
                category={group.category}
                price={group.price}
                description={group.description}
                imageUrl={group.imageUrl}
                imageHint="telegram network"
              />
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-muted-foreground">
              <p>No listings currently available in the spotlight.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

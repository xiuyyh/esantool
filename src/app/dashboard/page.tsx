
"use client";

import { useMemo, useEffect } from "react";
import { useUser, useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product-card";
import { Globe, ShieldCheck, Lock, ExternalLink, Key, History } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const DEFAULT_IMAGE = "https://techstory.in/wp-content/uploads/2021/07/telegram.jpeg";

export default function UserDashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile, loading: profileLoading } = useDoc(userRef);
  
  const groupsQuery = useMemoFirebase(() => db ? collection(db, "groups") : null, [db]);
  const { data: allGroups, loading: groupsLoading } = useCollection(groupsQuery);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

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
      <div className="max-w-screen-2xl px-4 py-20 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user) return null;

  const balance = profile?.balance || 0;
  const purchasedCount = profile?.purchasedGroups?.length || 0;

  return (
    <div className="max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass-card border-accent/20 relative overflow-hidden group hover:border-accent/40 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">My Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline text-accent">₦{balance.toLocaleString()}</div>
            <div className="flex gap-2 mt-4">
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-8 uppercase tracking-widest text-[10px]">
                <Link href="/dashboard/topup">Add Credits</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-8 uppercase tracking-widest text-[10px] font-bold border-white/10 hover:bg-white/5">
                <Link href="/dashboard/transactions">
                  <History className="h-3 w-3 mr-1" />
                  History
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">My Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline">{purchasedCount}</div>
            <p className="text-[10px] text-muted-foreground mt-4 uppercase tracking-widest">Groups purchased</p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="font-headline text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
            <Key className="h-6 w-6 text-accent" />
            Purchased Groups
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {purchasedGroups.length > 0 ? (
            purchasedGroups.map((group: any) => (
              <Card key={group.id} className="glass-card border-accent/20 overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex p-5 gap-5">
                    <div className="h-24 w-24 rounded-xl overflow-hidden border border-white/10 shrink-0">
                      <img src={group.imageUrls?.[0] || DEFAULT_IMAGE} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-headline font-bold text-xl truncate">{group.title}</h3>
                        <div className="text-[10px] font-bold text-accent uppercase tracking-tighter flex items-center gap-1 border border-accent/20 px-2 py-0.5 rounded-full">
                          <Globe className="h-3 w-3" />
                          {group.country}
                        </div>
                      </div>
                      <div className="mt-2 p-3 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-between gap-3">
                        <code className="text-xs font-mono text-accent truncate opacity-80">
                          {group.accessLink}
                        </code>
                        <Button asChild size="icon" className="h-8 w-8 bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                          <a href={group.accessLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-40">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm uppercase tracking-widest font-bold">No groups purchased yet.</p>
              <Button variant="link" asChild className="mt-4 text-accent text-lg">
                <Link href="/">Browse Shop</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {availableGroups.length > 0 && (
        <section className="space-y-6 pt-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-headline text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-muted-foreground" />
              New Groups
            </h2>
            <Link href="/" className="text-xs font-bold uppercase tracking-widest text-accent hover:opacity-80">
              See All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
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


"use client";

import { useMemo, useEffect } from "react";
import { useUser, useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product-card";
import { Globe, ShieldCheck, Lock, ExternalLink, Key, History, Link as LinkIcon } from "lucide-react";
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
    if (!userLoading && !user) router.push("/login");
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

  return (
    <div className="max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass-card border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">My Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline text-accent">₦{profile?.balance?.toLocaleString() || 0}</div>
            <div className="flex gap-2 mt-4">
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-8 uppercase tracking-widest text-[10px]">
                <Link href="/dashboard/topup">Add Credits</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-8 uppercase tracking-widest text-[10px] font-bold border-white/10">
                <Link href="/dashboard/transactions"><History className="h-3 w-3 mr-1" /> History</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Owned Bundles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline">{profile?.purchasedGroups?.length || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-4 uppercase tracking-widest">Active digital protocols</p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="font-headline text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
            <Key className="h-6 w-6 text-accent" />
            Authorized Bundles
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
          {purchasedGroups.length > 0 ? (purchasedGroups.map((group: any) => (
            <Card key={group.id} className="glass-card border-accent/20 overflow-hidden group">
              <CardHeader className="border-b border-white/5 p-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <CardTitle className="font-headline font-bold text-xl uppercase tracking-tighter">{group.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3 text-accent" />
                      <span className="text-[10px] font-bold text-accent uppercase">{group.country}</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-lg border border-white/10 overflow-hidden shrink-0">
                    <img src={group.imageUrls?.[0] || DEFAULT_IMAGE} className="w-full h-full object-cover" alt="" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Included Nodes</p>
                  <div className="space-y-2">
                    {(group.links || []).map((link: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-accent/20 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <LinkIcon className="h-3 w-3 text-accent shrink-0" />
                          <span className="text-xs font-bold uppercase tracking-tight truncate">{link.label || `Node ${idx + 1}`}</span>
                        </div>
                        <Button asChild size="icon" className="h-8 w-8 bg-accent text-background hover:bg-accent/80 shrink-0">
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-40">
              <Lock className="h-12 w-12 mx-auto mb-4" />
              <p className="text-sm uppercase tracking-widest font-bold">No authorized bundles found.</p>
              <Button variant="link" asChild className="mt-4 text-accent uppercase tracking-widest text-xs"><Link href="/">Enter Marketplace</Link></Button>
            </div>
          )}
        </div>
      </section>

      {availableGroups.length > 0 && (
        <section className="space-y-6 pt-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-headline text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-muted-foreground" />
              New Intel
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {availableGroups.slice(0, 4).map((group: any) => (
              <ProductCard key={group.id} id={group.id} title={group.title} country={group.country} price={group.price} description={group.description} imageUrls={group.imageUrls || []} imageHint="bundle preview" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

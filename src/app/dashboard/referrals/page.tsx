
"use client";

import { useState } from "react";
import { useUser, useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Users, Wallet, Gift, Share2, Loader2, ChevronLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { format } from "date-fns";

export default function ReferralsPage() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile, loading: profileLoading } = useDoc(userRef);

  const bonusesQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, "transactions"),
      where("uid", "==", user.uid),
      where("type", "==", "referral_bonus"),
      orderBy("createdAt", "desc")
    );
  }, [db, user?.uid]);
  const { data: bonuses, loading: bonusesLoading } = useCollection(bonusesQuery);

  const referralLink = typeof window !== "undefined" ? `${window.location.origin}/signup?ref=${profile?.referralCode}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Copied!", description: "Referral link copied to clipboard." });
  };

  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
      <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-accent uppercase tracking-widest hover:opacity-80 transition-opacity">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-8 gap-4">
        <div className="space-y-1">
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tight text-white">Refer & Earn</h1>
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">Naira protocol for network expansion</p>
        </div>
        <div className="bg-accent/10 p-4 rounded-2xl border border-accent/20">
          <Gift className="h-8 w-8 text-accent" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card border-accent/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Share2 className="h-32 w-32 text-accent" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl uppercase tracking-widest">Your Referral Node</CardTitle>
              <CardDescription className="text-xs">
                Earn ₦2,000 for every single purchase your referee completes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Invite Link</label>
                <div className="flex gap-2">
                  <Input 
                    value={referralLink} 
                    readOnly 
                    className="bg-white/5 border-white/10 h-12 font-mono text-[10px] truncate"
                  />
                  <Button onClick={copyLink} className="bg-accent text-background hover:bg-accent/80 h-12 px-6 shrink-0">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-accent/5 border border-accent/10 rounded-xl">
                <p className="text-[10px] leading-relaxed text-accent font-bold uppercase tracking-tight">
                  Pro-Tip: Share your link in relevant tech communities to maximize earnings. All bonuses are added instantly to your wallet.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 overflow-hidden">
            <CardHeader className="bg-white/5">
              <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
                <History className="h-4 w-4 text-accent" /> Referral Earnings Ledger
              </CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5">
                  <TableHead className="text-[9px] uppercase tracking-widest font-bold">Date</TableHead>
                  <TableHead className="text-[9px] uppercase tracking-widest font-bold">Identity Source</TableHead>
                  <TableHead className="text-[9px] uppercase tracking-widest font-bold text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonusesLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 opacity-40 uppercase text-[10px]">Accessing Ledger...</TableCell>
                  </TableRow>
                ) : bonuses.length > 0 ? (
                  bonuses.map((tx: any) => (
                    <TableRow key={tx.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="text-[10px] opacity-60">
                        {tx.createdAt ? format(tx.createdAt.toDate(), 'MMM dd, HH:mm') : 'Recent'}
                      </TableCell>
                      <TableCell className="text-xs font-bold uppercase">
                        {tx.userName}
                      </TableCell>
                      <TableCell className="text-right font-headline font-bold text-accent">
                        +₦{tx.amount?.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-20 opacity-40 uppercase text-[10px] tracking-widest">
                      No referral bonuses logged yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card border-accent/40 bg-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold text-accent uppercase tracking-widest">Total Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-headline text-accent">₦{profile?.referralEarnings?.toLocaleString() || 0}</div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-4">Naira credits acquired via network</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocol Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                <p className="text-[10px] leading-tight text-white/70 uppercase">Earn ₦2,000 for every purchase made by your referee.</p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                <p className="text-[10px] leading-tight text-white/70 uppercase">Earnings are unlimited. Refer as many as you can.</p>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                <p className="text-[10px] leading-tight text-white/70 uppercase">Bonuses can be used to buy any bundle on the market.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { History } from "lucide-react";

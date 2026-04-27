
"use client";

import { useUser, useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { 
  Wallet, 
  Package, 
  History, 
  TrendingUp, 
  MessageSquare,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function UserDashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  
  const userRef = user && db ? doc(db, "users", user.uid) : null;
  const { data: profile, loading: profileLoading } = useDoc(userRef);

  if (userLoading || profileLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const balance = profile?.balance || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="font-headline text-3xl font-bold">Member Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.displayName || "User"}. Manage your private access here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Card */}
        <Card className="glass-card border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline text-accent">₦{balance.toLocaleString()}</div>
            <Button size="sm" className="mt-4 bg-white/5 hover:bg-white/10 text-xs h-8 border border-white/10">
              Add Funds
            </Button>
          </CardContent>
        </Card>

        {/* Active Groups Card */}
        <Card className="glass-card border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline">0</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              Explore the marketplace for new groups
            </p>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card className="glass-card border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Security Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-green-500 font-bold">
              <ShieldCheck className="h-5 w-5" />
              Verified
            </div>
            <p className="text-xs text-muted-foreground mt-2">Your account is secured with 2FA.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 glass-card border-white/5">
          <CardHeader>
            <CardTitle className="font-headline">Recent Transactions</CardTitle>
            <CardDescription>History of your group purchases and wallet top-ups.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center opacity-40">
            <History className="h-12 w-12 mb-4" />
            <p className="text-sm">No transaction history found.</p>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="font-headline">Recommended for You</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm group-hover:text-accent">Venture Leaks Alpha</span>
                <Badge variant="outline" className="text-[10px] text-accent border-accent/20">Alpha</Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">Insider info on private VC deals...</p>
              <div className="mt-2 text-sm font-bold text-accent">₦15,000</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


"use client";

import { useUser, useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { 
  Wallet, 
  PlusCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  const balance = profile?.balance || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="font-headline text-3xl font-bold">Member Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.displayName || "User"}. Manage your account balance here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Wallet Card */}
        <Card className="glass-card border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-accent">Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline">₦{balance.toLocaleString()}</div>
            <Button size="sm" className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-8">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

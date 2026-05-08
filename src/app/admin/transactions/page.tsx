
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ShieldAlert, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminTransactionsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile, loading: profileLoading } = useDoc(userRef);

  useEffect(() => {
    if (!authLoading && !user) router.push("/admin/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!profileLoading && profile && !profile.isAdmin) {
      toast({ variant: "destructive", title: "Access Denied", description: "Administrator privileges required." });
      router.push("/");
    }
  }, [profile, profileLoading, router, toast]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "transactions"), orderBy("createdAt", "desc"));
  }, [db]);
  const { data: transactions, loading } = useCollection(transactionsQuery);

  const handleConfirm = async (tx: any) => {
    if (!db) return;
    if (tx.status !== 'pending') {
      toast({ title: "Error", description: "This transaction is already processed." });
      return;
    }
    
    setProcessingId(tx.id);
    
    try {
      const targetUserRef = doc(db, "users", tx.uid);
      const txRef = doc(db, "transactions", tx.id);

      const userSnap = await getDoc(targetUserRef);
      if (!userSnap.exists()) {
        throw new Error("User profile not found.");
      }

      const amountToAdd = Number(tx.amount);
      if (isNaN(amountToAdd) || amountToAdd <= 0) {
        throw new Error("Invalid transaction amount.");
      }

      await updateDoc(txRef, { status: "confirmed" });
      await updateDoc(targetUserRef, {
        balance: increment(amountToAdd)
      });

      toast({ 
        title: "Success", 
        description: `₦${amountToAdd.toLocaleString()} added to ${tx.userName}'s wallet.` 
      });
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Operation Failed", 
        description: err.message || "Failed to update balance." 
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!db) return;
    setProcessingId(id);
    try {
      await updateDoc(doc(db, "transactions", id), { status: "rejected" });
      toast({ title: "Rejected", description: "Transaction request rejected." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Operation failed." });
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile?.isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/5 pb-6 sm:pb-8 gap-4">
        <div>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold uppercase tracking-tight">Transaction Requests</h1>
          <p className="text-muted-foreground mt-1 text-[10px] sm:text-xs uppercase tracking-widest">Verify and approve manual bank transfers</p>
        </div>
        <ShieldAlert className="h-8 w-8 sm:h-10 sm:w-10 text-primary animate-pulse" />
      </div>

      <Card className="glass-card border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5">
                <TableHead className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest min-w-[150px]">User</TableHead>
                <TableHead className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Amount</TableHead>
                <TableHead className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Date</TableHead>
                <TableHead className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground uppercase text-[10px]">
                    Loading Ledger...
                  </TableCell>
                </TableRow>
              ) : transactions.length > 0 ? (
                transactions.map((tx: any) => (
                  <TableRow key={tx.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs sm:text-sm truncate max-w-[140px]">{tx.userName}</span>
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase truncate max-w-[140px]">{tx.userEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-headline font-bold text-accent text-base sm:text-lg">
                      ₦{tx.amount?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-[10px] opacity-60">
                      {tx.createdAt ? format(tx.createdAt.toDate(), 'MMM dd, HH:mm') : 'Recently'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`uppercase text-[8px] sm:text-[9px] font-bold ${
                        tx.status === 'pending' ? 'border-yellow-500/50 text-yellow-500' :
                        tx.status === 'confirmed' ? 'border-green-500/50 text-green-500' :
                        'border-red-500/50 text-red-500'
                      }`}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {tx.status === 'pending' && (
                        <div className="flex justify-end gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 text-green-500 hover:bg-green-500/10"
                            onClick={() => handleConfirm(tx)}
                            disabled={!!processingId}
                          >
                            {processingId === tx.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                            onClick={() => handleReject(tx.id)}
                            disabled={!!processingId}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 opacity-40 uppercase text-[10px] tracking-widest">
                    No requests to process.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

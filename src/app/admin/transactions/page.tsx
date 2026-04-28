
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ShieldAlert, Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminTransactionsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/admin/login");
  }, [user, authLoading, router]);

  const q = db ? query(collection(db, "transactions"), orderBy("createdAt", "desc")) : null;
  const { data: transactions, loading } = useCollection(q);

  const handleConfirm = async (tx: any) => {
    if (!db) return;
    setProcessingId(tx.id);
    
    try {
      const userRef = doc(db, "users", tx.uid);
      const txRef = doc(db, "transactions", tx.id);

      // 1. Update Transaction Status
      await updateDoc(txRef, { status: "confirmed" });

      // 2. Add Balance to User
      await updateDoc(userRef, {
        balance: increment(tx.amount)
      });

      toast({ title: "Success", description: `₦${tx.amount.toLocaleString()} added to ${tx.userName}'s wallet.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "Operation failed." });
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

  if (authLoading) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tight">Transaction Requests</h1>
          <p className="text-muted-foreground mt-1 text-xs uppercase tracking-widest">Verify and approve manual bank transfers</p>
        </div>
        <ShieldAlert className="h-10 w-10 text-primary animate-pulse" />
      </div>

      <Card className="glass-card border-white/5">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">User</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Amount</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Date</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">Actions</TableHead>
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
                      <span className="font-bold text-sm">{tx.userName}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{tx.userEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-headline font-bold text-accent text-lg">
                    ₦{tx.amount?.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs opacity-60">
                    {tx.createdAt ? format(tx.createdAt.toDate(), 'MMM dd, HH:mm') : 'Recently'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`uppercase text-[9px] font-bold ${
                      tx.status === 'pending' ? 'border-yellow-500/50 text-yellow-500' :
                      tx.status === 'confirmed' ? 'border-green-500/50 text-green-500' :
                      'border-red-500/50 text-red-500'
                    }`}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {tx.status === 'pending' && (
                      <div className="flex justify-end gap-2">
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
                <TableCell colSpan={5} className="text-center py-20 opacity-40">
                  No requests to process.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

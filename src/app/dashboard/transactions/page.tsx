
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wallet, Clock, CheckCircle2, XCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function TransactionsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const q = user && db ? query(
    collection(db, "transactions"),
    where("uid", "==", user.uid),
    orderBy("createdAt", "desc")
  ) : null;

  const { data: transactions, loading } = useCollection(q);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 bg-yellow-500/5 uppercase text-[9px] font-bold"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/5 uppercase text-[9px] font-bold"><CheckCircle2 className="h-3 w-3 mr-1" /> Confirmed</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="border-red-500/50 text-red-500 bg-red-500/5 uppercase text-[9px] font-bold"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline" className="uppercase text-[9px] font-bold">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-accent uppercase tracking-widest">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Dashboard
      </Link>

      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tight">Wallet History</h1>
          <p className="text-muted-foreground mt-1 uppercase tracking-widest text-[10px]">Track your deposits and status updates</p>
        </div>
        <div className="bg-accent/10 p-4 rounded-2xl border border-accent/20">
          <Wallet className="h-8 w-8 text-accent" />
        </div>
      </div>

      <Card className="glass-card border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Date</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Type</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Amount</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20 text-muted-foreground uppercase text-[10px] animate-pulse">
                  Decrypting Ledger...
                </TableCell>
              </TableRow>
            ) : transactions.length > 0 ? (
              transactions.map((tx: any) => (
                <TableRow key={tx.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="text-sm font-medium">
                    {tx.createdAt ? format(tx.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 'Recently'}
                  </TableCell>
                  <TableCell className="text-[10px] uppercase font-bold tracking-tight opacity-60">
                    {tx.type || 'Deposit'}
                  </TableCell>
                  <TableCell className="font-headline font-bold text-accent text-lg">
                    ₦{tx.amount?.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {getStatusBadge(tx.status)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20 opacity-40">
                  <p className="uppercase tracking-widest text-xs font-bold">No transactions found.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

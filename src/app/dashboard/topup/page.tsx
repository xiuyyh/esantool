
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Landmark, CheckCircle2, Loader2, ArrowRight, Copy, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { notifyTelegram } from "@/lib/telegram-action";

type Step = 'amount' | 'bank' | 'pending';

export default function TopUpPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const bankInfo = {
    accountName: "Emmanuel Solomon Ahunanya",
    accountNumber: "9167241442",
    bankName: "PalmPay"
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Account details copied to clipboard." });
  };

  const handleInitializePayment = () => {
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount < 100) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Minimum top-up is ₦100." });
      return;
    }
    setStep('bank');
  };

  const handleSubmitRequest = async () => {
    if (!user || !db) return;
    setLoading(true);

    try {
      const numAmount = Number(amount);
      const txData = {
        uid: user.uid,
        userEmail: user.email,
        userName: user.displayName || "Anonymous User",
        amount: numAmount,
        status: "pending",
        type: "credit",
        createdAt: serverTimestamp(),
      };

      // 1. Create transaction record
      await addDoc(collection(db, "transactions"), txData);
      
      // 2. Notify Admin via Telegram with HTML tags
      const htmlMessage = `🚨 <b>New Top-up Request</b>\n\n<b>User:</b> ${txData.userName}\n<b>Email:</b> ${txData.userEmail}\n<b>Amount:</b> ₦${txData.amount.toLocaleString()}\n<b>Status:</b> PENDING`;
      await notifyTelegram(htmlMessage);

      setStep('pending');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not submit request. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-accent uppercase tracking-widest hover:opacity-80 transition-opacity">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="text-center space-y-2">
        <h1 className="font-headline text-4xl font-bold uppercase tracking-tight">Add Credits</h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest">Fund your secure wallet via manual transfer</p>
      </div>

      <div className="max-w-xl mx-auto">
        {step === 'amount' && (
          <Card className="glass-card border-white/10 animate-fall-in">
            <CardHeader>
              <CardTitle className="text-lg">Set Amount</CardTitle>
              <CardDescription>Enter the amount you wish to add to your balance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Amount (₦)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-headline font-bold text-accent text-xl">₦</span>
                  <Input 
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="h-14 pl-10 text-2xl font-bold font-headline bg-white/5 border-white/10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleInitializePayment} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest">
                Continue to Bank Info
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'bank' && (
          <Card className="glass-card border-accent/20 animate-fall-in">
            <CardHeader>
              <CardTitle className="text-lg">Bank Transfer Details</CardTitle>
              <CardDescription>Please transfer ₦{Number(amount).toLocaleString()} to the account below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Account Name</Label>
                  <p className="font-headline font-bold text-lg">{bankInfo.accountName}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Account Number</Label>
                  <div className="flex items-center justify-between">
                    <p className="font-headline font-bold text-2xl tracking-widest text-accent">{bankInfo.accountNumber}</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-accent hover:bg-accent/10" onClick={() => copyToClipboard(bankInfo.accountNumber)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase tracking-widest text-muted-foreground">Bank Name</Label>
                  <p className="font-headline font-bold text-lg">{bankInfo.bankName}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                <p className="text-[10px] text-accent font-bold uppercase tracking-tight text-center">
                  ⚠️ After transfer, click the button below to notify our admins.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleSubmitRequest} 
                  disabled={loading}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg uppercase tracking-widest"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "I'VE MADE THE TRANSFER"}
                </Button>
                <Button variant="ghost" onClick={() => setStep('amount')} className="w-full text-xs uppercase tracking-widest text-muted-foreground">
                  Change Amount
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'pending' && (
          <Card className="glass-card border-accent/40 animate-fall-in text-center py-10">
            <CardContent className="space-y-6">
              <div className="mx-auto bg-accent/10 p-6 rounded-full w-fit">
                <CheckCircle2 className="h-16 w-16 text-accent" />
              </div>
              <div className="space-y-2">
                <h2 className="font-headline text-3xl font-bold uppercase tracking-tight">Request Received</h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Our administrators are verifying your transfer. Credits will be added to your wallet shortly.
                </p>
              </div>
              <div className="pt-4 space-y-3">
                <Button asChild className="w-full bg-accent text-accent-foreground font-bold uppercase tracking-widest">
                  <Link href="/dashboard/transactions">View Transaction History</Link>
                </Button>
                <Button variant="ghost" asChild className="w-full text-xs uppercase tracking-widest">
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

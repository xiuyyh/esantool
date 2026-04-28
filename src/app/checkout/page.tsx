
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Wallet, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const userRef = user && db ? doc(db, "users", user.uid) : null;
  const { data: profile } = useDoc(userRef);

  const { data: allGroups } = useCollection(db ? collection(db, "groups") : null);

  const cartItems = useMemo(() => {
    if (!profile?.cart || !allGroups) return [];
    return allGroups.filter((g: any) => profile.cart.includes(g.id));
  }, [profile?.cart, allGroups]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  }, [cartItems]);

  const handleRemoveFromCart = async (groupId: string) => {
    if (!userRef) return;
    updateDoc(userRef, {
      cart: arrayRemove(groupId)
    });
  };

  const handleCompletePurchase = async () => {
    if (!userRef || !profile) return;
    if (cartItems.length === 0) return;

    if (profile.balance < totalPrice) {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: `You need ₦${(totalPrice - profile.balance).toLocaleString()} more to complete this transaction.`,
      });
      return;
    }

    setIsProcessing(true);
    try {
      const itemIds = cartItems.map(item => item.id);
      
      await updateDoc(userRef, {
        balance: increment(-totalPrice),
        purchasedGroups: arrayUnion(...itemIds),
        cart: [] // Clear cart after purchase
      });

      toast({
        title: "Transaction Successful",
        description: "Access keys have been decrypted and added to your dashboard.",
      });
      router.push("/dashboard");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Security Breach",
        description: "The transaction was intercepted. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Authentication Required</h2>
        <Button className="mt-6" asChild>
          <Link href="/login">Login to Access Cart</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="font-headline text-5xl font-bold tracking-tight">STAGING AREA</h1>
          <p className="text-muted-foreground mt-2 uppercase tracking-widest text-xs">Verify your intelligence acquisitions before deployment.</p>
        </div>
        <Link href="/products" className="text-accent text-xs font-bold uppercase tracking-widest flex items-center hover:opacity-80">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Keep Browsing
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <Card key={item.id} className="glass-card border-white/5 overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg overflow-hidden border border-white/10 shrink-0">
                      <img src={item.imageUrls?.[0] || "https://picsum.photos/seed/default/200/200"} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-lg">{item.title}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-headline font-bold text-accent">₦{item.price?.toLocaleString()}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-3xl opacity-50">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="uppercase tracking-widest text-xs font-bold">Staging area is empty.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-card border-accent/20 sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Intelligence Nodes</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-white/5 pt-4">
                  <span>Total Cost</span>
                  <span className="text-accent">₦{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                  <span>Available Balance</span>
                  <Wallet className="h-3 w-3" />
                </div>
                <div className="text-2xl font-bold font-headline">₦{profile?.balance?.toLocaleString() || 0}</div>
              </div>

              <Button 
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg uppercase tracking-widest"
                disabled={isProcessing || cartItems.length === 0}
                onClick={handleCompletePurchase}
              >
                {isProcessing ? "DECRYPTING..." : "AUTHORIZE PAYMENT"}
                <ShieldCheck className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
            <CardFooter>
              <p className="text-[10px] text-center w-full text-muted-foreground uppercase tracking-widest">
                Verification process creates persistent access links in your dashboard.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, ShieldCheck, Wallet, ChevronLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const userBalance = profile?.balance || 0;
  const hasInsufficientFunds = userBalance < totalPrice;

  const handleRemoveFromCart = async (groupId: string) => {
    if (!userRef) return;
    updateDoc(userRef, {
      cart: arrayRemove(groupId)
    });
  };

  const handleCompletePurchase = async () => {
    if (!userRef || !profile) return;
    if (cartItems.length === 0) return;

    if (hasInsufficientFunds) {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: `Insufficient funds. Your balance: ₦${userBalance.toLocaleString()}. Price: ₦${totalPrice.toLocaleString()}.`,
      });
      return;
    }

    setIsProcessing(true);
    try {
      const itemIds = cartItems.map(item => item.id);
      
      await updateDoc(userRef, {
        balance: increment(-totalPrice),
        purchasedGroups: arrayUnion(...itemIds),
        cart: []
      });

      toast({
        title: "Purchase Successful",
        description: "Your groups are now available in your dashboard.",
      });
      router.push("/dashboard");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Payment could not be processed. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-screen-2xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold">Login Required</h2>
        <Button className="mt-8 px-10 h-12 text-lg font-bold" asChild>
          <Link href="/login">Login to buy groups</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl px-4 py-16 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="font-headline text-6xl font-bold tracking-tight">MY CART</h1>
          <p className="text-muted-foreground mt-2 uppercase tracking-widest text-sm">Review your items before buying.</p>
        </div>
        <Link href="/" className="text-accent text-sm font-bold uppercase tracking-widest flex items-center hover:opacity-80">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Shop
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <Card key={item.id} className="glass-card border-white/5 overflow-hidden">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-xl overflow-hidden border border-white/10 shrink-0">
                      <img src={item.imageUrls?.[0] || "https://picsum.photos/seed/default/200/200"} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-2xl mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-full w-fit">{item.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="font-headline font-bold text-3xl text-accent">₦{item.price?.toLocaleString()}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      <Trash2 className="h-6 w-6" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-white/10 rounded-3xl opacity-50">
              <ShoppingCart className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
              <p className="uppercase tracking-widest text-sm font-bold">Your cart is empty.</p>
              <Button asChild variant="outline" className="mt-6">
                <Link href="/">Go Shopping</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-card border-accent/20 sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Checkout Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Items in Cart</span>
                  <span className="font-bold">{cartItems.length}</span>
                </div>
                <div className="flex justify-between font-bold text-3xl border-t border-white/5 pt-6">
                  <span>Total</span>
                  <span className={hasInsufficientFunds ? "text-destructive" : "text-accent"}>₦{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className={hasInsufficientFunds ? "p-6 rounded-2xl bg-destructive/5 border border-destructive/10 space-y-3" : "p-6 rounded-2xl bg-accent/5 border border-accent/10 space-y-3"}>
                <div className="flex justify-between text-xs uppercase font-bold text-muted-foreground">
                  <span>My Balance</span>
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="text-3xl font-bold font-headline">₦{userBalance.toLocaleString()}</div>
              </div>

              {hasInsufficientFunds && cartItems.length > 0 && (
                <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="text-xs uppercase font-bold">
                    Need ₦{(totalPrice - userBalance).toLocaleString()} more to buy.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-bold text-xl uppercase tracking-widest shadow-xl shadow-primary/20"
                disabled={isProcessing || cartItems.length === 0 || hasInsufficientFunds}
                onClick={handleCompletePurchase}
              >
                {isProcessing ? "PROCESSING..." : hasInsufficientFunds ? "INSUFFICIENT FUNDS" : "BUY NOW"}
                {!hasInsufficientFunds && <ShieldCheck className="ml-2 h-6 w-6" />}
              </Button>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-center w-full text-muted-foreground uppercase tracking-widest opacity-60">
                Encrypted Transaction
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

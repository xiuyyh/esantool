
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, ShieldCheck, Wallet, ChevronLeft, AlertCircle, PlusCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DEFAULT_IMAGE = "https://techstory.in/wp-content/uploads/2021/07/telegram.jpeg";

export default function CheckoutPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile } = useDoc(userRef);

  const groupsQuery = useMemoFirebase(() => db ? collection(db, "groups") : null, [db]);
  const { data: allGroups } = useCollection(groupsQuery);

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
      <div className="max-w-screen-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold font-headline uppercase">Login Required</h2>
        <Button className="mt-8 px-10 h-12 text-lg font-bold" asChild>
          <Link href="/login">Login to buy groups</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 lg:py-12 space-y-6 sm:space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h1 className="font-headline text-3xl sm:text-5xl font-bold tracking-tight uppercase">Cart</h1>
          <p className="text-muted-foreground uppercase tracking-widest text-[10px] sm:text-xs">Secure Procurement Interface</p>
        </div>
        <Link href="/" className="text-accent text-xs font-bold uppercase tracking-widest flex items-center hover:opacity-80 transition-opacity">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Continue Browsing
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <Card key={item.id} className="glass-card border-white/5 overflow-hidden">
                <CardContent className="p-3 sm:p-5 flex flex-row items-center gap-4">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border border-white/10 shrink-0">
                    <img src={item.imageUrls?.[0] || DEFAULT_IMAGE} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold text-sm sm:text-xl truncate mb-1">{item.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/5">{item.country}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-headline font-bold text-base sm:text-2xl text-accent">₦{item.price?.toLocaleString()}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-2xl opacity-50 flex flex-col items-center">
              <ShoppingCart className="h-10 w-10 mb-4 text-muted-foreground opacity-20" />
              <p className="uppercase tracking-widest text-[10px] font-bold">Registry Empty</p>
              <Button asChild variant="link" className="mt-2 text-accent text-xs uppercase tracking-widest">
                <Link href="/">Browse Intelligence</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="glass-card border-accent/20 sticky top-20">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-lg sm:text-xl uppercase tracking-widest">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground uppercase tracking-widest">Selected Nodes</span>
                  <span className="font-bold">{cartItems.length}</span>
                </div>
                <div className="flex justify-between items-end border-t border-white/5 pt-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Subtotal</span>
                  <span className={`font-headline font-bold text-3xl ${hasInsufficientFunds && cartItems.length > 0 ? "text-destructive" : "text-accent"}`}>₦{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${hasInsufficientFunds && cartItems.length > 0 ? "bg-destructive/5 border-destructive/20" : "bg-accent/5 border-accent/20"} space-y-2`}>
                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  <span>Your Wallet</span>
                  <Wallet className="h-3 w-3" />
                </div>
                <div className="text-xl font-bold font-headline">₦{userBalance.toLocaleString()}</div>
              </div>

              {hasInsufficientFunds && cartItems.length > 0 && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 space-y-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-destructive uppercase tracking-widest">Insufficient Funds</p>
                      <p className="text-[10px] leading-relaxed opacity-80">You need ₦{(totalPrice - userBalance).toLocaleString()} more to complete this acquisition.</p>
                    </div>
                  </div>
                  <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold h-10 uppercase tracking-widest text-[10px]" size="sm">
                    <Link href="/dashboard/topup">
                      <PlusCircle className="mr-2 h-3.5 w-3.5" />
                      Add Credits Now
                    </Link>
                  </Button>
                </div>
              )}

              <Button 
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest disabled:opacity-20"
                disabled={isProcessing || cartItems.length === 0 || hasInsufficientFunds}
                onClick={handleCompletePurchase}
              >
                {isProcessing ? "Authorizing..." : hasInsufficientFunds ? "Insufficient Credits" : "Finalize Acquisition"}
                {!hasInsufficientFunds && !isProcessing && cartItems.length > 0 && <ShieldCheck className="ml-2 h-5 w-5" />}
              </Button>
            </CardContent>
            <CardFooter className="pt-0 border-t border-white/5 mt-4">
              <div className="w-full pt-4 flex flex-col items-center gap-2">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-accent" />
                  Encrypted Protocol Transaction
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

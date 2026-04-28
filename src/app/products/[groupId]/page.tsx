
"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShoppingCart, ShieldCheck, Lock, ExternalLink, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFirestore, useDoc, useUser } from "@/firebase";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const DEFAULT_IMAGE = "https://techstory.in/wp-content/uploads/2021/07/telegram.jpeg";

export default function GroupDetailsPage({ params: paramsPromise }: { params: Promise<{ groupId: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  
  const groupRef = db ? doc(db, "groups", params.groupId) : null;
  const { data: group, loading } = useDoc(groupRef);

  const userRef = user && db ? doc(db, "users", user.uid) : null;
  const { data: profile } = useDoc(userRef);

  const hasAccess = profile?.purchasedGroups?.includes(params.groupId);
  const isInCart = profile?.cart?.includes(params.groupId);

  const handleAddToCart = async () => {
    if (!user || !db || !group) {
      router.push("/login");
      return;
    }

    if (isInCart) {
      router.push("/checkout");
      return;
    }

    setIsAdding(true);
    try {
      await setDoc(userRef!, {
        cart: arrayUnion(params.groupId)
      }, { merge: true });

      toast({
        title: "Added",
        description: "Group added to your cart.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add to cart.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-20 space-y-8">
      <Skeleton className="h-[400px] w-full rounded-2xl" />
    </div>
  );

  if (!group) return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold">Group Not Found</h2>
      <Button className="mt-6" onClick={() => router.push("/")}>Back</Button>
    </div>
  );

  const images = group.imageUrls?.length > 0 ? group.imageUrls : [DEFAULT_IMAGE];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <Link href="/" className="inline-flex items-center text-xs font-bold text-accent uppercase tracking-widest">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 glass-card p-2">
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((url: string, index: number) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-video rounded-2xl overflow-hidden">
                      <Image src={url} alt={`${group.title} preview`} fill className="object-cover" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </>
              )}
            </Carousel>
          </div>
          
          <Card className="glass-card border-white/5">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-accent" />
                <Badge variant="outline" className="border-accent/20 text-accent uppercase">{group.country}</Badge>
              </div>
              <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">About this Group</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{group.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="glass-card border-accent/20 sticky top-24">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-2">
                <h1 className="font-headline text-3xl font-bold tracking-tighter">{group.title}</h1>
                <p className="text-muted-foreground text-xs uppercase tracking-widest">Private Link</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Price</span>
                  <span className="text-4xl font-bold font-headline text-accent">₦{group.price?.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                {hasAccess ? (
                  <div className="p-5 rounded-2xl bg-green-500/10 border border-green-500/20 space-y-3">
                    <p className="text-xs font-bold text-green-500 uppercase flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Purchased
                    </p>
                    <div className="flex items-center gap-3">
                      <Input 
                        readOnly 
                        value={group.accessLink} 
                        className="bg-black/20 border-white/10 font-mono text-sm"
                      />
                      <Button asChild size="icon" className="shrink-0 bg-green-500 hover:bg-green-600">
                        <a href={group.accessLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      onClick={handleAddToCart}
                      disabled={isAdding}
                      className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg uppercase tracking-widest"
                    >
                      {isInCart ? (
                        <>
                          <Check className="mr-2 h-5 w-5" />
                          GO TO CART
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          {isAdding ? "ADDING..." : "ADD TO CART"}
                        </>
                      )}
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase">
                      <Lock className="h-3 w-3" />
                      Link shows after purchase
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

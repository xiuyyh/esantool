
"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShoppingCart, ShieldCheck, Lock, ExternalLink, Globe, Check, Link as LinkIcon, Zap, Info, Bot, AlertTriangle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirestore, useDoc, useUser, useMemoFirebase } from "@/firebase";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getBundlePricing } from "@/lib/pricing";
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
  
  const groupRef = useMemoFirebase(() => db ? doc(db, "groups", params.groupId) : null, [db, params.groupId]);
  const { data: group, loading } = useDoc(groupRef);

  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile } = useDoc(userRef);

  const hasAccess = profile?.purchasedGroups?.includes(params.groupId);
  const isInCart = profile?.cart?.includes(params.groupId);

  const pricing = group ? getBundlePricing(group.price, group.salesCount || 0) : null;
  const isExclusive = group?.type === 'exclusive';

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
      await setDoc(userRef!, { cart: arrayUnion(params.groupId) }, { merge: true });
      toast({ title: "Added", description: "Item added to your cart." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not update cart." });
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-20"><Skeleton className="h-[400px] w-full rounded-2xl" /></div>;
  if (!group || !pricing) return <div className="max-w-5xl mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold">Item Not Found</h2><Button className="mt-6" onClick={() => router.push("/")}>Return</Button></div>;

  const images = group.imageUrls?.length > 0 ? group.imageUrls : [DEFAULT_IMAGE];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <Link href="/" className="inline-flex items-center text-xs font-bold text-accent uppercase tracking-widest">
        <ChevronLeft className="h-4 w-4 mr-1" />
        All Items
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          <div className={`relative rounded-3xl overflow-hidden border glass-card p-2 ${isExclusive ? 'border-accent/40' : pricing.borderColor}`}>
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((url: string, index: number) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40">
                      <Image src={url} alt="" fill className="object-contain" priority={index === 0} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && <><CarouselPrevious className="left-4" /><CarouselNext className="right-4" /></>}
            </Carousel>
            <div className={`absolute top-4 left-4 ${isExclusive ? 'bg-accent/20 border-accent/40 text-accent' : `${pricing.bgColor} ${pricing.color} border ${pricing.borderColor}`} px-4 py-1 text-xs font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-md`}>
              {isExclusive ? <Crown className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
              {isExclusive ? 'Exclusive One-Time Buy' : pricing.label}
            </div>
          </div>
          
          <Card className="glass-card border-white/5">
            <CardContent className="p-8 space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="outline" className="border-accent/20 text-accent uppercase px-3 py-1 font-bold tracking-widest">
                  <Globe className="h-3 w-3 mr-2 inline" /> {group.country}
                </Badge>
                <Badge variant="outline" className="border-white/10 uppercase px-3 py-1 font-bold tracking-widest">
                  {group.links?.length || 0} Access Link{group.links?.length !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className={`uppercase px-3 py-1 font-bold tracking-widest ${isExclusive ? 'text-accent border-accent/40' : `${pricing.color} ${pricing.borderColor}`}`}>
                  Type: {isExclusive ? 'Single (Exclusive)' : 'Bundle'}
                </Badge>
              </div>

              {isExclusive && (
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-accent uppercase tracking-widest">
                    <ShieldCheck className="h-4 w-4" /> Exclusive Access Alert
                  </div>
                  <p className="text-[11px] text-accent/80 leading-relaxed uppercase font-bold">
                    This is an exclusive node. Once you purchase this, it will be immediately removed from the store. You will be the only owner of these specific links.
                  </p>
                </div>
              )}

              <h2 className="font-headline text-3xl font-bold uppercase tracking-tight">Details</h2>
              {!isExclusive && (
                <div className="p-4 bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest">
                    <Info className="h-3 w-3" /> Pricing Phase: {pricing.label}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-tight">
                    Bundle prices adjust automatically based on sales volume to maintain system stability.
                  </p>
                </div>
              )}
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{group.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className={`glass-card tech-border sticky top-24 border ${isExclusive ? 'border-accent/40' : pricing.borderColor}`}>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-1">
                <h1 className="font-headline text-3xl font-bold tracking-tighter uppercase">{group.title}</h1>
                <p className={`${isExclusive ? 'text-accent' : pricing.color} text-[10px] uppercase font-bold tracking-[0.2em]`}>
                  {isExclusive ? 'UNIQUE PROTOCOL ENTRY' : pricing.description}
                </p>
              </div>

              <div className="flex flex-col gap-2 border-y border-white/5 py-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Price</span>
                  <div className="flex flex-col items-end">
                    <span className={`text-4xl font-bold font-headline ${isExclusive ? 'text-accent' : pricing.color}`}>
                      ₦{isExclusive ? group.price?.toLocaleString() : pricing.price.toLocaleString()}
                    </span>
                    {!isExclusive && pricing.discount > 0 && (
                      <span className="text-xs line-through opacity-40 font-mono">₦{group.price.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {hasAccess ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                      <ShieldCheck className="h-4 w-4" /> Access Granted
                    </div>
                    <div className="space-y-3">
                      {(group.links || []).map((link: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-xl group">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Access Point {idx+1}</p>
                            <p className="text-sm font-bold truncate uppercase">{link.label}</p>
                          </div>
                          <Button asChild size="icon" className="bg-accent text-background hover:bg-accent/80 shadow-[0_0_10px_rgba(0,242,255,0.2)]">
                            <a href={link.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                      <div className="flex items-start gap-3">
                        <Bot className="h-4 w-4 text-accent shrink-0 mt-1" />
                        <p className="text-[10px] leading-relaxed uppercase tracking-widest text-white/80">
                          {isExclusive ? 'Only one instance of this link exists in our registry.' : 'Links are checked daily by our automation protocol.'}
                        </p>
                      </div>
                      <div className="flex items-start gap-3 border-t border-white/5 pt-3">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-1" />
                        <p className="text-[10px] leading-relaxed uppercase tracking-widest text-muted-foreground">
                          Broken links can be reported via your <span className="text-yellow-500 font-bold">Dashboard</span> for immediate replacement.
                        </p>
                      </div>
                    </div>
                    
                    <Button onClick={handleAddToCart} disabled={isAdding} className={`w-full h-16 ${isExclusive ? 'bg-accent text-background hover:bg-accent/90' : (pricing.discount > 0 ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-primary text-white')} font-bold text-lg uppercase tracking-[0.2em] shadow-lg`}>
                      {isInCart ? "PROCEED TO CHECKOUT" : isAdding ? "COMMUNICATING..." : "BUY NOW"}
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">
                      <Lock className="h-3 w-3" /> Secure One-Time Delivery
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

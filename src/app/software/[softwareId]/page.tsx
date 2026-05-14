
"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShoppingCart, ShieldCheck, Lock, Monitor, Check, Zap, Info, Bot, AlertTriangle, HardDrive, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useFirestore, useDoc, useUser, useMemoFirebase } from "@/firebase";
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

const DEFAULT_SOFTWARE_IMAGE = "https://picsum.photos/seed/software/600/400";

export default function SoftwareDetailsPage({ params: paramsPromise }: { params: Promise<{ softwareId: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  
  const softwareRef = useMemoFirebase(() => db ? doc(db, "software", params.softwareId) : null, [db, params.softwareId]);
  const { data: software, loading } = useDoc(softwareRef);

  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile } = useDoc(userRef);

  const hasAccess = profile?.purchasedSoftware?.includes(params.softwareId);
  const isInCart = profile?.cart?.includes(params.softwareId);

  const handleAddToCart = async () => {
    if (!user || !db || !software) {
      router.push("/login");
      return;
    }
    if (isInCart) {
      router.push("/checkout");
      return;
    }
    setIsAdding(true);
    try {
      await setDoc(userRef!, { cart: arrayUnion(params.softwareId) }, { merge: true });
      toast({ title: "Added", description: "Software added to your cart." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not update cart." });
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-20"><Skeleton className="h-[400px] w-full rounded-2xl" /></div>;
  if (!software) return <div className="max-w-6xl mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold">Software Not Found</h2><Button className="mt-6" onClick={() => router.push("/software")}>Return to Store</Button></div>;

  const images = software.imageUrls?.length > 0 ? software.imageUrls : [DEFAULT_SOFTWARE_IMAGE];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <Link href="/software" className="inline-flex items-center text-xs font-bold text-accent uppercase tracking-widest hover:opacity-80 transition-opacity">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Store
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          <div className="relative rounded-3xl overflow-hidden border glass-card p-2 border-accent/20">
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
            <div className="absolute top-4 left-4 bg-accent/20 border border-accent/40 text-accent px-4 py-1 text-xs font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-md">
              <Monitor className="h-4 w-4" />
              Custom Digital Asset
            </div>
          </div>
          
          <Card className="glass-card border-white/5">
            <CardContent className="p-8 space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="outline" className="border-accent/20 text-accent uppercase px-3 py-1 font-bold tracking-widest">
                  Version: {software.version}
                </Badge>
                <Badge variant="outline" className="border-white/10 uppercase px-3 py-1 font-bold tracking-widest">
                  Manual Delivery Protocol
                </Badge>
              </div>

              <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-bold text-accent uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4" /> Professional Assurance
                </div>
                <p className="text-[11px] text-accent/80 leading-relaxed uppercase font-bold">
                  All software listed in our store undergoes rigorous testing for reliability and performance before deployment.
                </p>
              </div>

              <h2 className="font-headline text-3xl font-bold uppercase tracking-tight">Technical Intelligence</h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{software.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="glass-card tech-border sticky top-24 border-accent/20">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-1">
                <h1 className="font-headline text-3xl font-bold tracking-tighter uppercase">{software.title}</h1>
                <p className="text-accent text-[10px] uppercase font-bold tracking-[0.2em]">
                  CUSTOM BUILD PROTOCOL ACTIVE
                </p>
              </div>

              <div className="flex flex-col gap-2 border-y border-white/5 py-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Asset Valuation</span>
                  <div className="flex flex-col items-end">
                    <span className="text-4xl font-bold font-headline text-accent">
                      ₦{software.price?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {hasAccess ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-green-500 text-[10px] font-bold uppercase tracking-widest">
                      <ShieldCheck className="h-4 w-4" /> Acquisition Authorized
                    </div>
                    <div className="p-5 bg-accent/5 border border-accent/20 rounded-2xl space-y-4">
                      <p className="text-[11px] text-accent font-bold uppercase tracking-tight leading-relaxed">
                        ⚠️ Important: This software requires manual setup. Please contact our support team to complete the activation and receive your build.
                      </p>
                      <Button asChild className="w-full bg-accent text-background font-bold uppercase text-[10px] tracking-widest h-12 shadow-[0_0_15px_rgba(0,242,255,0.2)]">
                        <Link href="/dashboard/support">
                           <MessageSquare className="h-4 w-4 mr-2" /> Contact Admin for Setup
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                      <div className="flex items-start gap-3">
                        <Bot className="h-4 w-4 text-accent shrink-0 mt-1" />
                        <p className="text-[10px] leading-relaxed uppercase tracking-widest text-white/80">
                          Build delivery is handled manually to ensure correct configuration for your specific environment.
                        </p>
                      </div>
                      <div className="flex items-start gap-3 border-t border-white/5 pt-3">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-1" />
                        <p className="text-[10px] leading-relaxed uppercase tracking-widest text-muted-foreground">
                          Post-purchase support includes a full walk-through of the installation and license activation process.
                        </p>
                      </div>
                    </div>
                    
                    <Button onClick={handleAddToCart} disabled={isAdding} className="w-full h-16 bg-primary text-white font-bold text-lg uppercase tracking-[0.2em] shadow-lg hover:bg-primary/90">
                      {isInCart ? "PROCEED TO CHECKOUT" : isAdding ? "COMMUNICATING..." : "ACQUIRE ASSET"}
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">
                      <Lock className="h-3 w-3" /> Secure Transaction Terminal
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

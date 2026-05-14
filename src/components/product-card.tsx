"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Globe, Check, Cpu, Zap, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getBundlePricing } from "@/lib/pricing";

interface ProductCardProps {
  id: string;
  title: string;
  country: string;
  price: number;
  salesCount?: number;
  description: string;
  imageUrls: string[];
  imageHint: string;
}

const DEFAULT_IMAGE = "https://techstory.in/wp-content/uploads/2021/07/telegram.jpeg";

export function ProductCard({ id, title, country, price: basePrice, salesCount = 0, description, imageUrls, imageHint }: ProductCardProps) {
  const displayImage = imageUrls?.[0] || DEFAULT_IMAGE;
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const groupRef = useMemoFirebase(() => db ? doc(db, "groups", id) : null, [db, id]);
  const { data: group } = useDoc(groupRef);

  const pricing = getBundlePricing(basePrice, salesCount);
  const isExclusive = group?.type === 'exclusive';

  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile } = useDoc(userRef);

  const hasAccess = profile?.purchasedGroups?.includes(id);
  const isInCart = profile?.cart?.includes(id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !db) {
      router.push("/login");
      return;
    }

    if (hasAccess) {
      toast({
        title: "Already Owned",
        description: "You already have access to this group.",
      });
      return;
    }

    if (isInCart) {
      router.push("/checkout");
      return;
    }

    setIsAdding(true);
    try {
      await setDoc(userRef!, {
        cart: arrayUnion(id)
      }, { merge: true });

      toast({
        title: "Added to Cart",
        description: `${title} added to your checkout list.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add to cart.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  if (isExclusive && group?.isSold && !hasAccess) return null;

  return (
    <Card className={`overflow-hidden glass-card group hover:border-accent transition-all duration-500 rounded-none border-white/10 flex flex-col h-full tech-border relative min-w-0 ${isExclusive ? 'border-accent/60 shadow-[0_0_20px_rgba(0,242,255,0.15)]' : pricing.borderColor}`}>
      <div className="p-4 sm:p-5 flex flex-col h-full space-y-4">
        <div className="flex gap-4 items-start min-w-0">
          <Link href={`/products/${id}`} className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 border border-white/20 bg-black overflow-hidden group-hover:border-accent transition-colors">
            <Image
              src={displayImage}
              alt={title}
              fill
              className="object-contain opacity-90 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100"
              data-ai-hint={imageHint}
            />
          </Link>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex flex-col gap-1.5">
              <Link href={`/products/${id}`} className="block min-w-0">
                <h3 className="font-headline text-base sm:text-lg font-bold text-white group-hover:text-accent transition-colors truncate uppercase tracking-tighter">
                  {title}
                </h3>
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                {isExclusive ? (
                   <div className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-accent/20 border border-accent/60 text-accent flex items-center gap-1">
                      <Crown className="h-2.5 w-2.5" />
                      SINGLE (EXCLUSIVE)
                   </div>
                ) : (
                   <div className={`text-[9px] font-mono font-bold uppercase py-0.5 px-2 ${pricing.bgColor} border ${pricing.borderColor} ${pricing.color} flex items-center gap-1`}>
                      <Zap className="h-2.5 w-2.5" />
                      {pricing.tier}
                   </div>
                )}
                <div className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-white/10 border border-white/20 text-white flex items-center gap-1.5">
                  <Globe className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{country.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-foreground leading-relaxed font-mono uppercase tracking-wider break-words">
            {isExclusive ? 'Private one-off group link. This item will be deleted from store after purchase.' : `${pricing.description} • ${description}`}
          </p>
        </div>

        <div className="pt-4 border-t border-accent/20 flex items-center justify-between mt-auto gap-2">
          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-2">
              <span className={`text-lg sm:text-xl font-bold font-mono ${isExclusive ? 'text-accent' : pricing.color}`}>
                ₦{isExclusive ? basePrice.toLocaleString() : pricing.price.toLocaleString()}
              </span>
              {!isExclusive && pricing.discount > 0 && (
                <span className="text-[10px] line-through text-white/50 font-mono">
                  ₦{basePrice.toLocaleString()}
                </span>
              )}
            </div>
            {isExclusive && (
               <span className="text-[9px] font-bold text-accent uppercase tracking-widest flex items-center gap-1">
                  <Check className="h-2.5 w-2.5" /> ONE-TIME BUY
               </span>
            )}
            {!isExclusive && pricing.discount > 0 && (
              <span className="text-[9px] font-bold text-accent uppercase tracking-widest">
                -{pricing.discount}% OFF
              </span>
            )}
          </div>
          <div className="flex gap-2 min-w-0 shrink">
            <Button size="sm" variant="ghost" className="h-8 sm:h-9 px-2 sm:px-3 text-[10px] font-mono font-bold uppercase tracking-widest border border-accent/30 hover:bg-accent/10 rounded-none hidden xs:flex text-white" asChild>
              <Link href={`/products/${id}`}>
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                INFO
              </Link>
            </Button>
            <Button 
              size="sm" 
              className={`h-8 sm:h-9 px-3 sm:px-4 text-[10px] ${isExclusive ? 'bg-accent/20 text-accent border border-accent/60' : pricing.discount > 0 ? 'bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30' : 'bg-accent text-background hover:bg-accent/90'} font-mono font-bold uppercase tracking-widest rounded-none flex-1 sm:flex-none truncate`}
              onClick={handleAddToCart}
              disabled={isAdding || hasAccess}
            >
              {hasAccess ? "OWNED" : isInCart ? "CART" : isAdding ? "..." : "BUY"}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 right-0 p-1 opacity-40 pointer-events-none">
        <Cpu className="h-3.5 w-3.5 text-accent" />
      </div>
    </Card>
  );
}
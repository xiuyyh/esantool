
"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Globe, Check, Cpu, Zap } from "lucide-react";
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

  const pricing = getBundlePricing(basePrice, salesCount);

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
        description: `${title} has been added to your cart.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to cart.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className={`overflow-hidden glass-card group hover:border-accent transition-all duration-500 rounded-none border-white/5 flex flex-col h-full tech-border relative min-w-0 ${pricing.borderColor}`}>
      <div className="p-4 sm:p-5 flex flex-col h-full space-y-4">
        <div className="flex gap-4 items-start min-w-0">
          <Link href={`/products/${id}`} className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 border border-white/10 bg-black overflow-hidden group-hover:border-accent transition-colors">
            <Image
              src={displayImage}
              alt={title}
              fill
              className="object-contain opacity-70 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100"
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
                <div className={`text-[8px] font-mono font-bold uppercase py-0.5 px-2 ${pricing.bgColor} border ${pricing.borderColor} ${pricing.color} flex items-center gap-1`}>
                  <Zap className="h-2 w-2" />
                  {pricing.tier}
                </div>
                <div className="text-[8px] font-mono font-bold uppercase py-0.5 px-2 bg-white/5 border border-white/10 text-white/40 flex items-center gap-1.5">
                  <Globe className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{country.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed font-mono uppercase tracking-widest opacity-60 break-words">
            {pricing.description} • {description}
          </p>
        </div>

        <div className="pt-4 border-t border-accent/10 flex items-center justify-between mt-auto gap-2">
          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-2">
              <span className={`text-base sm:text-xl font-bold font-mono ${pricing.color}`}>
                ₦{pricing.price.toLocaleString()}
              </span>
              {pricing.discount > 0 && (
                <span className="text-[9px] line-through opacity-40 font-mono">
                  ₦{basePrice.toLocaleString()}
                </span>
              )}
            </div>
            {pricing.discount > 0 && (
              <span className="text-[8px] font-bold text-accent uppercase tracking-widest">
                -{pricing.discount}% AUTO-SLASH
              </span>
            )}
          </div>
          <div className="flex gap-2 min-w-0 shrink">
            <Button size="sm" variant="ghost" className="h-8 sm:h-9 px-2 sm:px-3 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest border border-accent/10 hover:bg-accent/10 rounded-none hidden xs:flex" asChild>
              <Link href={`/products/${id}`}>
                <Eye className="h-3 w-3 mr-1.5" />
                INFO
              </Link>
            </Button>
            <Button 
              size="sm" 
              className={`h-8 sm:h-9 px-3 sm:px-4 text-[9px] sm:text-[10px] ${pricing.discount > 0 ? 'bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30' : 'bg-accent text-background hover:bg-accent/80'} font-mono font-bold uppercase tracking-widest rounded-none flex-1 sm:flex-none truncate`}
              onClick={handleAddToCart}
              disabled={isAdding || hasAccess}
            >
              {hasAccess ? "OWNED" : isInCart ? "CART" : isAdding ? "..." : "BUY"}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 right-0 p-1 opacity-20 pointer-events-none">
        <Cpu className="h-3 w-3 text-accent" />
      </div>
    </Card>
  );
}

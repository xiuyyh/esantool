
"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Globe, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  id: string;
  title: string;
  country: string;
  price: number;
  description: string;
  imageUrls: string[];
  imageHint: string;
}

const DEFAULT_IMAGE = "https://techstory.in/wp-content/uploads/2021/07/telegram.jpeg";

export function ProductCard({ id, title, country, price, description, imageUrls, imageHint }: ProductCardProps) {
  const displayImage = imageUrls?.[0] || DEFAULT_IMAGE;
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const userRef = user && db ? doc(db, "users", user.uid) : null;
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
        description: "You already have access to this intelligence node.",
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
        description: `${title} has been staged for checkout.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update cart.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="overflow-hidden glass-card group hover:border-accent/40 transition-all duration-300 border-white/5 flex flex-col h-full shadow-lg hover:shadow-accent/5">
      <div className="p-4 flex flex-col h-full space-y-4">
        <div className="flex gap-4 items-center">
          <Link href={`/products/${id}`} className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-muted border border-white/10 shadow-inner">
            <Image
              src={displayImage}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              data-ai-hint={imageHint}
            />
          </Link>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex flex-col gap-1 mb-1">
              <Link href={`/products/${id}`}>
                <h3 className="font-headline text-base font-bold text-foreground group-hover:text-accent transition-colors truncate">
                  {title}
                </h3>
              </Link>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-2 border-accent/20 text-accent h-5 flex items-center gap-1">
                  <Globe className="h-2.5 w-2.5" />
                  {country || "Global Region"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-80">
            {description}
          </p>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
          <span className="text-lg font-bold font-headline text-accent">
            ₦{price.toLocaleString()}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider hover:bg-white/5" asChild>
              <Link href={`/products/${id}`}>
                <Eye className="h-3 w-3 mr-1.5" />
                VIEW
              </Link>
            </Button>
            <Button 
              size="sm" 
              className="h-8 px-4 text-[10px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest"
              onClick={handleAddToCart}
              disabled={isAdding || hasAccess}
            >
              {hasAccess ? (
                <>
                  <Check className="h-3 w-3 mr-1.5" />
                  OWNED
                </>
              ) : isInCart ? (
                "IN CART"
              ) : (
                <>
                  <ShoppingCart className="h-3 w-3 mr-1.5" />
                  {isAdding ? "WAIT..." : "ADD"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

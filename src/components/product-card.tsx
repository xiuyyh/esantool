"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Globe, Check, Cpu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
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
        title: "Access Granted",
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
        title: "Staged",
        description: `${title} added to procurement queue.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Protocol Error",
        description: "Failed to queue intelligence node.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="overflow-hidden glass-card group hover:border-accent transition-all duration-500 rounded-none border-accent/10 flex flex-col h-full tech-border relative">
      <div className="p-5 flex flex-col h-full space-y-5">
        <div className="flex gap-5 items-start">
          <Link href={`/products/${id}`} className="relative h-20 w-20 shrink-0 border border-accent/20 bg-black overflow-hidden group-hover:border-accent transition-colors">
            <Image
              src={displayImage}
              alt={title}
              fill
              className="object-contain opacity-70 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100"
              data-ai-hint={imageHint}
            />
          </Link>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex flex-col gap-2">
              <Link href={`/products/${id}`}>
                <h3 className="font-headline text-lg font-bold text-white group-hover:text-accent transition-colors truncate uppercase tracking-tighter">
                  {title}
                </h3>
              </Link>
              <div className="flex items-center gap-2">
                <div className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-accent/10 border border-accent/20 text-accent flex items-center gap-2">
                  <Globe className="h-2.5 w-2.5" />
                  Node_{country.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed font-mono uppercase tracking-widest opacity-60">
            {description}
          </p>
        </div>

        <div className="pt-5 border-t border-accent/10 flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-accent/40 uppercase tracking-widest mb-1">Procurement_Cost</span>
            <span className="text-xl font-bold font-mono text-accent">
              ₦{price.toLocaleString()}
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="h-9 px-3 text-[10px] font-mono font-bold uppercase tracking-widest border border-accent/10 hover:bg-accent/10 rounded-none" asChild>
              <Link href={`/products/${id}`}>
                <Eye className="h-3 w-3 mr-2" />
                INFO
              </Link>
            </Button>
            <Button 
              size="sm" 
              className="h-9 px-4 text-[10px] bg-accent hover:bg-accent/80 text-background font-mono font-bold uppercase tracking-widest rounded-none shadow-[0_0_15px_rgba(0,242,255,0.1)]"
              onClick={handleAddToCart}
              disabled={isAdding || hasAccess}
            >
              {hasAccess ? (
                <>
                  <Check className="h-3 w-3 mr-2" />
                  OWNED
                </>
              ) : isInCart ? (
                "STAGED"
              ) : (
                <>
                  <ShoppingCart className="h-3 w-3 mr-2" />
                  {isAdding ? "WAIT" : "QUEUE"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Visual Tech Flair */}
      <div className="absolute top-0 right-0 p-1 opacity-20">
        <Cpu className="h-3 w-3 text-accent" />
      </div>
    </Card>
  );
}
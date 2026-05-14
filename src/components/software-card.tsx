
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Monitor, HardDrive, ShoppingCart, Info, Eye, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface SoftwareCardProps {
  id: string;
  title: string;
  price: number;
  description: string;
  imageUrls: string[];
  version: string;
}

const DEFAULT_SOFTWARE_IMAGE = "https://picsum.photos/seed/software/600/400";

export function SoftwareCard({ id, title, price, description, imageUrls, version }: SoftwareCardProps) {
  const displayImage = imageUrls?.[0] || DEFAULT_SOFTWARE_IMAGE;
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile } = useDoc(userRef);

  const hasAccess = profile?.purchasedSoftware?.includes(id);
  const isInCart = profile?.cart?.includes(id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || !db) {
      router.push("/login");
      return;
    }

    if (hasAccess) {
      toast({ title: "Authorized", description: "You already own this software." });
      return;
    }

    if (isInCart) {
      router.push("/checkout");
      return;
    }

    setIsAdding(true);
    try {
      await setDoc(userRef!, { cart: arrayUnion(id) }, { merge: true });
      toast({ title: "Registry Updated", description: `${title} added to acquisition queue.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update queue." });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="glass-card group hover:border-accent transition-all duration-500 rounded-none border-white/5 flex flex-col h-full tech-border relative overflow-hidden">
      <div className="p-4 sm:p-5 flex flex-col h-full space-y-4">
        <div className="flex gap-4 items-start min-w-0">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 border border-white/10 bg-black overflow-hidden group-hover:border-accent transition-colors">
            <Image
              src={displayImage}
              alt={title}
              fill
              className="object-contain opacity-70 group-hover:opacity-100 transition-all duration-500"
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-headline text-base sm:text-lg font-bold text-white group-hover:text-accent transition-colors truncate uppercase tracking-tighter">
                {title}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                 <div className="text-[8px] font-mono font-bold uppercase py-0.5 px-2 bg-accent/20 border border-accent/40 text-accent flex items-center gap-1">
                    <Monitor className="h-2 w-2" />
                    SOFTWARE
                 </div>
                 <div className="text-[8px] font-mono font-bold uppercase py-0.5 px-2 bg-white/5 border border-white/10 text-white/40">
                   V{version}
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed font-mono uppercase tracking-widest opacity-60">
            {description}
          </p>
        </div>

        <div className="pt-4 border-t border-accent/10 flex items-center justify-between mt-auto gap-2">
          <div className="flex flex-col">
            <span className="text-base sm:text-xl font-bold font-headline text-accent">
              ₦{price.toLocaleString()}
            </span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
               DIGITAL ASSET
            </span>
          </div>
          <Button 
            size="sm" 
            className="h-8 sm:h-9 px-4 text-[9px] sm:text-[10px] bg-accent text-background hover:bg-accent/80 font-mono font-bold uppercase tracking-widest rounded-none"
            onClick={handleAddToCart}
            disabled={isAdding || hasAccess}
          >
            {hasAccess ? "OWNED" : isInCart ? "CART" : isAdding ? "..." : "BUY"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

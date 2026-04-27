
"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProductCardProps {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  imageHint: string;
}

export function ProductCard({ id, title, category, price, description, imageUrl, imageHint }: ProductCardProps) {
  return (
    <Card className="overflow-hidden glass-card group hover:border-accent/40 transition-all duration-200 border-white/5">
      <div className="flex p-3 gap-4 items-center">
        {/* Compact Image */}
        <div className="relative h-20 w-20 shrink-0 rounded-md overflow-hidden bg-muted border border-white/5">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              data-ai-hint={imageHint}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-secondary/20">
              <span className="text-[10px] text-muted-foreground">No img</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-headline text-sm font-bold text-foreground group-hover:text-accent transition-colors truncate pr-2">
              {title}
            </h3>
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-accent/20 text-accent h-5">
              {category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
            {description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold font-headline text-accent">
              ₦{price.toLocaleString()}
            </span>
            <Button size="sm" className="h-7 px-3 text-[10px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              <ShoppingCart className="h-3 w-3 mr-1" />
              BUY
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

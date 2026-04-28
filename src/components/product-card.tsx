
"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProductCardProps {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string;
  imageUrls: string[];
  imageHint: string;
}

export function ProductCard({ id, title, category, price, description, imageUrls, imageHint }: ProductCardProps) {
  const displayImage = imageUrls?.[0] || "";

  return (
    <Card className="overflow-hidden glass-card group hover:border-accent/40 transition-all duration-200 border-white/5">
      <div className="flex p-3 gap-4 items-center">
        {/* Compact Image */}
        <Link href={`/products/${id}`} className="relative h-20 w-20 shrink-0 rounded-md overflow-hidden bg-muted border border-white/5">
          {displayImage ? (
            <Image
              src={displayImage}
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
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1">
            <Link href={`/products/${id}`}>
              <h3 className="font-headline text-sm font-bold text-foreground group-hover:text-accent transition-colors truncate pr-2">
                {title}
              </h3>
            </Link>
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
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] hover:text-accent" asChild>
                <Link href={`/products/${id}`}>
                  <Eye className="h-3 w-3 mr-1" />
                  VIEW
                </Link>
              </Button>
              <Button size="sm" className="h-7 px-3 text-[10px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                <ShoppingCart className="h-3 w-3 mr-1" />
                BUY
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

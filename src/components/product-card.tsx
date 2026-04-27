
"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

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
    <Card className="overflow-hidden glass-card group hover:border-accent/50 transition-all duration-300">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            data-ai-hint={imageHint}
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-white/10">
              {category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-2">
        <h3 className="font-headline text-lg font-bold text-foreground group-hover:text-accent transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      </CardContent>
      <CardFooter className="p-5 pt-0 flex items-center justify-between">
        <span className="text-xl font-bold font-headline text-accent">
          ${price.toFixed(2)}
        </span>
        <div className="flex space-x-2">
          <Button size="icon" variant="outline" className="border-white/10 hover:border-accent">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button className="bg-primary hover:bg-primary/90 flex items-center space-x-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Buy</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

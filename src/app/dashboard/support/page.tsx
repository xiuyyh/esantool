
"use client";

import { ChevronLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SupportPage() {
  const WHATSAPP_NUMBER = "+2349167241442";
  const WHATSAPP_LINK = "https://wa.me/2349167241442";

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 lg:py-20 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center text-[10px] font-bold text-accent uppercase tracking-[0.2em] hover:opacity-80 transition-opacity">
          <ChevronLeft className="h-3 w-3 mr-1" />
          Back
        </Link>
        <div className="flex items-center gap-2">
           <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Support Online</span>
        </div>
      </div>

      <Card className="glass-card border-accent/20 overflow-hidden bg-black/40 w-full">
        <CardHeader className="text-center pb-2 pt-8">
          <CardTitle className="font-headline text-2xl font-bold uppercase tracking-tight text-white">Help Center</CardTitle>
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Fast response via WhatsApp</p>
        </CardHeader>
        
        <CardContent className="pt-4 pb-8 space-y-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="space-y-1">
              <p className="font-mono text-sm text-white font-bold tracking-widest">{WHATSAPP_NUMBER}</p>
              <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-mono">Available: 9AM - 9PM</p>
            </div>

            <Button 
              asChild
              className="w-full h-12 bg-accent hover:bg-accent/80 text-background font-bold uppercase tracking-[0.2em] text-[10px] shadow-[0_0_15px_rgba(0,242,255,0.1)]"
            >
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                Start Chat
                <ExternalLink className="ml-2 h-3 w-3 opacity-50" />
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div className="text-left space-y-1 p-4 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[8px] font-bold text-accent uppercase tracking-widest">Payments</p>
              <p className="text-[9px] text-muted-foreground uppercase leading-tight">Send transfer proof for manual verification.</p>
            </div>
            <div className="text-left space-y-1 p-4 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[8px] font-bold text-accent uppercase tracking-widest">Access</p>
              <p className="text-[9px] text-muted-foreground uppercase leading-tight">Report issues with broken group links.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-center text-[8px] uppercase tracking-widest text-muted-foreground opacity-50 font-mono">
        Include your email address in the message for faster resolution.
      </p>
    </div>
  );
}

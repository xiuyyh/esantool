
"use client";

import { MessageCircle, ChevronLeft, ShieldCheck, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SupportPage() {
  const WHATSAPP_NUMBER = "+2349167241442";
  const WHATSAPP_LINK = "https://wa.me/2349167241442";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 lg:py-20 space-y-8">
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

      <Card className="glass-card border-accent/20 overflow-hidden bg-black/40">
        <CardHeader className="text-center pb-2">
          <CardTitle className="font-headline text-3xl font-bold uppercase tracking-tight text-white">Help Center</CardTitle>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Fast response via WhatsApp</p>
        </CardHeader>
        
        <CardContent className="pt-6 pb-10 space-y-8 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="h-20 w-20 bg-accent/10 rounded-full flex items-center justify-center border border-accent/20">
              <MessageCircle className="h-10 w-10 text-accent" />
            </div>

            <div className="space-y-1">
              <p className="font-mono text-sm text-white font-bold tracking-widest">{WHATSAPP_NUMBER}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">Available: 9AM - 9PM</p>
            </div>

            <Button 
              asChild
              className="w-full h-14 bg-accent hover:bg-accent/80 text-background font-bold uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(0,242,255,0.2)]"
            >
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <Zap className="h-4 w-4 mr-2" />
                Start Chat
                <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-50" />
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div className="text-left space-y-1">
              <p className="text-[9px] font-bold text-accent uppercase tracking-widest">Payments</p>
              <p className="text-[10px] text-muted-foreground uppercase leading-tight">Send transfer proof for faster wallet funding.</p>
            </div>
            <div className="text-left space-y-1">
              <p className="text-[9px] font-bold text-accent uppercase tracking-widest">Access</p>
              <p className="text-[10px] text-muted-foreground uppercase leading-tight">Issues with links or software downloads.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-center text-[9px] uppercase tracking-widest text-muted-foreground opacity-50 font-mono">
        Please include your registered email in your message.
      </p>
    </div>
  );
}

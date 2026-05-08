
"use client";

import { MessageCircle, ChevronLeft, ShieldCheck, ExternalLink, Terminal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function SupportPage() {
  const WHATSAPP_LINK = "https://wa.me/17345832929";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 lg:py-20 space-y-10">
      <div className="space-y-1">
        <Link href="/dashboard" className="inline-flex items-center text-[10px] font-bold text-accent uppercase tracking-[0.2em] hover:opacity-80 mb-3 transition-opacity">
          <ChevronLeft className="h-3 w-3 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="font-headline text-4xl sm:text-6xl font-bold uppercase tracking-tight text-white">Support Protocol</h1>
        <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">Direct encrypted line to administrative staff</p>
      </div>

      <Card className="glass-card border-accent/20 tech-border relative overflow-hidden bg-black/40">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Terminal className="h-20 w-20 text-accent" />
        </div>
        
        <CardHeader className="pb-4 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-accent/10 p-2 rounded-lg border border-accent/20">
              <ShieldCheck className="h-5 w-5 text-accent" />
            </div>
            <CardTitle className="text-xl uppercase tracking-[0.2em] text-white">External Communication</CardTitle>
          </div>
          <CardDescription className="text-[10px] uppercase tracking-widest opacity-60">
            For rapid resolution of technical issues or payment inquiries.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-10 pb-12 space-y-8 text-center relative z-10">
          <div className="max-w-md mx-auto space-y-6">
            <div className="p-6 rounded-none border border-white/5 bg-white/[0.02] flex flex-col items-center gap-4">
              <div className="h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center border border-accent/20 animate-pulse">
                <MessageCircle className="h-8 w-8 text-accent" />
              </div>
              <div className="space-y-2">
                <p className="font-mono text-xs text-white/80 uppercase tracking-widest">Authorized Channel: WhatsApp</p>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">+1 (734) 583-2929</p>
              </div>
            </div>

            <p className="text-[10px] leading-relaxed text-muted-foreground uppercase tracking-widest font-mono italic opacity-60">
              Clicking below will redirect you to our secure mobile messaging terminal. Our staff typically responds within standard operational hours.
            </p>

            <Button 
              asChild
              className="w-full h-16 bg-accent hover:bg-accent/80 text-background font-bold uppercase tracking-[0.3em] text-xs shadow-[0_0_20px_rgba(0,242,255,0.2)] rounded-none group transition-all"
            >
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <Zap className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Initiate Secure Chat
                <ExternalLink className="ml-3 h-4 w-4 opacity-50" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-white/5 bg-white/[0.02] space-y-2">
          <p className="text-[9px] font-bold text-accent uppercase tracking-widest">Protocol 1.0</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Ensure you provide your registered email address when messaging staff for faster account verification.</p>
        </div>
        <div className="p-4 border border-white/5 bg-white/[0.02] space-y-2">
          <p className="text-[9px] font-bold text-accent uppercase tracking-widest">Security Note</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Staff will never ask for your password. Only share transaction screenshots for top-up verification.</p>
        </div>
      </div>
    </div>
  );
}

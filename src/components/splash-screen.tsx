
"use client";

import { useState, useEffect } from "react";
import { Terminal, ShieldCheck, Zap, Globe, ArrowRight, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const hasSeenSplash = localStorage.getItem("esan_splash_seen");
    if (!hasSeenSplash) {
      setIsDismissed(false);
      // Small delay for entrance animation
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("esan_splash_seen", "true");
    // Wait for exit animation
    setTimeout(() => setIsDismissed(true), 500);
  };

  if (isDismissed) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[200] flex items-center justify-center bg-background transition-opacity duration-500",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.05)_0%,transparent_70%)]"></div>
      
      <div className={cn(
        "max-w-2xl w-full mx-4 p-8 glass-card border-accent/20 tech-border relative overflow-hidden transition-all duration-700 transform",
        isVisible ? "translate-y-0 scale-100" : "translate-y-10 scale-95"
      )}>
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Cpu className="h-32 w-32 text-accent" />
        </div>

        <div className="space-y-8 relative z-10">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
              <Terminal className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h1 className="font-headline text-3xl font-bold uppercase tracking-tight text-white leading-none">ESAN TOOLS</h1>
              <p className="text-accent text-[10px] uppercase font-bold tracking-[0.3em] mt-2">Digital Procurement Protocol</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-mono leading-relaxed">
              Welcome to the underground gateway. We provide secure, verified access to private digital communities and regional intelligence networks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-white/5 bg-white/[0.02] space-y-2">
                <div className="flex items-center gap-2 text-accent">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Private Access</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Verified entry into exclusive private Telegram groups.</p>
              </div>
              
              <div className="p-4 border border-white/5 bg-white/[0.02] space-y-2">
                <div className="flex items-center gap-2 text-accent">
                  <Zap className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Node Bundles</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Multiple links packaged in a single authorized bundle.</p>
              </div>
              
              <div className="p-4 border border-white/5 bg-white/[0.02] space-y-2">
                <div className="flex items-center gap-2 text-accent">
                  <Globe className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Global Regions</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Sort and find communities by regional deployment nodes.</p>
              </div>

              <div className="p-4 border border-white/5 bg-white/[0.02] space-y-2">
                <div className="flex items-center gap-2 text-accent">
                  <ArrowRight className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Secure Wallet</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Fund your internal balance for seamless acquisitions.</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleDismiss}
            className="w-full h-14 bg-accent hover:bg-accent/80 text-background font-bold uppercase tracking-[0.3em] text-xs shadow-[0_0_20px_rgba(0,242,255,0.2)] rounded-none group"
          >
            Enter Marketplace
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <span className="text-[8px] uppercase font-mono text-muted-foreground tracking-[0.2em]">Session Status: Encrypted</span>
            <span className="text-[8px] uppercase font-mono text-muted-foreground tracking-[0.2em]">Region: Local-01</span>
          </div>
        </div>
      </div>
    </div>
  );
}

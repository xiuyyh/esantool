
"use client";

import { useState, useEffect } from "react";
import { Terminal, ShieldCheck, Zap, ArrowRight, Cpu } from "lucide-react";
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
        "fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-md transition-opacity duration-500",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.03)_0%,transparent_70%)]"></div>
      
      <div className={cn(
        "max-w-md w-full mx-4 p-8 glass-card border-accent/20 tech-border relative overflow-hidden transition-all duration-700 transform",
        isVisible ? "translate-y-0 scale-100" : "translate-y-10 scale-95"
      )}>
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Cpu className="h-24 w-24 text-accent" />
        </div>

        <div className="space-y-6 relative z-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-accent/10 p-3 rounded-xl border border-accent/20">
              <Terminal className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h1 className="font-headline text-2xl font-bold uppercase tracking-tight text-white leading-none">ESAN TOOLS</h1>
              <p className="text-accent text-[9px] uppercase font-bold tracking-[0.3em] mt-2">Premium Group Access</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-mono leading-relaxed">
              Verified access to high-quality Telegram groups and exclusive digital bundles.
            </p>

            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 p-3 border border-white/5 bg-white/[0.02] text-left">
                <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Vetted Private Communities</span>
              </div>
              <div className="flex items-center gap-3 p-3 border border-white/5 bg-white/[0.02] text-left">
                <Zap className="h-4 w-4 text-accent shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Multi-Link Protocol Bundles</span>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleDismiss}
            className="w-full h-12 bg-accent hover:bg-accent/80 text-background font-bold uppercase tracking-[0.3em] text-[10px] shadow-[0_0_20px_rgba(0,242,255,0.2)] rounded-none group"
          >
            Enter Marketplace
            <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-[8px] uppercase font-mono text-muted-foreground tracking-[0.2em] opacity-40">
            Secure Node Deployment: Active
          </p>
        </div>
      </div>
    </div>
  );
}

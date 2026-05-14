
"use client";

import { useState, useMemo, useEffect } from "react";
import { Monitor, HardDrive, Info, Cpu } from "lucide-react";
import { SoftwareCard } from "@/components/software-card";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export default function SoftwareStorePage() {
  const [year, setYear] = useState<number | null>(null);

  const db = useFirestore();
  const softwareQuery = useMemoFirebase(() => db ? collection(db, "software") : null, [db]);
  const { data: allSoftware, loading } = useCollection(softwareQuery);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col flex-1 w-full min-w-0">
      <section className="py-3 bg-black/40 border-b border-accent/20 overflow-hidden whitespace-nowrap relative w-full pointer-events-none select-none z-10">
        <div className="flex animate-marquee items-center gap-16 w-max">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-accent/40">
                Software Lab: Online
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
                Custom Builds Available
              </span>
              <Cpu className="h-3 w-3 text-accent/20" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-accent/40">
                Support: 24/7
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-screen-2xl px-6 sm:px-10 py-12 flex-1 w-full min-w-0 mx-auto">
        <div className="flex flex-col space-y-12">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-accent/10 pb-10 relative">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-accent/60 font-mono text-xs tracking-[0.4em] uppercase">
                <Monitor className="h-4 w-4" />
                Professional Custom Software
              </div>
              <h1 className="font-headline text-5xl sm:text-7xl font-bold tracking-tighter uppercase text-white">
                SOFTWARE STORE
              </h1>
              <p className="text-muted-foreground text-sm font-medium tracking-wide max-w-xl">
                Source custom-built digital tools designed for specific tasks. High performance, private, and reliable software assets.
              </p>
            </div>
          </div>

          <div className="p-4 bg-accent/5 border border-accent/20 flex items-center gap-3">
             <Info className="h-4 w-4 text-accent shrink-0" />
             <p className="text-[10px] uppercase font-bold tracking-widest text-accent leading-relaxed">
                After purchase, contact our support team for full setup, installation guides, and license activation.
             </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
              <div className="h-16 w-16 border-2 border-accent border-t-transparent rounded-none animate-spin"></div>
              <p className="font-mono uppercase tracking-[0.5em] text-[10px] text-accent animate-pulse">Initializing Lab...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {allSoftware.map((s: any) => (
                <SoftwareCard 
                  key={s.id}
                  id={s.id}
                  title={s.title}
                  price={s.price}
                  description={s.description}
                  imageUrls={s.imageUrls || []}
                  version={s.version}
                />
              ))}
            </div>
          )}
          
          {!loading && allSoftware.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 glass-card rounded-none border-dashed border-2 border-accent/10 text-center px-6 tech-border">
              <HardDrive className="h-12 w-12 text-accent/20 mb-6" />
              <h3 className="text-2xl font-bold font-headline uppercase tracking-tighter text-white">Lab Empty</h3>
              <p className="text-muted-foreground mt-2 text-sm font-mono tracking-widest uppercase opacity-60">No software available in the registry.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-auto py-16 border-t border-accent/10 bg-black/40 backdrop-blur-md">
        <div className="max-w-screen-2xl px-10 text-center mx-auto">
          <div className="flex items-center justify-center space-x-4 mb-10">
            <div className="bg-accent/10 p-4 border border-accent/20">
              <Monitor className="h-6 w-6 text-accent" />
            </div>
            <div className="text-left">
              <span className="font-headline font-bold text-2xl tracking-tighter text-white block leading-none">ESAN SOFTWARE</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-accent/60">Digital Asset Marketplace</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 opacity-40 font-mono text-[10px] uppercase tracking-[0.2em]">
            <p>Manual Delivery Active.</p>
            <p>© {year || "..."} ESAN TOOLS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
      <section className="py-3 bg-black/60 border-b border-accent/30 overflow-hidden whitespace-nowrap relative w-full pointer-events-none select-none z-10">
        <div className="flex animate-marquee items-center gap-16 w-max">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-6">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
                Software Lab: Online
              </span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-white">
                Custom Builds Available
              </span>
              <Cpu className="h-4 w-4 text-accent" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
                Support: 24/7
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-screen-2xl px-6 sm:px-10 py-12 flex-1 w-full min-w-0 mx-auto">
        <div className="flex flex-col space-y-12">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-accent/20 pb-10 relative">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-accent font-mono text-xs tracking-[0.4em] uppercase font-bold">
                <Monitor className="h-5 w-5" />
                Professional Custom Software
              </div>
              <h1 className="font-headline text-5xl sm:text-7xl font-bold tracking-tighter uppercase text-white drop-shadow-lg">
                SOFTWARE STORE
              </h1>
              <p className="text-white text-base font-medium tracking-wide max-w-xl leading-relaxed">
                Source custom-built digital tools designed for specific tasks. High performance, private, and reliable software assets.
              </p>
            </div>
          </div>

          <div className="p-5 bg-accent/10 border border-accent/40 flex items-center gap-4 shadow-lg shadow-accent/5">
             <Info className="h-5 w-5 text-accent shrink-0" />
             <p className="text-[11px] sm:text-xs uppercase font-bold tracking-widest text-accent leading-relaxed">
                After purchase, contact our support team for full setup, installation guides, and license activation.
             </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
              <div className="h-16 w-16 border-4 border-accent border-t-transparent rounded-none animate-spin"></div>
              <p className="font-mono uppercase tracking-[0.5em] text-xs text-accent animate-pulse font-bold">Initializing Lab...</p>
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
            <div className="flex flex-col items-center justify-center py-32 glass-card rounded-none border-dashed border-2 border-accent/20 text-center px-6 tech-border">
              <HardDrive className="h-14 w-14 text-accent mb-6" />
              <h3 className="text-3xl font-bold font-headline uppercase tracking-tighter text-white">Lab Empty</h3>
              <p className="text-white mt-2 text-sm font-mono tracking-widest uppercase font-bold">No software available in the registry.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-auto py-20 border-t border-accent/20 bg-black/60 backdrop-blur-xl">
        <div className="max-w-screen-2xl px-10 text-center mx-auto">
          <div className="flex items-center justify-center space-x-5 mb-12">
            <div className="bg-accent/20 p-4 border border-accent/40 shadow-lg shadow-accent/5">
              <Monitor className="h-7 w-7 text-accent" />
            </div>
            <div className="text-left">
              <span className="font-headline font-bold text-3xl tracking-tighter text-white block leading-none">ESAN SOFTWARE</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent font-bold">Digital Asset Marketplace</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] font-bold text-white/60">
            <p className="text-accent">Manual Delivery Active.</p>
            <p>© {year || "..."} ESAN TOOLS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
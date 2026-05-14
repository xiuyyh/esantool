
"use client";

import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, ChevronLeft, Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FAQPage() {
  const db = useFirestore();
  const faqsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "faqs"), orderBy("order", "asc"));
  }, [db]);
  const { data: faqs, loading } = useCollection(faqsQuery);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 space-y-12">
      <div className="space-y-2">
        <Link href="/" className="inline-flex items-center text-[10px] font-bold text-accent uppercase tracking-[0.2em] hover:opacity-80 mb-3 transition-opacity">
          <ChevronLeft className="h-3 w-3 mr-1" />
          Back to Shop
        </Link>
        <h1 className="font-headline text-4xl sm:text-6xl font-bold uppercase tracking-tight text-white">FAQ</h1>
        <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">Common questions about our service</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Accessing Registry...</p>
        </div>
      ) : faqs.length > 0 ? (
        <div className="glass-card border-white/5 p-2 sm:p-4 rounded-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq: any, index: number) => (
              <AccordionItem key={faq.id} value={`faq-${index}`} className="border-white/5 px-4">
                <AccordionTrigger className="text-sm sm:text-base font-bold text-left uppercase tracking-tight hover:text-accent hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : (
        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-40">
          <HelpCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="text-sm uppercase tracking-widest font-bold">No FAQs found yet.</p>
        </div>
      )}

      <div className="p-8 glass-card border-accent/20 bg-accent/5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-bold uppercase tracking-tight">Still have questions?</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Our support team is active and ready to help.</p>
        </div>
        <Button asChild className="bg-accent text-background font-bold uppercase tracking-widest px-8 h-12 shadow-[0_0_15px_rgba(0,242,255,0.2)]">
          <Link href="/dashboard/support">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Support
          </Link>
        </Button>
      </div>
    </div>
  );
}

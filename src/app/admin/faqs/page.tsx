
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFirestore, useCollection, useUser, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit3, HelpCircle, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminFAQPage() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile, loading: profileLoading } = useDoc(userRef);

  const faqsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "faqs"), orderBy("order", "asc"));
  }, [db]);
  const { data: faqs, loading: faqsLoading } = useCollection(faqsQuery);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [order, setOrder] = useState("0");
  
  const [editingFAQ, setEditingFAQ] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/admin/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!profileLoading && profile && !profile.isAdmin) {
      toast({ variant: "destructive", title: "Access Denied", description: "Admin privileges required." });
      router.push("/");
    }
  }, [profile, profileLoading, router, toast]);

  const handleAddFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    const data = {
      question,
      answer,
      order: Number(order),
      createdAt: serverTimestamp(),
    };

    addDoc(collection(db, "faqs"), data)
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'faqs',
          operation: 'create',
          requestResourceData: data
        }));
      });
    
    toast({ title: "Success", description: "FAQ added to the registry." });
    setQuestion("");
    setAnswer("");
    setOrder((faqs.length + 1).toString());
  };

  const handleDeleteFAQ = (id: string) => {
    if (!db || !confirm("Delete this FAQ?")) return;
    deleteDoc(doc(db, "faqs", id))
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `faqs/${id}`,
          operation: 'delete'
        }));
      });
    toast({ title: "Deleted", description: "FAQ removed from public view." });
  };

  const openEditDialog = (item: any) => {
    setEditingFAQ({ ...item });
    setIsEditDialogOpen(true);
  };

  const handleUpdateFAQ = () => {
    if (!db || !editingFAQ) return;
    
    const docRef = doc(db, "faqs", editingFAQ.id);
    const updateData = {
      question: editingFAQ.question,
      answer: editingFAQ.answer,
      order: Number(editingFAQ.order),
    };

    updateDoc(docRef, updateData)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updateData
        }));
      });

    toast({ title: "Updated", description: "FAQ registry updated." });
    setIsEditDialogOpen(false);
    setEditingFAQ(null);
  };

  if (authLoading || profileLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user || !profile?.isAdmin) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12 overflow-x-hidden">
      <div className="border-b border-white/5 pb-6">
        <h1 className="font-headline text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white">FAQ Center</h1>
        <p className="text-muted-foreground mt-1 text-[10px] sm:text-xs uppercase tracking-widest font-mono">Manage Public Frequently Asked Questions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
        <div className="lg:col-span-8 space-y-8 min-w-0">
          <Card className="glass-card border-white/5 w-full">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="font-headline text-lg sm:text-xl uppercase tracking-widest text-white">Create New FAQ</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <form onSubmit={handleAddFAQ} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Question</Label>
                  <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. How do I top up my balance?" required className="bg-white/5 h-12" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Answer</Label>
                  <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="bg-white/5 min-h-[120px] border-white/10" placeholder="Provide a clear and simple answer..." required />
                </div>

                <div className="w-full sm:w-1/3 space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Display Order</Label>
                  <Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="bg-white/5 h-12" />
                </div>

                <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90 font-bold h-14 uppercase tracking-widest text-xs shadow-lg">
                   <HelpCircle className="h-4 w-4 mr-2" />
                   Add FAQ Entry
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <Card className="glass-card border-white/5 bg-accent/5">
              <CardHeader className="p-6">
                 <CardTitle className="text-sm uppercase tracking-[0.2em] font-bold text-accent">FAQ Statistics</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground">Total Questions</span>
                    <span className="text-xl font-bold text-white">{faqs.length}</span>
                 </div>
                 <div className="p-4 rounded-xl border border-white/5 bg-black/20">
                    <p className="text-[9px] text-muted-foreground uppercase leading-relaxed">
                       FAQs are displayed on the public help page to reduce support requests.
                    </p>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="font-headline text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">FAQ Registry</h2>
        <Card className="glass-card border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5">
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-white/60 w-16 text-center">Order</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-white/60">Question</TableHead>
                  <TableHead className="font-bold text-right uppercase text-[10px] tracking-widest text-white/60">Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map((faq: any) => (
                  <TableRow key={faq.id} className="hover:bg-white/5 border-white/5">
                    <TableCell className="font-mono text-[12px] text-white/60 text-center">{faq.order}</TableCell>
                    <TableCell className="font-bold text-sm text-white truncate max-w-[300px]">{faq.question}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(faq)} className="h-8 w-8 text-accent hover:bg-accent/10"><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteFAQ(faq.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {faqs.length === 0 && !faqsLoading && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 opacity-40 uppercase text-[10px]">Registry empty.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-white/10 max-w-2xl">
          <DialogHeader><DialogTitle className="font-headline text-lg uppercase tracking-widest text-white">Update FAQ Entry</DialogTitle></DialogHeader>
          {editingFAQ && (
            <div className="space-y-6 py-4">
              <div className="space-y-1">
                <Label className="text-[9px] uppercase font-bold">Display Order</Label>
                <Input type="number" value={editingFAQ.order} onChange={(e) => setEditingFAQ({...editingFAQ, order: e.target.value})} className="bg-white/5 w-1/3" />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] uppercase font-bold">Question</Label>
                <Input value={editingFAQ.question} onChange={(e) => setEditingFAQ({...editingFAQ, question: e.target.value})} className="bg-white/5" />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] uppercase font-bold">Answer</Label>
                <Textarea value={editingFAQ.answer} onChange={(e) => setEditingFAQ({...editingFAQ, answer: e.target.value})} className="bg-white/5 min-h-[120px]" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="text-white/60">Cancel</Button>
            <Button onClick={handleUpdateFAQ} className="bg-primary text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

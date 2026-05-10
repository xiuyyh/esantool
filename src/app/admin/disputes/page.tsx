
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Loader2, Link as LinkIcon, Plus, Trash2, CheckCircle, Send, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminDisputesPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [resLinks, setResLinks] = useState([{ label: "", url: "" }]);
  const [isProcessing, setIsProcessing] = useState(false);

  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile, loading: profileLoading } = useDoc(userRef);

  useEffect(() => {
    if (!authLoading && !user) router.push("/admin/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!profileLoading && profile && !profile.isAdmin) {
      toast({ variant: "destructive", title: "Access Denied", description: "Administrator privileges required." });
      router.push("/");
    }
  }, [profile, profileLoading, router, toast]);

  const disputesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "disputes"), orderBy("createdAt", "desc"));
  }, [db]);
  const { data: disputes, loading } = useCollection(disputesQuery);

  const addResLink = () => setResLinks([...resLinks, { label: "", url: "" }]);
  const removeResLink = (idx: number) => setResLinks(resLinks.filter((_, i) => i !== idx));
  const updateResLink = (idx: number, field: string, val: string) => {
    const l = [...resLinks];
    (l[idx] as any)[field] = val;
    setResLinks(l);
  };

  const handleResolve = async () => {
    if (!db || !selectedDispute) return;
    const validLinks = resLinks.filter(l => l.label && l.url);
    if (validLinks.length === 0) {
      toast({ variant: "destructive", title: "Missing Data", description: "Provide at least one compensation node." });
      return;
    }

    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "disputes", selectedDispute.id), {
        status: "resolved",
        resolutionLinks: validLinks
      });
      toast({ title: "Resolved", description: "Compensated groups delivered to user." });
      setSelectedDispute(null);
      setResLinks([{ label: "", url: "" }]);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Operation failed." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Delete this dispute record?")) return;
    await deleteDoc(doc(db, "disputes", id));
    toast({ title: "Deleted", description: "Record removed." });
  };

  if (authLoading || profileLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user || !profile?.isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tight text-white">Junk Group Resolution</h1>
          <p className="text-muted-foreground mt-1 text-xs uppercase tracking-widest font-mono">Verify and compensate for protocol errors</p>
        </div>
        <ShieldAlert className="h-10 w-10 text-primary opacity-50" />
      </div>

      <Card className="glass-card border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-white/60">User / Identity</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-white/60">Bundle Target</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-white/60">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-white/60 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10 opacity-40 uppercase text-[10px]">Scanning Ledger...</TableCell></TableRow>
            ) : disputes.length > 0 ? (
              disputes.map((d: any) => (
                <TableRow key={d.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-white">{d.userEmail}</span>
                      <span className="text-[9px] text-muted-foreground font-mono">{d.createdAt ? format(d.createdAt.toDate(), 'MMM dd, HH:mm') : 'Recent'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs uppercase text-accent">{d.groupTitle}</span>
                      <span className="text-[9px] opacity-40 truncate max-w-[200px]">{d.reason}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`uppercase text-[9px] font-bold ${d.status === 'pending' ? 'border-yellow-500/50 text-yellow-500' : 'border-green-500/50 text-green-500'}`}>
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {d.status === 'pending' && (
                        <Button size="sm" onClick={() => setSelectedDispute(d)} className="h-8 text-[9px] font-bold uppercase tracking-widest bg-accent text-background hover:bg-accent/80">
                          Resolve
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="text-center py-20 opacity-40 uppercase text-[10px] tracking-widest">No resolution requests.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!selectedDispute} onOpenChange={(o) => !o && setSelectedDispute(null)}>
        <DialogContent className="glass-card border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl uppercase tracking-widest text-white">Compensate Protocol</DialogTitle>
            <DialogDescription className="text-xs opacity-60">Providing replacement nodes for {selectedDispute?.userEmail}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <p className="text-[10px] font-bold uppercase text-accent tracking-widest">Claim Reason:</p>
              <p className="text-sm opacity-80">{selectedDispute?.reason}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Resolution Nodes</label>
                <Button variant="outline" size="sm" onClick={addResLink} className="h-7 text-[9px] font-bold border-white/10 uppercase"><Plus className="h-3 w-3 mr-1" /> Add Node</Button>
              </div>
              <div className="space-y-3">
                {resLinks.map((link, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                    <div className="sm:col-span-5"><Input placeholder="Node Label" value={link.label} onChange={(e) => updateResLink(idx, 'label', e.target.value)} className="bg-white/5 h-9 text-xs" /></div>
                    <div className="sm:col-span-6"><Input placeholder="Invite URL" value={link.url} onChange={(e) => updateResLink(idx, 'url', e.target.value)} className="bg-white/5 h-9 text-xs" /></div>
                    <div className="sm:col-span-1 flex justify-end">
                      <Button variant="ghost" size="icon" disabled={resLinks.length === 1} onClick={() => removeResLink(idx)} className="h-9 w-9 text-destructive"><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedDispute(null)} className="uppercase text-[10px] font-bold">Cancel</Button>
            <Button onClick={handleResolve} disabled={isProcessing} className="bg-primary text-white uppercase text-[10px] font-bold tracking-[0.2em] px-8">
              {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4 mr-2" />}
              Dispatch Compensation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

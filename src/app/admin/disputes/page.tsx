
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Loader2, Link as LinkIcon, Plus, Trash2, CheckCircle, Send, X, TriangleAlert, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [adminNote, setAdminNote] = useState("");
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
        resolutionLinks: validLinks,
        adminNote: adminNote
      });
      toast({ title: "Resolved", description: "Compensated groups delivered to user." });
      setSelectedDispute(null);
      setResLinks([{ label: "", url: "" }]);
      setAdminNote("");
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
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tight text-white">Resolution Center</h1>
          <p className="text-muted-foreground mt-1 text-xs uppercase tracking-widest font-mono">Verify and compensate for protocol errors</p>
        </div>
        <ShieldAlert className="h-10 w-10 text-primary opacity-50" />
      </div>

      <Card className="glass-card border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-white/60">User / Identity</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-white/60">Target Issue</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-white/60 text-center">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">Action</TableHead>
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
                    <div className="flex flex-col space-y-1">
                      <span className="font-bold text-xs uppercase text-accent">{d.groupTitle}</span>
                      <div className="flex items-center gap-1.5">
                        <TriangleAlert className="h-2.5 w-2.5 text-destructive" />
                        <span className="text-[10px] font-bold text-destructive uppercase tracking-tighter">Broken Node: {d.junkLinkName || "Not Specified"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`uppercase text-[9px] font-bold ${d.status === 'pending' ? 'border-yellow-500/50 text-yellow-500' : 'border-green-500/50 text-green-500'}`}>
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => {
                        setSelectedDispute(d);
                        setAdminNote(d.adminNote || "");
                        setResLinks(d.resolutionLinks?.length > 0 ? d.resolutionLinks : [{ label: "", url: "" }]);
                      }} className="h-8 text-[9px] font-bold uppercase tracking-widest text-accent hover:bg-accent/10">
                        {d.status === 'pending' ? 'Handle' : 'View'}
                      </Button>
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
        <DialogContent className="glass-card border-white/10 max-w-3xl w-[95vw] sm:w-full overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl uppercase tracking-widest text-white">Compensation Protocol</DialogTitle>
            <DialogDescription className="text-xs opacity-60">Providing replacement nodes for {selectedDispute?.userEmail}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <p className="text-[10px] font-bold uppercase text-accent tracking-widest flex items-center gap-1.5">
                   <TriangleAlert className="h-3 w-3" /> Reported Issue
                </p>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase text-destructive font-mono">Broken Node: {selectedDispute?.junkLinkName}</p>
                  <p className="text-sm opacity-80 leading-relaxed">"{selectedDispute?.reason}"</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Admin Internal Note</label>
                <Textarea 
                  placeholder="Notes for resolution history..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="bg-white/5 border-white/10 min-h-[80px] text-xs"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <label className="text-[10px] uppercase font-bold text-accent tracking-widest">Dispatch Replacement Nodes</label>
                <Button variant="outline" size="sm" onClick={addResLink} className="h-8 text-[10px] font-bold border-white/10 uppercase"><Plus className="h-3.5 w-3.5 mr-1.5" /> Add Node</Button>
              </div>
              <div className="space-y-3">
                {resLinks.map((link, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="sm:col-span-5">
                      <label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Label</label>
                      <Input placeholder="Node Label" value={link.label} onChange={(e) => updateResLink(idx, 'label', e.target.value)} className="bg-white/5 h-10 text-xs" />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Invite URL</label>
                      <Input placeholder="Invite URL" value={link.url} onChange={(e) => updateResLink(idx, 'url', e.target.value)} className="bg-white/5 h-10 text-xs" />
                    </div>
                    <div className="sm:col-span-1 flex items-end justify-end">
                      <Button variant="ghost" size="icon" disabled={resLinks.length === 1} onClick={() => removeResLink(idx)} className="h-10 w-10 text-destructive"><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 border-t border-white/5 pt-4">
            <Button variant="ghost" onClick={() => setSelectedDispute(null)} className="uppercase text-[10px] font-bold order-2 sm:order-1">Abort</Button>
            <Button 
              onClick={handleResolve} 
              disabled={isProcessing} 
              className="bg-primary text-white uppercase text-[10px] font-bold tracking-[0.2em] px-8 h-12 order-1 sm:order-2"
            >
              {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Authorize & Dispatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

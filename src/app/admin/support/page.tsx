
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, deleteDoc, arrayUnion } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle, Trash2, ShieldAlert, Loader2, Mail, Send, X, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export default function AdminSupportPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
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

  const messagesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "support_messages"), orderBy("createdAt", "desc"));
  }, [db]);
  const { data: messages, loading } = useCollection(messagesQuery);

  const handleReply = async () => {
    if (!db || !selectedTicket || !replyMessage) return;
    setIsProcessing(true);
    try {
      const ticketRef = doc(db, "support_messages", selectedTicket.id);
      await updateDoc(ticketRef, {
        replies: arrayUnion({
          sender: "admin",
          message: replyMessage,
          createdAt: new Date().toISOString()
        })
      });
      setReplyMessage("");
      toast({ title: "Reply Sent", description: "User has been notified." });
      
      // Update local state for the UI to show the new reply immediately if desired, 
      // but useCollection handles it automatically.
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send reply." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolve = async (id: string) => {
    if (!db) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, "support_messages", id), { status: "resolved" });
      toast({ title: "Resolved", description: "Message marked as resolved." });
      setSelectedTicket(null);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Operation failed." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Delete this support ticket?")) return;
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, "support_messages", id));
      toast({ title: "Deleted", description: "Support ticket removed." });
      setSelectedTicket(null);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Delete failed." });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile?.isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tight">Support Management</h1>
          <p className="text-muted-foreground mt-1 text-xs uppercase tracking-widest">Communicate and resolve user inquiries</p>
        </div>
        <MessageSquare className="h-10 w-10 text-primary opacity-50" />
      </div>

      <Card className="glass-card border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">User</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Subject</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Last Activity</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">Protocol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground uppercase text-[10px]">
                  Accessing Inquiries...
                </TableCell>
              </TableRow>
            ) : messages.length > 0 ? (
              messages.map((msg: any) => (
                <TableRow key={msg.id} className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedTicket(msg)}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{msg.userName}</span>
                      <span className="text-[9px] text-muted-foreground uppercase">{msg.userEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-accent text-xs uppercase truncate max-w-[200px]">{msg.subject}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`uppercase text-[9px] font-bold ${
                      msg.status === 'open' ? 'border-yellow-500/50 text-yellow-500' : 'border-green-500/50 text-green-500'
                    }`}>
                      {msg.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs opacity-60 font-mono">
                    {msg.createdAt ? format(msg.createdAt.toDate(), 'MMM dd, HH:mm') : 'Recent'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-[9px] font-bold uppercase tracking-widest hover:bg-accent/10 hover:text-accent">
                      Open Log
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 opacity-40 uppercase tracking-widest text-[10px]">
                  Registry empty.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="glass-card border-white/10 max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-white/5">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <DialogTitle className="font-headline text-2xl font-bold uppercase tracking-tight">{selectedTicket?.subject}</DialogTitle>
                <div className="flex items-center gap-2">
                  <UserCircle className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">{selectedTicket?.userName} ({selectedTicket?.userEmail})</span>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedTicket?.status === 'open' && (
                  <Button size="sm" variant="outline" className="h-8 text-[9px] font-bold border-green-500/50 text-green-500 hover:bg-green-500/10" onClick={() => handleResolve(selectedTicket.id)}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    RESOLVE
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="h-8 text-[9px] font-bold text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(selectedTicket.id)}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  DELETE
                </Button>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Original User Message */}
              <div className="flex flex-col gap-1 items-start">
                <div className="bg-white/5 rounded-2xl p-4 max-w-[85%] border border-white/10">
                  <p className="text-sm">{selectedTicket?.message}</p>
                </div>
                <span className="text-[8px] uppercase tracking-widest text-muted-foreground mt-1 ml-2">USER • {selectedTicket?.createdAt ? format(selectedTicket.createdAt.toDate(), 'MMM dd, HH:mm') : 'Recently'}</span>
              </div>

              {/* Threaded Replies */}
              {selectedTicket?.replies?.map((reply: any, idx: number) => (
                <div key={idx} className={`flex flex-col gap-1 ${reply.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl p-4 max-w-[85%] border ${reply.sender === 'admin' ? 'bg-primary/20 border-primary/20' : 'bg-accent/10 border-accent/20'}`}>
                    <p className="text-sm">{reply.message}</p>
                  </div>
                  <span className="text-[8px] uppercase tracking-widest text-muted-foreground mt-1 mx-2">
                    {reply.sender === 'admin' ? 'ADMIN (YOU)' : 'USER'} • {reply.createdAt ? format(new Date(reply.createdAt), 'MMM dd, HH:mm') : 'Recent'}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>

          {selectedTicket?.status === 'open' && (
            <div className="p-6 border-t border-white/5 bg-white/[0.02]">
              <div className="flex gap-4">
                <Input 
                  placeholder="Draft response protocol..."
                  className="bg-white/5 border-white/10 h-12 flex-1"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                />
                <Button 
                  onClick={handleReply} 
                  disabled={isProcessing || !replyMessage} 
                  className="h-12 bg-accent text-background px-6 font-bold uppercase text-[10px] tracking-widest"
                >
                  {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4 mr-2" />}
                  Transmit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

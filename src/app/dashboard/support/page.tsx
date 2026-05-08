
"use client";

import { useState, useMemo, useEffect } from "react";
import { MessageSquare, Send, Loader2, ChevronLeft, ShieldCheck, Mail, Terminal, History, Plus, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { notifyTelegram } from "@/lib/telegram-action";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SupportPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Navigation State
  const [view, setView] = useState<'empty' | 'new' | 'detail'>('empty');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const messagesQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, "support_messages"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user?.uid]);

  const { data: tickets, loading: ticketsLoading } = useCollection(messagesQuery);

  // Derive the active ticket from the real-time data
  const activeTicket = useMemo(() => {
    if (!selectedId) return null;
    return tickets.find(t => t.id === selectedId);
  }, [tickets, selectedId]);

  // Sync view state if a ticket is selected
  const handleSelectTicket = (id: string) => {
    setSelectedId(id);
    setView('detail');
  };

  const handleOpenNew = () => {
    setSelectedId(null);
    setView('new');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    if (!subject.trim() || !message.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Subject and Message are required." });
      return;
    }

    setLoading(true);
    try {
      const supportData = {
        uid: user.uid,
        userName: user.displayName || "User",
        userEmail: user.email,
        subject: subject.trim(),
        message: message.trim(),
        status: "open",
        replies: [],
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "support_messages"), supportData);
      
      const telegramMessage = `🛠️ <b>New Support Request</b>\n\n<b>User:</b> ${supportData.userName}\n<b>Email:</b> ${supportData.userEmail}\n<b>Subject:</b> ${supportData.subject}\n\n<b>Message:</b>\n${supportData.message}`;
      await notifyTelegram(telegramMessage);

      toast({ title: "Protocol Broadcast", description: "Admin has been notified." });
      
      setSubject("");
      setMessage("");
      
      // Automatically navigate to the new ticket's detail view
      setSelectedId(docRef.id);
      setView('detail');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Transmission Failed", description: "Check network status." });
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !selectedId || !replyMessage.trim()) return;

    setLoading(true);
    try {
      const ticketRef = doc(db, "support_messages", selectedId);
      await updateDoc(ticketRef, {
        replies: arrayUnion({
          sender: "user",
          message: replyMessage.trim(),
          createdAt: new Date().toISOString()
        })
      });

      setReplyMessage("");
      toast({ title: "Reply Transmitted", description: "Admin will review shortly." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send reply." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center text-[10px] font-bold text-accent uppercase tracking-[0.2em] hover:opacity-80 mb-3 transition-opacity">
            <ChevronLeft className="h-3 w-3 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tight text-white">Support Desk</h1>
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">Manual protocol resolution & inquiries</p>
        </div>
        <Button 
          onClick={handleOpenNew} 
          className="bg-primary hover:bg-primary/90 text-white font-bold h-12 uppercase tracking-[0.2em] text-[10px] px-8 rounded-none border border-primary/20 shadow-[0_0_20px_rgba(40,80,255,0.1)]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Open New Ticket
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:items-start min-h-[600px]">
        {/* Registry Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 px-1 mb-2 opacity-50">
            <History className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Local Inquiry Registry</span>
          </div>
          
          <ScrollArea className="h-[calc(100vh-350px)] min-h-[400px]">
            <div className="space-y-3 pr-4">
              {ticketsLoading ? (
                [...Array(3)].map((_, i) => <div key={i} className="h-24 w-full bg-white/[0.02] border border-white/5 animate-pulse" />)
              ) : tickets.length > 0 ? (
                tickets.map((ticket: any) => (
                  <Card 
                    key={ticket.id} 
                    className={`cursor-pointer transition-all duration-300 rounded-none border-white/5 hover:border-accent/40 ${selectedId === ticket.id ? 'bg-accent/[0.08] border-accent/40 ring-1 ring-accent/20' : 'bg-white/[0.02] hover:bg-white/[0.05]'}`}
                    onClick={() => handleSelectTicket(ticket.id)}
                  >
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className={`uppercase text-[8px] px-2 py-0.5 font-bold rounded-none tracking-widest ${ticket.status === 'open' ? 'border-yellow-500/50 text-yellow-500' : 'border-green-500/50 text-green-500'}`}>
                          {ticket.status}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground font-mono opacity-50">
                          {ticket.createdAt ? format(ticket.createdAt.toDate(), 'MMM dd') : 'SEC_REF'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-xs uppercase tracking-tight text-white truncate">{ticket.subject}</p>
                        <p className="text-[9px] text-muted-foreground line-clamp-1 font-mono italic opacity-60">
                          {ticket.message}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-white/5 opacity-20">
                  <MessageSquare className="h-8 w-8 mx-auto mb-4" />
                  <p className="text-[10px] uppercase font-bold tracking-widest">Registry Empty</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Content Console */}
        <div className="lg:col-span-8">
          {view === 'new' ? (
            <Card className="glass-card border-accent/10 tech-border animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-none bg-black/40">
              <CardHeader className="pb-4 border-b border-white/5">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <CardTitle className="text-xl uppercase tracking-[0.2em] flex items-center gap-3 text-white">
                      <Plus className="h-5 w-5 text-accent" />
                      Protocol Initiation
                    </CardTitle>
                    <CardDescription className="text-[10px] uppercase tracking-widest opacity-40">Detail your request for administrative review.</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setView('empty')} className="opacity-50 hover:opacity-100">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Subject Label</Label>
                      <Input 
                        placeholder="PROTOCOL_TITLE"
                        className="bg-black/40 border-white/10 h-14 font-mono text-sm focus:border-accent/40 rounded-none transition-colors"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Data Transmission</Label>
                      <Textarea 
                        placeholder="Detailed inquiry parameters..."
                        className="bg-black/40 border-white/10 min-h-[220px] font-mono text-sm focus:border-accent/40 rounded-none leading-relaxed"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-[0.3em] text-xs shadow-lg rounded-none transition-all active:scale-[0.99]">
                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-3" />}
                    Broadcast Protocol
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : view === 'detail' && activeTicket ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="glass-card border-accent/20 tech-border overflow-hidden rounded-none bg-black/40">
                <CardHeader className="border-b border-white/5 bg-white/[0.01] py-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-bold uppercase tracking-tight text-white">{activeTicket.subject}</CardTitle>
                      <div className="flex items-center gap-4 opacity-60">
                        <span className="text-[9px] uppercase tracking-widest text-accent font-bold">NODE_REF: {activeTicket.id.slice(0, 8)}</span>
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">STATUS_LOG: {activeTicket.status.toUpperCase()}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`uppercase text-[10px] px-4 py-1.5 font-bold rounded-none tracking-[0.2em] ${activeTicket.status === 'open' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/5' : 'border-green-500/50 text-green-500 bg-green-500/5'}`}>
                      {activeTicket.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <ScrollArea className="h-[calc(100vh-520px)] min-h-[380px] bg-black/20">
                  <div className="p-6 space-y-8">
                    {/* User Origin Message */}
                    <div className="flex flex-col gap-2 items-start">
                      <div className="bg-white/5 rounded-none p-5 max-w-[85%] border border-white/10">
                        <p className="text-sm leading-relaxed font-mono text-white/90">{activeTicket.message}</p>
                      </div>
                      <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground ml-2 font-bold opacity-40">
                        USER_TRANSMISSION • {activeTicket.createdAt ? format(activeTicket.createdAt.toDate(), 'MMM dd, HH:mm') : 'RECENT'}
                      </span>
                    </div>

                    {/* Thread Logs */}
                    {activeTicket.replies?.map((reply: any, idx: number) => (
                      <div key={idx} className={`flex flex-col gap-2 ${reply.sender === 'user' ? 'items-end' : 'items-start animate-in slide-in-from-left-2'}`}>
                        <div className={`rounded-none p-5 max-w-[85%] border ${
                          reply.sender === 'user' 
                            ? 'bg-primary/20 border-primary/20 text-white' 
                            : 'bg-accent/10 border-accent/20 text-accent'
                        }`}>
                          <p className="text-sm leading-relaxed font-mono">{reply.message}</p>
                        </div>
                        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mx-2 font-bold opacity-40">
                          {reply.sender === 'user' ? 'USER_RESPONSE' : 'ADMIN_DECRYPTION'} • {reply.createdAt ? format(new Date(reply.createdAt), 'MMM dd, HH:mm') : 'RECENT'}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {activeTicket.status === 'open' ? (
                  <div className="p-6 border-t border-white/5 bg-white/[0.03]">
                    <form onSubmit={handleReply} className="flex gap-4">
                      <Input 
                        placeholder="Type protocol response..."
                        className="bg-black/60 border-white/10 h-14 flex-1 font-mono text-xs focus:border-accent/40 rounded-none"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        required
                      />
                      <Button type="submit" disabled={loading || !replyMessage.trim()} className="h-14 w-14 bg-accent hover:bg-accent/80 text-background p-0 shrink-0 rounded-none shadow-[0_0_15px_rgba(0,242,255,0.2)]">
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="p-8 border-t border-white/5 text-center bg-green-500/[0.03]">
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                      <ShieldCheck className="h-4 w-4" />
                      PROTOCOL_CONCLUDED: RESOLVED
                    </p>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass-card border-dashed border-2 border-white/5 rounded-none opacity-30 text-center px-10">
              <div className="bg-white/5 p-8 rounded-full mb-6 border border-white/5">
                <Terminal className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="font-headline text-2xl font-bold uppercase tracking-[0.2em] text-white">Console Idle</h3>
              <p className="text-[9px] uppercase tracking-[0.3em] mt-3 max-w-xs leading-relaxed">Select a registry entry or open a new protocol to begin encrypted transmission.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

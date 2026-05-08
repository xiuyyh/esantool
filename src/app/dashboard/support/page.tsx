
"use client";

import { useState, useMemo } from "react";
import { MessageSquare, Send, Loader2, ChevronLeft, ShieldCheck, Mail, Terminal, History, Plus, MessageCircle } from "lucide-react";
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
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const messagesQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, "support_messages"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user?.uid]);

  const { data: tickets, loading: ticketsLoading } = useCollection(messagesQuery);

  // Derived state: Get the current active ticket from the real-time collection data
  const activeTicket = useMemo(() => 
    tickets.find(t => t.id === selectedTicketId), 
  [tickets, selectedTicketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    if (!subject || !message) {
      toast({ variant: "destructive", title: "Error", description: "All fields are required." });
      return;
    }

    setLoading(true);
    try {
      const supportData = {
        uid: user.uid,
        userName: user.displayName || "Anonymous User",
        userEmail: user.email,
        subject,
        message,
        status: "open",
        replies: [],
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "support_messages"), supportData);
      
      const telegramMessage = `🛠️ <b>New Support Request</b>\n\n<b>User:</b> ${supportData.userName}\n<b>Email:</b> ${supportData.userEmail}\n<b>Subject:</b> ${supportData.subject}\n\n<b>Message:</b>\n${supportData.message}`;
      await notifyTelegram(telegramMessage);

      toast({ title: "Message Sent", description: "Admin notified." });
      
      // Reset form and show the newly created ticket
      setSubject("");
      setMessage("");
      setShowNewForm(false);
      setSelectedTicketId(docRef.id);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send message." });
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !selectedTicketId || !replyMessage) return;

    setLoading(true);
    try {
      const ticketRef = doc(db, "support_messages", selectedTicketId);
      await updateDoc(ticketRef, {
        replies: arrayUnion({
          sender: "user",
          message: replyMessage,
          createdAt: new Date().toISOString()
        })
      });

      setReplyMessage("");
      toast({ title: "Reply Sent", description: "Admin will review your message." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send reply." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <Link href="/dashboard" className="inline-flex items-center text-[10px] font-bold text-accent uppercase tracking-widest hover:opacity-80 mb-3">
            <ChevronLeft className="h-3 w-3 mr-1" />
            Dashboard
          </Link>
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tight">Support Desk</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1">Direct communication with administration</p>
        </div>
        <Button 
          onClick={() => { setShowNewForm(true); setSelectedTicketId(null); }} 
          className="bg-primary hover:bg-primary/90 text-white font-bold h-12 uppercase tracking-widest text-[10px] px-8"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:items-start">
        {/* Tickets List Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 px-1 mb-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Inquiry Registry</span>
          </div>
          
          <ScrollArea className="h-[calc(100vh-350px)] min-h-[400px]">
            <div className="space-y-3 pr-4">
              {ticketsLoading ? (
                [...Array(3)].map((_, i) => <div key={i} className="h-24 w-full rounded-xl bg-white/5 animate-pulse" />)
              ) : tickets.length > 0 ? (
                tickets.map((ticket: any) => (
                  <Card 
                    key={ticket.id} 
                    className={`cursor-pointer transition-all border-white/5 hover:border-accent/40 ${selectedTicketId === ticket.id ? 'bg-accent/10 border-accent/40 ring-1 ring-accent/20 shadow-[0_0_20px_rgba(0,242,255,0.05)]' : 'glass-card bg-white/[0.02]'}`}
                    onClick={() => { setSelectedTicketId(ticket.id); setShowNewForm(false); }}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className={`uppercase text-[8px] px-2 py-0.5 font-bold ${ticket.status === 'open' ? 'border-yellow-500/50 text-yellow-500' : 'border-green-500/50 text-green-500'}`}>
                          {ticket.status}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground font-mono">
                          {ticket.createdAt ? format(ticket.createdAt.toDate(), 'MMM dd') : 'Recent'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-sm truncate uppercase tracking-tight">{ticket.subject}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 opacity-60 font-mono italic">
                          {ticket.message}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-2xl opacity-40">
                  <MessageSquare className="h-10 w-10 mx-auto mb-4 opacity-20" />
                  <p className="text-[10px] uppercase font-bold tracking-widest">No previous protocols</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
          {showNewForm ? (
            <Card className="glass-card border-white/10 tech-border animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl uppercase tracking-widest flex items-center gap-3">
                  <Plus className="h-5 w-5 text-accent" />
                  Initiate Inquiry
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest opacity-60">Open a direct channel to administration.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Subject Protocol</Label>
                      <Input 
                        placeholder="e.g. PAYMENT_VERIFICATION"
                        className="bg-white/5 border-white/10 h-14 font-mono text-sm focus:border-accent/40 transition-colors"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Transmission Data</Label>
                      <Textarea 
                        placeholder="Detail the issue or request for review..."
                        className="bg-white/5 border-white/10 min-h-[200px] font-mono text-sm focus:border-accent/40 transition-colors leading-relaxed"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/10">
                    {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Send className="h-5 w-5 mr-3" />}
                    Broadcast Protocol
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : activeTicket ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="glass-card border-white/10 tech-border overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-white/[0.01] py-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-bold uppercase tracking-tight">{activeTicket.subject}</CardTitle>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] uppercase tracking-widest text-accent font-bold bg-accent/5 px-2 py-0.5 rounded">NODE_ID: {activeTicket.id.slice(0, 8)}</span>
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">STATUS: {activeTicket.status.toUpperCase()}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`uppercase text-[10px] px-4 py-1.5 font-bold ${activeTicket.status === 'open' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/5' : 'border-green-500/50 text-green-500 bg-green-500/5'}`}>
                      {activeTicket.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <ScrollArea className="h-[calc(100vh-500px)] min-h-[350px] bg-black/20">
                  <div className="p-6 space-y-8">
                    {/* Original Message */}
                    <div className="flex flex-col gap-2 items-start group">
                      <div className="bg-white/5 rounded-2xl rounded-tl-none p-5 max-w-[85%] border border-white/10 shadow-lg">
                        <p className="text-sm leading-relaxed font-mono">{activeTicket.message}</p>
                      </div>
                      <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground ml-2 font-bold opacity-60">
                        ORIGINAL_TRANSMISSION • {activeTicket.createdAt ? format(activeTicket.createdAt.toDate(), 'MMM dd, HH:mm') : 'RECENT'}
                      </span>
                    </div>

                    {/* Replies */}
                    {activeTicket.replies?.map((reply: any, idx: number) => (
                      <div key={idx} className={`flex flex-col gap-2 ${reply.sender === 'user' ? 'items-end' : 'items-start animate-in slide-in-from-left-2'}`}>
                        <div className={`rounded-2xl p-5 max-w-[85%] border shadow-xl ${
                          reply.sender === 'user' 
                            ? 'bg-primary/20 border-primary/20 rounded-tr-none' 
                            : 'bg-accent/10 border-accent/20 rounded-tl-none'
                        }`}>
                          <p className="text-sm leading-relaxed font-mono">{reply.message}</p>
                        </div>
                        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mx-2 font-bold opacity-60">
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
                        className="bg-black/40 border-white/10 h-14 flex-1 font-mono text-xs focus:border-accent/40"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        required
                      />
                      <Button type="submit" disabled={loading || !replyMessage} className="h-14 w-14 bg-accent hover:bg-accent/80 text-background p-0 shrink-0 shadow-lg shadow-accent/10">
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="p-8 border-t border-white/5 text-center bg-green-500/5 relative">
                    <div className="absolute inset-0 bg-green-500/[0.02] animate-pulse"></div>
                    <p className="text-xs font-bold text-green-500 uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                      <ShieldCheck className="h-4 w-4" />
                      Protocol Concluded: Securely Resolved
                    </p>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div className="h-[calc(100vh-350px)] min-h-[400px] flex flex-col items-center justify-center glass-card border-dashed border-2 border-white/5 rounded-3xl opacity-30 text-center px-10">
              <div className="bg-white/5 p-8 rounded-full mb-6 border border-white/5">
                <Terminal className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="font-headline text-2xl font-bold uppercase tracking-widest text-white">Transmission Idle</h3>
              <p className="text-[10px] uppercase tracking-[0.3em] mt-3 max-w-xs leading-relaxed">Select a registry entry or open a new protocol to begin data exchange.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

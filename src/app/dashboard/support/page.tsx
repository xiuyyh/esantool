
"use client";

import { useState } from "react";
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
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const messagesQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, "support_messages"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user?.uid]);

  const { data: tickets, loading: ticketsLoading } = useCollection(messagesQuery);

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

      await addDoc(collection(db, "support_messages"), supportData);
      
      const telegramMessage = `🛠️ <b>New Support Request</b>\n\n<b>User:</b> ${supportData.userName}\n<b>Email:</b> ${supportData.userEmail}\n<b>Subject:</b> ${supportData.subject}\n\n<b>Message:</b>\n${supportData.message}`;
      await notifyTelegram(telegramMessage);

      toast({ title: "Message Sent", description: "Admin notified." });
      setSubject("");
      setMessage("");
      setShowNewForm(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send message." });
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !selectedTicket || !replyMessage) return;

    setLoading(true);
    try {
      const ticketRef = doc(db, "support_messages", selectedTicket.id);
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
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/5 pb-8">
        <div>
          <Link href="/dashboard" className="inline-flex items-center text-[10px] font-bold text-accent uppercase tracking-widest hover:opacity-80 mb-2">
            <ChevronLeft className="h-3 w-3 mr-1" />
            Dashboard
          </Link>
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tight">Support Desk</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1">Direct communication with administration</p>
        </div>
        <Button onClick={() => { setShowNewForm(true); setSelectedTicket(null); }} className="bg-primary hover:bg-primary/90 text-white font-bold h-10 uppercase tracking-widest text-[10px]">
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Tickets List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 px-1 mb-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Recent Inquiries</span>
          </div>
          
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {ticketsLoading ? (
                [...Array(3)].map((_, i) => <div key={i} className="h-24 w-full rounded-xl bg-white/5 animate-pulse" />)
              ) : tickets.length > 0 ? (
                tickets.map((ticket: any) => (
                  <Card 
                    key={ticket.id} 
                    className={`cursor-pointer transition-all border-white/5 hover:border-accent/40 ${selectedTicket?.id === ticket.id ? 'bg-accent/10 border-accent/40 ring-1 ring-accent/20' : 'glass-card'}`}
                    onClick={() => { setSelectedTicket(ticket); setShowNewForm(false); }}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className={`uppercase text-[8px] font-bold ${ticket.status === 'open' ? 'border-yellow-500/50 text-yellow-500' : 'border-green-500/50 text-green-500'}`}>
                          {ticket.status}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground">{ticket.createdAt ? format(ticket.createdAt.toDate(), 'MMM dd') : 'Just now'}</span>
                      </div>
                      <p className="font-bold text-sm truncate uppercase tracking-tight">{ticket.subject}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 opacity-60">{ticket.message}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-20 opacity-40">
                  <MessageSquare className="h-10 w-10 mx-auto mb-4 opacity-20" />
                  <p className="text-[10px] uppercase font-bold tracking-widest">No previous messages</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat / Form Area */}
        <div className="lg:col-span-8">
          {showNewForm ? (
            <Card className="glass-card border-white/10 tech-border">
              <CardHeader>
                <CardTitle className="text-xl uppercase tracking-widest flex items-center gap-3">
                  <Plus className="h-5 w-5 text-accent" />
                  Open a Protocol Ticket
                </CardTitle>
                <CardDescription className="text-xs">Submit your inquiry for administrative review.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Subject</Label>
                      <Input 
                        placeholder="e.g. Transaction Verification, Access Issue"
                        className="bg-white/5 border-white/10 h-12"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Message</Label>
                      <Textarea 
                        placeholder="Detail your request..."
                        className="bg-white/5 border-white/10 min-h-[150px]"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest">
                    {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                    Broadcast Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : selectedTicket ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card className="glass-card border-white/10">
                <CardHeader className="border-b border-white/5 pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl font-bold uppercase tracking-tight">{selectedTicket.subject}</CardTitle>
                      <CardDescription className="text-[10px] uppercase tracking-widest text-accent mt-1">Ticket ID: {selectedTicket.id.slice(0, 8)}</CardDescription>
                    </div>
                    <Badge variant="outline" className={`uppercase text-[10px] px-3 py-1 font-bold ${selectedTicket.status === 'open' ? 'border-yellow-500/50 text-yellow-500' : 'border-green-500/50 text-green-500'}`}>
                      {selectedTicket.status}
                    </Badge>
                  </div>
                </CardHeader>
                <ScrollArea className="h-[450px] p-6">
                  <div className="space-y-6">
                    {/* Original Message */}
                    <div className="flex flex-col gap-1 items-start">
                      <div className="bg-white/5 rounded-2xl p-4 max-w-[85%] border border-white/10">
                        <p className="text-sm leading-relaxed">{selectedTicket.message}</p>
                      </div>
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1 ml-2">YOU • {selectedTicket.createdAt ? format(selectedTicket.createdAt.toDate(), 'MMM dd, HH:mm') : 'Recently'}</span>
                    </div>

                    {/* Replies */}
                    {selectedTicket.replies?.map((reply: any, idx: number) => (
                      <div key={idx} className={`flex flex-col gap-1 ${reply.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-2xl p-4 max-w-[85%] border ${reply.sender === 'user' ? 'bg-primary/20 border-primary/20' : 'bg-accent/10 border-accent/20'}`}>
                          <p className="text-sm leading-relaxed">{reply.message}</p>
                        </div>
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1 mx-2">
                          {reply.sender === 'user' ? 'YOU' : 'ADMINISTRATOR'} • {reply.createdAt ? format(new Date(reply.createdAt), 'MMM dd, HH:mm') : 'Just now'}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {selectedTicket.status === 'open' ? (
                  <CardContent className="border-t border-white/5 pt-6 bg-white/[0.02]">
                    <form onSubmit={handleReply} className="flex gap-4">
                      <Input 
                        placeholder="Type your reply..."
                        className="bg-white/5 border-white/10 h-12 flex-1"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        required
                      />
                      <Button type="submit" disabled={loading} className="h-12 w-12 bg-accent hover:bg-accent/80 text-background p-0">
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                      </Button>
                    </form>
                  </CardContent>
                ) : (
                  <div className="p-6 border-t border-white/5 text-center bg-green-500/5">
                    <p className="text-xs font-bold text-green-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      This inquiry protocol is concluded
                    </p>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center glass-card border-dashed border-2 border-white/5 rounded-3xl opacity-30 text-center px-10">
              <MessageCircle className="h-16 w-16 mb-6" />
              <h3 className="font-headline text-2xl font-bold uppercase tracking-widest">Support Node Idle</h3>
              <p className="text-xs uppercase tracking-[0.3em] mt-2">Select a ticket or open a new one to begin transmission</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

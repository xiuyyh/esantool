
"use client";

import { useState } from "react";
import { MessageSquare, Send, Loader2, ChevronLeft, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { notifyTelegram } from "@/lib/telegram-action";

export default function SupportPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
        createdAt: serverTimestamp(),
      };

      // 1. Save to Firestore
      await addDoc(collection(db, "support_messages"), supportData);
      
      // 2. Notify via Telegram
      const telegramMessage = `🛠️ <b>New Support Request</b>\n\n<b>User:</b> ${supportData.userName}\n<b>Email:</b> ${supportData.userEmail}\n<b>Subject:</b> ${supportData.subject}\n\n<b>Message:</b>\n${supportData.message}`;
      await notifyTelegram(telegramMessage);

      toast({ title: "Message Sent", description: "Our support team has been notified." });
      setSent(true);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send message." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-accent uppercase tracking-widest hover:opacity-80 transition-opacity">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="text-center space-y-2">
        <h1 className="font-headline text-4xl font-bold uppercase tracking-tight">Support Desk</h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest">Connect with our administrative protocol for assistance</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {!sent ? (
          <Card className="glass-card border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="h-5 w-5 text-accent" />
                <CardTitle className="text-lg uppercase tracking-widest">Open a Ticket</CardTitle>
              </div>
              <CardDescription>Our team usually responds within 2-4 protocol cycles (hours).</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Subject</Label>
                    <Input 
                      id="subject"
                      placeholder="e.g. Payment Issue, Group Access, etc."
                      className="bg-white/5 border-white/10 h-12"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Your Message</Label>
                    <Textarea 
                      id="message"
                      placeholder="Please provide as much detail as possible..."
                      className="bg-white/5 border-white/10 min-h-[150px]"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest">
                  {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card border-accent/40 text-center py-12 px-6">
            <CardContent className="space-y-6">
              <div className="mx-auto bg-accent/10 p-6 rounded-full w-fit">
                <ShieldCheck className="h-16 w-16 text-accent" />
              </div>
              <div className="space-y-2">
                <h2 className="font-headline text-3xl font-bold uppercase tracking-tight">Transmission Complete</h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Your support request has been broadcasted to our administrators. You will receive a response via your registered email: <span className="text-accent">{user?.email}</span>
                </p>
              </div>
              <Button onClick={() => setSent(false)} variant="outline" className="mt-6 border-white/10 hover:bg-white/5 uppercase text-[10px] font-bold tracking-widest px-8">
                Send another message
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4">
            <div className="bg-accent/10 p-2 rounded-lg">
              <Mail className="h-4 w-4 text-accent" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Email Support</p>
              <p className="text-xs font-mono">support@esantools.com</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Terminal className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Protocol ID</p>
              <p className="text-xs font-mono">NODE-SUPPORT-V2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

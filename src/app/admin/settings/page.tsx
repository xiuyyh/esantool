
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFirestore, useDoc, useUser, useMemoFirebase } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal, Save, MessageSquare, ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile, loading: profileLoading } = useDoc(userRef);

  const settingsRef = useMemoFirebase(() => db ? doc(db, "settings", "admin") : null, [db]);
  const { data: settings, loading: settingsLoading } = useDoc(settingsRef);

  const [token, setToken] = useState("");
  const [channelId, setChannelId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/admin/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!profileLoading && profile && !profile.isAdmin) {
      toast({ variant: "destructive", title: "Access Denied", description: "Administrator privileges required." });
      router.push("/");
    }
  }, [profile, profileLoading, router, toast]);

  useEffect(() => {
    if (settings) {
      setToken(settings.telegramBotToken || "");
      setChannelId(settings.telegramChannelId || "");
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setSaving(true);
    
    try {
      await setDoc(doc(db, "settings", "admin"), {
        telegramBotToken: token,
        telegramChannelId: channelId,
      }, { merge: true });
      
      toast({ title: "Settings Saved", description: "Admin configuration updated successfully." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || settingsLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile?.isAdmin) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div className="space-y-1">
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tight">System Settings</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest">Configure global protocol and notifications</p>
        </div>
        <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              <CardTitle className="font-headline text-xl">Telegram Integration</CardTitle>
            </div>
            <CardDescription>
              Receive instant alerts for every top-up request directly in your private channel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Bot API Token</Label>
                  <Input 
                    id="token"
                    type="password"
                    placeholder="73829104:AAH_..."
                    className="bg-white/5 border-white/10 h-12 font-mono text-xs"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="channelId" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Channel ID</Label>
                  <Input 
                    id="channelId"
                    placeholder="-100..."
                    className="bg-white/5 border-white/10 h-12 font-mono text-xs"
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 uppercase tracking-widest">
                {saving ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                Save Configuration
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center space-y-2 opacity-50">
          <Terminal className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Protocol v2.4 Status: Active</p>
        </div>
      </div>
    </div>
  );
}

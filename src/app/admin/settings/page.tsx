
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFirestore, useDoc, useUser, useMemoFirebase } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal, Save, MessageSquare, ShieldCheck, Loader2, Gift, Zap, Crown, Monitor } from "lucide-react";
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
  const [bundleReward, setBundleReward] = useState("2000");
  const [exclusiveReward, setExclusiveReward] = useState("5000");
  const [softwareReward, setSoftwareReward] = useState("3000");
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
      setBundleReward(settings.bundleReferralReward?.toString() || "2000");
      setExclusiveReward(settings.exclusiveReferralReward?.toString() || "5000");
      setSoftwareReward(settings.softwareReferralReward?.toString() || "3000");
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
        bundleReferralReward: Number(bundleReward),
        exclusiveReferralReward: Number(exclusiveReward),
        softwareReferralReward: Number(softwareReward),
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-8 gap-4">
        <div className="space-y-1">
          <h1 className="font-headline text-3xl sm:text-4xl font-bold uppercase tracking-tight">System Terminal</h1>
          <p className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-widest">Global Protocol & Referral Configuration</p>
        </div>
        <div className="bg-primary/10 p-3 sm:p-4 rounded-2xl border border-primary/20 w-fit">
          <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        </div>
      </div>

      <div className="grid gap-6 sm:gap-8">
        <form onSubmit={handleSave} className="space-y-8">
          <Card className="glass-card border-white/10">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <Gift className="h-5 w-5 text-accent" />
                <CardTitle className="font-headline text-lg sm:text-xl">Network Referral Protocol</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Set rewards for referring new users to the marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                     <Zap className="h-3 w-3" /> Bundle (₦)
                  </Label>
                  <Input 
                    type="number"
                    className="bg-white/5 border-white/10 h-12 font-headline font-bold"
                    value={bundleReward}
                    onChange={(e) => setBundleReward(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                     <Crown className="h-3 w-3" /> Exclusive (₦)
                  </Label>
                  <Input 
                    type="number"
                    className="bg-white/5 border-white/10 h-12 font-headline font-bold"
                    value={exclusiveReward}
                    onChange={(e) => setExclusiveReward(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                     <Monitor className="h-3 w-3" /> Software (₦)
                  </Label>
                  <Input 
                    type="number"
                    className="bg-white/5 border-white/10 h-12 font-headline font-bold"
                    value={softwareReward}
                    onChange={(e) => setSoftwareReward(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="h-5 w-5 text-accent" />
                <CardTitle className="font-headline text-lg sm:text-xl">Telegram Integration</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Bot credentials for instant administrative alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-6">
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
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 uppercase tracking-widest text-xs shadow-lg">
            {saving ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
            Authorize Global Settings
          </Button>
        </form>
        
        <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center space-y-2 opacity-50">
          <Terminal className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-muted-foreground" />
          <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em]">Protocol v2.9 Multi-Asset Registry: Online</p>
        </div>
      </div>
    </div>
  );
}

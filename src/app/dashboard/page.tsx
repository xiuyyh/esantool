
"use client";

import { useMemo, useEffect, useState } from "react";
import { useUser, useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, ShieldCheck, Lock, ExternalLink, History, Link as LinkIcon, AlertCircle, MessageSquare, Loader2, CheckCircle2, Gift, TriangleAlert, Zap, Monitor, Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { notifyTelegram } from "@/lib/telegram-action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const DEFAULT_IMAGE = "https://techstory.in/wp-content/uploads/2021/07/telegram.jpeg";

export default function UserDashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile, loading: profileLoading } = useDoc(userRef);
  
  const groupsQuery = useMemoFirebase(() => db ? collection(db, "groups") : null, [db]);
  const { data: allGroups, loading: groupsLoading } = useCollection(groupsQuery);

  const softwareQuery = useMemoFirebase(() => db ? collection(db, "software") : null, [db]);
  const { data: allSoftware, loading: softwareLoading } = useCollection(softwareQuery);

  const disputesQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, "disputes"), where("uid", "==", user.uid));
  }, [db, user?.uid]);
  const { data: disputes } = useCollection(disputesQuery);

  const [disputeBundle, setDisputeBundle] = useState<any>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeJunkLink, setDisputeJunkLink] = useState("");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) router.push("/login");
  }, [user, userLoading, router]);

  const purchasedGroups = useMemo(() => {
    if (!profile?.purchasedGroups || !allGroups) return [];
    return allGroups.filter((g: any) => profile.purchasedGroups.includes(g.id));
  }, [profile?.purchasedGroups, allGroups]);

  const purchasedSoftware = useMemo(() => {
    if (!profile?.purchasedSoftware || !allSoftware) return [];
    return allSoftware.filter((s: any) => profile.purchasedSoftware.includes(s.id));
  }, [profile?.purchasedSoftware, allSoftware]);

  const handleFileDispute = async () => {
    if (!user || !db || !disputeBundle || !disputeReason || !disputeJunkLink) return;
    setIsSubmittingDispute(true);
    try {
      await addDoc(collection(db, "disputes"), {
        uid: user.uid,
        userEmail: user.email,
        groupId: disputeBundle.id,
        groupTitle: disputeBundle.title,
        junkLinkName: disputeJunkLink,
        reason: disputeReason,
        status: "pending",
        resolutionLinks: [],
        createdAt: serverTimestamp(),
      });

      const message = `🚨 <b>Junk Group Dispute</b>\n\n<b>User:</b> ${user.email}\n<b>Bundle:</b> ${disputeBundle.title}\n<b>Junk Link:</b> ${disputeJunkLink}\n<b>Reason:</b> ${disputeReason}`;
      await notifyTelegram(message);

      toast({ title: "Report Sent", description: "Our team has been notified of the broken link." });
      setDisputeBundle(null);
      setDisputeReason("");
      setDisputeJunkLink("");
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send report." });
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  if (userLoading || profileLoading || groupsLoading || softwareLoading) {
    return (
      <div className="max-w-screen-2xl px-4 py-20 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">My Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline text-accent">₦{profile?.balance?.toLocaleString() || 0}</div>
            <div className="flex gap-2 mt-4">
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-8 uppercase tracking-widest text-[10px]">
                <Link href="/dashboard/topup">Add Money</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-8 uppercase tracking-widest text-[10px] font-bold border-white/10">
                <Link href="/dashboard/transactions"><History className="h-3 w-3 mr-1" /> History</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline">{(profile?.purchasedGroups?.length || 0) + (profile?.purchasedSoftware?.length || 0)}</div>
            <p className="text-[10px] text-muted-foreground mt-4 uppercase tracking-widest">Groups & Software</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent/20 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold text-accent uppercase tracking-widest">Referral Bonus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-headline text-accent">₦{profile?.referralEarnings?.toLocaleString() || 0}</div>
            <Button asChild variant="ghost" size="sm" className="mt-4 h-8 text-[9px] font-bold uppercase tracking-widest text-accent border border-accent/20">
              <Link href="/dashboard/referrals"><Gift className="h-3 w-3 mr-1" /> Invite Friends</Link>
            </Button>
          </CardContent>
        </Card>

        {disputes.some(d => d.status === 'pending') && (
          <Card className="glass-card border-yellow-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="h-3 w-3" /> Report Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline">REPORT SENT</div>
              <p className="text-[9px] text-muted-foreground mt-4 uppercase tracking-widest">We are checking the broken link</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="groups" className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
           <TabsList className="bg-white/5">
              <TabsTrigger value="groups" className="uppercase text-[10px] font-bold tracking-widest">My Groups</TabsTrigger>
              <TabsTrigger value="software" className="uppercase text-[10px] font-bold tracking-widest">My Software</TabsTrigger>
           </TabsList>
        </div>

        <TabsContent value="groups">
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
            {purchasedGroups.length > 0 ? (purchasedGroups.map((group: any) => {
              const bundleDispute = disputes.find(d => d.groupId === group.id);
              return (
                <Card key={group.id} className="glass-card border-accent/20 overflow-hidden group flex flex-col">
                  <CardHeader className="border-b border-white/5 p-5">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <CardTitle className="font-headline font-bold text-xl uppercase tracking-tighter">{group.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Globe className="h-3 w-3 text-accent" />
                          <span className="text-[10px] font-bold text-accent uppercase">{group.country}</span>
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-lg border border-white/10 overflow-hidden shrink-0">
                        <img src={group.imageUrls?.[0] || DEFAULT_IMAGE} className="w-full h-full object-cover" alt="" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4 flex-1">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Access Links</p>
                        <div className="space-y-2">
                          {(group.links || []).map((link: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-accent/20 transition-colors">
                              <div className="flex items-center gap-3 min-w-0">
                                <LinkIcon className="h-3 w-3 text-accent shrink-0" />
                                <span className="text-xs font-bold uppercase tracking-tight truncate">{link.label}</span>
                              </div>
                              <Button asChild size="icon" className="h-8 w-8 bg-accent text-background hover:bg-accent/80 shrink-0">
                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {bundleDispute?.status === 'resolved' && bundleDispute.resolutionLinks?.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-2 text-[9px] uppercase font-bold text-green-500 tracking-widest ml-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Replacement Links
                          </div>
                          <div className="space-y-2">
                            {bundleDispute.resolutionLinks.map((link: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                                <div className="flex items-center gap-3 min-w-0">
                                  <Zap className="h-3 w-3 text-green-500 shrink-0" />
                                  <span className="text-xs font-bold uppercase tracking-tight truncate">{link.label}</span>
                                </div>
                                <Button asChild size="icon" className="h-8 w-8 bg-green-500 text-white hover:bg-green-600 shrink-0">
                                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <div className="p-4 bg-white/5 border-t border-white/5 flex justify-end">
                    {!bundleDispute ? (
                      <Button variant="ghost" size="sm" onClick={() => setDisputeBundle(group)} className="text-destructive h-8 px-3 text-[9px] font-bold uppercase tracking-widest hover:bg-destructive/10">
                        <AlertCircle className="h-3 w-3 mr-2" /> Report Broken Link
                      </Button>
                    ) : (
                      <div className={`text-[8px] font-bold uppercase px-3 py-1 rounded border ${bundleDispute.status === 'pending' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/5' : 'border-green-500/50 text-green-500 bg-green-500/5'}`}>
                        Status: {bundleDispute.status === 'pending' ? 'Checking Link' : 'Fixed'}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                <Lock className="h-12 w-12 mx-auto mb-4" />
                <p className="text-sm uppercase tracking-widest font-bold">You haven't joined any groups yet.</p>
                <Button variant="link" asChild className="mt-4 text-accent uppercase tracking-widest text-xs"><Link href="/">Go to Shop</Link></Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="software">
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
            {purchasedSoftware.length > 0 ? (purchasedSoftware.map((item: any) => (
              <Card key={item.id} className="glass-card border-white/5 overflow-hidden group">
                 <div className="p-5 flex gap-4 border-b border-white/5">
                    <div className="h-16 w-16 rounded-xl border border-white/10 bg-black overflow-hidden shrink-0">
                       <img src={item.imageUrls?.[0] || DEFAULT_IMAGE} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <CardTitle className="font-headline font-bold text-xl uppercase tracking-tight truncate">{item.title}</CardTitle>
                       <div className="flex items-center gap-2 mt-1">
                          <Monitor className="h-3 w-3 text-accent" />
                          <span className="text-[9px] uppercase font-bold text-accent">V{item.version}</span>
                       </div>
                    </div>
                 </div>
                 <CardContent className="p-5 space-y-4">
                    <p className="text-[10px] text-muted-foreground leading-relaxed uppercase font-mono line-clamp-2">
                       {item.description}
                    </p>
                    <div className="p-3 bg-accent/5 border border-accent/10 rounded-lg">
                      <p className="text-[9px] text-accent font-bold uppercase tracking-tight leading-relaxed">
                        ⚠️ Important: After downloading, please contact our support team to complete the final setup and activation of your software.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 pt-2">
                       <Button asChild className="w-full bg-accent text-background font-bold uppercase text-[10px] tracking-widest h-12 shadow-[0_0_15px_rgba(0,242,255,0.2)]">
                          <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer">
                             <Download className="h-4 w-4 mr-2" /> Download Software
                          </a>
                       </Button>
                       <Button asChild variant="outline" className="w-full border-accent/20 text-accent font-bold uppercase text-[10px] tracking-widest h-10 hover:bg-accent/10">
                          <Link href="/dashboard/support">
                             <MessageSquare className="h-3 w-3 mr-2" /> Contact Admin for Setup
                          </Link>
                       </Button>
                    </div>
                 </CardContent>
              </Card>
            ))) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                <Monitor className="h-12 w-12 mx-auto mb-4" />
                <p className="text-sm uppercase tracking-widest font-bold">Your software library is empty.</p>
                <Button variant="link" asChild className="mt-4 text-accent uppercase tracking-widest text-xs"><Link href="/">Go to Shop</Link></Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!disputeBundle} onOpenChange={(open) => !open && setDisputeBundle(null)}>
        <DialogContent className="glass-card border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-lg uppercase tracking-widest">Report Broken Link</DialogTitle>
            <DialogDescription className="text-[10px] uppercase font-mono">Select the link that isn't working in: {disputeBundle?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">Broken Link</label>
              <Select onValueChange={setDisputeJunkLink} value={disputeJunkLink}>
                <SelectTrigger className="bg-white/5 border-white/10 h-11">
                  <SelectValue placeholder="Which link is broken?" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  {disputeBundle?.links?.map((link: any, idx: number) => (
                    <SelectItem key={idx} value={link.label} className="text-xs uppercase font-bold">
                      {link.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase font-bold text-muted-foreground ml-1">What's wrong?</label>
              <Textarea 
                placeholder="Briefly explain the issue (e.g. link expired, invalid group...)"
                className="bg-white/5 min-h-[120px] border-white/10"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
              />
            </div>
            <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
              <p className="text-[9px] text-yellow-500 uppercase leading-relaxed font-bold">
                ⚠️ False reports may lead to account suspension. Please only report links that are actually broken.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDisputeBundle(null)} className="uppercase text-[10px] font-bold">Cancel</Button>
            <Button 
              onClick={handleFileDispute} 
              disabled={isSubmittingDispute || !disputeReason || !disputeJunkLink} 
              className="bg-destructive text-white uppercase text-[10px] font-bold"
            >
              {isSubmittingDispute ? <Loader2 className="animate-spin h-3 w-3 mr-2" /> : <MessageSquare className="h-3 w-3 mr-2" />}
              Send Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

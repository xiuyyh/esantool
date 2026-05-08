
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle, Trash2, ShieldAlert, Loader2, Mail, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminSupportPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleResolve = async (id: string) => {
    if (!db) return;
    setProcessingId(id);
    try {
      await updateDoc(doc(db, "support_messages", id), { status: "resolved" });
      toast({ title: "Resolved", description: "Message marked as resolved." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Operation failed." });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !confirm("Delete this support ticket?")) return;
    setProcessingId(id);
    try {
      await deleteDoc(doc(db, "support_messages", id));
      toast({ title: "Deleted", description: "Support ticket removed." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Delete failed." });
    } finally {
      setProcessingId(null);
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
          <p className="text-muted-foreground mt-1 text-xs uppercase tracking-widest">Review and manage user inquiries</p>
        </div>
        <MessageSquare className="h-10 w-10 text-primary opacity-50" />
      </div>

      <Card className="glass-card border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">User</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Inquiry</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Date</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground uppercase text-[10px]">
                  Loading Inquiries...
                </TableCell>
              </TableRow>
            ) : messages.length > 0 ? (
              messages.map((msg: any) => (
                <TableRow key={msg.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{msg.userName}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{msg.userEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="space-y-1">
                      <p className="font-bold text-accent text-xs uppercase">{msg.subject}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{msg.message}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`uppercase text-[9px] font-bold ${
                      msg.status === 'open' ? 'border-yellow-500/50 text-yellow-500' : 'border-green-500/50 text-green-500'
                    }`}>
                      {msg.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs opacity-60">
                    {msg.createdAt ? format(msg.createdAt.toDate(), 'MMM dd, HH:mm') : 'Recently'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="ghost" className="h-8 w-8 text-accent hover:bg-accent/10">
                        <a href={`mailto:${msg.userEmail}?subject=Re: ${msg.subject}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                      {msg.status === 'open' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 text-green-500 hover:bg-green-500/10"
                          onClick={() => handleResolve(msg.id)}
                          disabled={!!processingId}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                        onClick={() => handleDelete(msg.id)}
                        disabled={!!processingId}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 opacity-40 uppercase tracking-widest text-[10px]">
                  No support tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFirestore, useCollection, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Edit2, ShieldCheck, UserCircle, Wallet, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile, loading: profileLoading } = useDoc(userRef);

  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newBalance, setNewBalance] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), orderBy("createdAt", "desc"));
  }, [db]);
  const { data: allUsers, loading: usersLoading } = useCollection(usersQuery);

  useEffect(() => {
    if (!authLoading && !user) router.push("/admin/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!profileLoading && profile && !profile.isAdmin) {
      toast({ variant: "destructive", title: "Access Denied", description: "Admin privileges required." });
      router.push("/");
    }
  }, [profile, profileLoading, router, toast]);

  const filteredUsers = allUsers.filter((u: any) => 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateBalance = async () => {
    if (!db || !editingUser) return;
    const balanceNum = Number(newBalance);
    
    if (isNaN(balanceNum)) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Please enter a valid number." });
      return;
    }

    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "users", editingUser.id), {
        balance: balanceNum
      });
      toast({ title: "Success", description: "User balance updated." });
      setEditingUser(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update balance." });
    } finally {
      setIsUpdating(false);
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
        <div className="space-y-1">
          <h1 className="font-headline text-4xl font-bold uppercase tracking-tight">User Management</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest">Oversee accounts and adjust protocols</p>
        </div>
        <ShieldCheck className="h-10 w-10 text-primary opacity-50" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 bg-white/5 border-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Total Nodes: {allUsers.length}
        </div>
      </div>

      <Card className="glass-card border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Identity</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Privilege</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Wallet Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20 text-muted-foreground uppercase text-[10px]">
                  Accessing user registry...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u: any) => (
                <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-white/10">
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{u.displayName || "Unknown User"}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-tight">{u.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`uppercase text-[9px] font-bold ${u.isAdmin ? 'border-primary text-primary' : 'opacity-40'}`}>
                      {u.isAdmin ? 'Administrator' : 'Standard User'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-3 w-3 text-accent opacity-50" />
                      <span className="font-headline font-bold text-accent">₦{u.balance?.toLocaleString() || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-accent/10 hover:text-accent"
                      onClick={() => {
                        setEditingUser(u);
                        setNewBalance(u.balance?.toString() || "0");
                      }}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Adjust
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20 opacity-40 uppercase tracking-widest text-xs">
                  No matches found in database.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="glass-card border-white/10">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Adjust Wallet Balance</DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-widest text-muted-foreground">
              Directly override user account credits
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <UserCircle className="h-10 w-10 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-bold">{editingUser.displayName}</span>
                  <span className="text-[10px] uppercase text-muted-foreground">{editingUser.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">New Balance (₦)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-headline font-bold text-accent">₦</span>
                  <Input 
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="h-12 pl-10 font-headline font-bold text-lg bg-white/5"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setEditingUser(null)} className="uppercase text-[10px] font-bold tracking-widest">
              <X className="h-4 w-4 mr-1" />
              Abort
            </Button>
            <Button 
              onClick={handleUpdateBalance} 
              disabled={isUpdating}
              className="bg-primary hover:bg-primary/90 text-white uppercase text-[10px] font-bold tracking-widest"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Save Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

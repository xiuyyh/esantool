
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useCollection, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Trash2, Edit3, Globe, Lock, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DEFAULT_IMAGE = "https://techstory.in/wp-content/uploads/2021/07/telegram.jpeg";

export default function AdminDashboard() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile, loading: profileLoading } = useDoc(userRef);

  const countriesQuery = useMemoFirebase(() => db ? collection(db, "countries") : null, [db]);
  const { data: countries } = useCollection(countriesQuery);
  
  const groupsQuery = useMemoFirebase(() => db ? collection(db, "groups") : null, [db]);
  const { data: groups } = useCollection(groupsQuery);

  const [groupTitle, setGroupTitle] = useState("");
  const [groupPrice, setGroupPrice] = useState("");
  const [groupLink, setGroupLink] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupCountry, setGroupCountry] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const [countryName, setCountryName] = useState("");

  // Edit State
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!profileLoading && profile && !profile.isAdmin) {
      toast({ variant: "destructive", title: "Access Denied", description: "Administrator privileges required." });
      router.push("/");
    }
  }, [profile, profileLoading, router, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > 800000) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `Image ${file.name} is too large. Limit is 800KB.`,
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    addDoc(collection(db, "groups"), {
      title: groupTitle,
      price: Number(groupPrice),
      accessLink: groupLink,
      description: groupDesc,
      country: groupCountry,
      imageUrls: imageUrls.length > 0 ? imageUrls : [DEFAULT_IMAGE],
      createdAt: serverTimestamp(),
    });
    
    toast({ title: "Success", description: "Group added successfully." });
    setGroupTitle("");
    setGroupPrice("");
    setGroupLink("");
    setGroupDesc("");
    setGroupCountry("");
    setImageUrls([]);
  };

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    addDoc(collection(db, "countries"), {
      name: countryName,
    });
    
    toast({ title: "Success", description: "Country added." });
    setCountryName("");
  };

  const handleDeleteGroup = async (id: string) => {
    if (!db) return;
    if (!confirm("Are you sure you want to delete this group?")) return;
    
    deleteDoc(doc(db, "groups", id));
    toast({ title: "Deleted", description: "Group has been removed." });
  };

  const openEditDialog = (group: any) => {
    setEditingGroup({ ...group });
    setIsEditDialogOpen(true);
  };

  const handleUpdateGroup = async () => {
    if (!db || !editingGroup) return;
    
    const groupRef = doc(db, "groups", editingGroup.id);
    updateDoc(groupRef, {
      title: editingGroup.title,
      price: Number(editingGroup.price),
      accessLink: editingGroup.accessLink,
      description: editingGroup.description,
      country: editingGroup.country,
    });

    toast({ title: "Updated", description: "Group details saved." });
    setIsEditDialogOpen(false);
    setEditingGroup(null);
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
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
      <div className="border-b border-white/5 pb-8 flex justify-between items-end">
        <div>
          <h1 className="font-headline text-3xl font-bold uppercase tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage all your groups and categories here.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Add New Group</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGroup} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Group Name</Label>
                      <Input 
                        id="title" 
                        value={groupTitle}
                        onChange={(e) => setGroupTitle(e.target.value)}
                        className="bg-white/5"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₦)</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        value={groupPrice}
                        onChange={(e) => setGroupPrice(e.target.value)}
                        className="bg-white/5"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="link">Join Link</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="link" 
                        placeholder="https://t.me/join..." 
                        value={groupLink}
                        onChange={(e) => setGroupLink(e.target.value)}
                        className="bg-white/5 pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select onValueChange={setGroupCountry} value={groupCountry}>
                      <SelectTrigger className="bg-white/5">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        {countries.map((c: any) => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Pictures</Label>
                    <div className="grid grid-cols-4 gap-4">
                      {imageUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                          <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100"
                            onClick={() => removeImage(idx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <div 
                        className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        multiple
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea 
                      id="desc" 
                      value={groupDesc}
                      onChange={(e) => setGroupDesc(e.target.value)}
                      className="bg-white/5 min-h-[100px]"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary font-bold">
                  Add Group
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCountry} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="countryName">New Country Name</Label>
                  <Input 
                    id="countryName" 
                    value={countryName}
                    onChange={(e) => setCountryName(e.target.value)}
                    className="bg-white/5"
                    required
                  />
                </div>
                <Button type="submit" variant="outline" className="w-full">
                  Add Country
                </Button>
              </form>

              <div className="mt-8 space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest border-b border-white/5 pb-1">Current Countries</p>
                <div className="flex flex-wrap gap-2">
                  {countries.map((c: any) => (
                    <div key={c.id} className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded-md border border-white/5 flex items-center gap-1">
                      <Globe className="h-3 w-3 text-accent" />
                      {c.name}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">All Groups</h2>
        <Card className="glass-card border-white/5 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow>
                <TableHead className="font-bold">Name</TableHead>
                <TableHead className="font-bold">Country</TableHead>
                <TableHead className="font-bold">Price</TableHead>
                <TableHead className="font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.length > 0 ? (
                groups.map((group: any) => (
                  <TableRow key={group.id} className="hover:bg-white/5 border-white/5">
                    <TableCell className="font-medium">{group.title}</TableCell>
                    <TableCell>{group.country}</TableCell>
                    <TableCell>₦{group.price?.toLocaleString()}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-accent hover:text-accent hover:bg-accent/10"
                        onClick={() => openEditDialog(group)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground uppercase text-xs tracking-widest">
                    No groups found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </section>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Edit Group</DialogTitle>
          </DialogHeader>
          {editingGroup && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Group Title</Label>
                  <Input 
                    value={editingGroup.title}
                    onChange={(e) => setEditingGroup({...editingGroup, title: e.target.value})}
                    className="bg-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (₦)</Label>
                  <Input 
                    type="number"
                    value={editingGroup.price}
                    onChange={(e) => setEditingGroup({...editingGroup, price: e.target.value})}
                    className="bg-white/5"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select 
                  onValueChange={(val) => setEditingGroup({...editingGroup, country: val})} 
                  value={editingGroup.country}
                >
                  <SelectTrigger className="bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    {countries.map((c: any) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Join Link</Label>
                <Input 
                  value={editingGroup.accessLink}
                  onChange={(e) => setEditingGroup({...editingGroup, accessLink: e.target.value})}
                  className="bg-white/5"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={editingGroup.description}
                  onChange={(e) => setEditingGroup({...editingGroup, description: e.target.value})}
                  className="bg-white/5 min-h-[100px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateGroup} className="bg-primary">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


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
import { Upload, X, Trash2, Edit3, Globe, Lock, Loader2, Plus, Link as LinkIcon } from "lucide-react";
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
  const [groupDesc, setGroupDesc] = useState("");
  const [groupCountry, setGroupCountry] = useState("");
  const [groupLinks, setGroupLinks] = useState([{ label: "", url: "" }]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const [countryName, setCountryName] = useState("");

  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/admin/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!profileLoading && profile && !profile.isAdmin) {
      toast({ variant: "destructive", title: "Access Denied", description: "Admin privileges required." });
      router.push("/");
    }
  }, [profile, profileLoading, router, toast]);

  const handleLinkChange = (index: number, field: "label" | "url", value: string) => {
    const newLinks = [...groupLinks];
    newLinks[index][field] = value;
    setGroupLinks(newLinks);
  };

  const addLinkLabel = () => setGroupLinks([...groupLinks, { label: "", url: "" }]);
  const removeLinkLabel = (index: number) => setGroupLinks(groupLinks.filter((_, i) => i !== index));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > 800000) {
        toast({ variant: "destructive", title: "File too large", description: `Image ${file.name} is too large (Limit 800KB).` });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImageUrls(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => setImageUrls(prev => prev.filter((_, i) => i !== index));

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    const validLinks = groupLinks.filter(l => l.label && l.url);
    if (validLinks.length === 0) {
      toast({ variant: "destructive", title: "Missing Links", description: "Please add at least one valid Telegram link." });
      return;
    }

    addDoc(collection(db, "groups"), {
      title: groupTitle,
      price: Number(groupPrice),
      description: groupDesc,
      country: groupCountry,
      links: validLinks,
      imageUrls: imageUrls.length > 0 ? imageUrls : [DEFAULT_IMAGE],
      createdAt: serverTimestamp(),
    });
    
    toast({ title: "Success", description: "Bundle added successfully." });
    setGroupTitle("");
    setGroupPrice("");
    setGroupDesc("");
    setGroupCountry("");
    setGroupLinks([{ label: "", url: "" }]);
    setImageUrls([]);
  };

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    addDoc(collection(db, "countries"), { name: countryName });
    toast({ title: "Success", description: "Country added." });
    setCountryName("");
  };

  const handleDeleteGroup = async (id: string) => {
    if (!db || !confirm("Delete this bundle?")) return;
    deleteDoc(doc(db, "groups", id));
    toast({ title: "Deleted", description: "Bundle has been removed." });
  };

  const openEditDialog = (group: any) => {
    setEditingGroup({ ...group, links: group.links || [{ label: "", url: "" }] });
    setIsEditDialogOpen(true);
  };

  const handleUpdateGroup = async () => {
    if (!db || !editingGroup) return;
    
    updateDoc(doc(db, "groups", editingGroup.id), {
      title: editingGroup.title,
      price: Number(editingGroup.price),
      description: editingGroup.description,
      country: editingGroup.country,
      links: editingGroup.links.filter((l: any) => l.label && l.url),
    });

    toast({ title: "Updated", description: "Bundle details saved." });
    setIsEditDialogOpen(false);
    setEditingGroup(null);
  };

  if (authLoading || profileLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user || !profile?.isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
      <div className="border-b border-white/5 pb-8">
        <h1 className="font-headline text-3xl font-bold uppercase tracking-tight">Bundle Management</h1>
        <p className="text-muted-foreground mt-1 text-xs uppercase tracking-widest">Create and manage multi-link Telegram bundles</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="font-headline text-xl uppercase tracking-widest">New Bundle Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGroup} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Bundle Identity</Label>
                    <Input value={groupTitle} onChange={(e) => setGroupTitle(e.target.value)} className="bg-white/5 h-12" placeholder="e.g. VIP Master Bundle" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Valuation (₦)</Label>
                    <Input type="number" value={groupPrice} onChange={(e) => setGroupPrice(e.target.value)} className="bg-white/5 h-12" placeholder="5000" required />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Encrypted Access Links</Label>
                  {groupLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-2 items-end group">
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <Input placeholder="Label (e.g. Chat)" value={link.label} onChange={(e) => handleLinkChange(idx, "label", e.target.value)} className="bg-white/5" />
                        <Input placeholder="Invite URL" value={link.url} onChange={(e) => handleLinkChange(idx, "url", e.target.value)} className="bg-white/5" />
                      </div>
                      {groupLinks.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLinkLabel(idx)} className="text-destructive h-10 w-10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addLinkLabel} className="text-[10px] font-bold uppercase tracking-widest h-8 border-dashed">
                    <Plus className="h-3 w-3 mr-2" /> Add Next Link
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Region</Label>
                    <Select onValueChange={setGroupCountry} value={groupCountry}>
                      <SelectTrigger className="bg-white/5 h-12"><SelectValue placeholder="Select Country" /></SelectTrigger>
                      <SelectContent className="glass-card">
                        {countries.map((c: any) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Visual Assets</Label>
                  <div className="grid grid-cols-4 gap-4">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg border border-white/10 bg-black/20 group">
                        <img src={url} alt="" className="w-full h-full object-contain" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => removeImage(idx)}><X className="h-3 w-3" /></Button>
                      </div>
                    ))}
                    <div className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Transmission Details</Label>
                  <Textarea value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} className="bg-white/5 min-h-[100px]" placeholder="Detailed description of bundle content..." required />
                </div>

                <Button type="submit" className="w-full bg-primary font-bold h-14 uppercase tracking-widest text-xs">Authorize New Bundle</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="glass-card border-white/5">
            <CardHeader><CardTitle className="font-headline text-lg uppercase tracking-widest">Region Registry</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAddCountry} className="space-y-4">
                <Input value={countryName} onChange={(e) => setCountryName(e.target.value)} className="bg-white/5" placeholder="New Country Name" required />
                <Button type="submit" variant="outline" className="w-full font-bold uppercase text-[10px] tracking-widest">Register Region</Button>
              </form>
              <div className="mt-8 flex flex-wrap gap-2">
                {countries.map((c: any) => (
                  <div key={c.id} className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded-md border border-white/5 flex items-center gap-1">
                    <Globe className="h-3 w-3 text-accent" /> {c.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">Active Bundles</h2>
        <Card className="glass-card border-white/5 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest">Identity</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest">Region</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest">Links</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest">Price</TableHead>
                <TableHead className="font-bold text-right uppercase text-[10px] tracking-widest">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group: any) => (
                <TableRow key={group.id} className="hover:bg-white/5 border-white/5">
                  <TableCell className="font-bold">{group.title}</TableCell>
                  <TableCell className="text-xs uppercase opacity-60">{group.country}</TableCell>
                  <TableCell className="text-xs font-mono text-accent">[{group.links?.length || 0} Nodes]</TableCell>
                  <TableCell className="font-headline font-bold">₦{group.price?.toLocaleString()}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(group)} className="h-8 w-8 text-accent hover:bg-accent/10"><Edit3 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteGroup(group.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-white/10 max-w-2xl">
          <DialogHeader><DialogTitle className="font-headline text-xl uppercase tracking-widest">Update Protocol</DialogTitle></DialogHeader>
          {editingGroup && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Input value={editingGroup.title} onChange={(e) => setEditingGroup({...editingGroup, title: e.target.value})} className="bg-white/5" />
                <Input type="number" value={editingGroup.price} onChange={(e) => setEditingGroup({...editingGroup, price: e.target.value})} className="bg-white/5" />
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Update Links</Label>
                {editingGroup.links.map((link: any, idx: number) => (
                  <div key={idx} className="flex gap-2">
                    <Input placeholder="Label" value={link.label} onChange={(e) => {
                      const l = [...editingGroup.links];
                      l[idx].label = e.target.value;
                      setEditingGroup({...editingGroup, links: l});
                    }} className="bg-white/5" />
                    <Input placeholder="URL" value={link.url} onChange={(e) => {
                      const l = [...editingGroup.links];
                      l[idx].url = e.target.value;
                      setEditingGroup({...editingGroup, links: l});
                    }} className="bg-white/5" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => {
                      const l = editingGroup.links.filter((_:any, i:number) => i !== idx);
                      setEditingGroup({...editingGroup, links: l});
                    }} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingGroup({...editingGroup, links: [...editingGroup.links, {label:"", url:""}]})} className="text-[10px] uppercase tracking-widest">Add Link</Button>
              </div>

              <Textarea value={editingGroup.description} onChange={(e) => setEditingGroup({...editingGroup, description: e.target.value})} className="bg-white/5" />
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

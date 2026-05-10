"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useCollection, useUser, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Trash2, Edit3, Globe, Lock, Loader2, Plus, Link as LinkIcon, Zap, Layers, RotateCcw } from "lucide-react";
import { getBundlePricing } from "@/lib/pricing";
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

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    const validLinks = groupLinks.filter(l => l.label && l.url);
    if (validLinks.length === 0) {
      toast({ variant: "destructive", title: "Missing Links", description: "Please add at least one valid Telegram link." });
      return;
    }

    if (!groupCountry) {
      toast({ variant: "destructive", title: "Missing Region", description: "Please select a country for this bundle." });
      return;
    }

    const data = {
      title: groupTitle,
      price: Number(groupPrice),
      salesCount: 0,
      description: groupDesc,
      country: groupCountry,
      links: validLinks,
      imageUrls: imageUrls.length > 0 ? imageUrls : [DEFAULT_IMAGE],
      createdAt: serverTimestamp(),
    };

    addDoc(collection(db, "groups"), data)
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'groups',
          operation: 'create',
          requestResourceData: data
        }));
      });
    
    toast({ title: "Success", description: "Bundle added successfully." });
    setGroupTitle("");
    setGroupPrice("");
    setGroupDesc("");
    setGroupCountry("");
    setGroupLinks([{ label: "", url: "" }]);
    setImageUrls([]);
  };

  const handleAddCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    addDoc(collection(db, "countries"), { name: countryName })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'countries',
          operation: 'create',
          requestResourceData: { name: countryName }
        }));
      });
    toast({ title: "Success", description: "Country added." });
    setCountryName("");
  };

  const handleDeleteCountry = (id: string) => {
    if (!db || !confirm("Delete this country from registry? This may orphan existing bundles.")) return;
    deleteDoc(doc(db, "countries", id))
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `countries/${id}`,
          operation: 'delete'
        }));
      });
    toast({ title: "Purged", description: "Country protocol removed." });
  };

  const handleDeleteGroup = (id: string) => {
    if (!db || !confirm("Delete this bundle?")) return;
    deleteDoc(doc(db, "groups", id))
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `groups/${id}`,
          operation: 'delete'
        }));
      });
    toast({ title: "Deleted", description: "Bundle has been removed." });
  };

  const handleResetSales = (id: string) => {
    if (!db || !confirm("Erase sales count for this bundle? This will reset its quality tier to HQ.")) return;
    
    const docRef = doc(db, "groups", id);
    const updateData = { salesCount: 0 };

    updateDoc(docRef, updateData)
      .then(() => {
        toast({ title: "Protocol Reset", description: "Sales count has been cleared." });
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updateData
        }));
      });
  };

  const openEditDialog = (group: any) => {
    setEditingGroup({ ...group, links: group.links || [{ label: "", url: "" }] });
    setIsEditDialogOpen(true);
  };

  const handleUpdateGroup = () => {
    if (!db || !editingGroup) return;
    
    const docRef = doc(db, "groups", editingGroup.id);
    const updateData = {
      title: editingGroup.title,
      price: Number(editingGroup.price),
      description: editingGroup.description,
      country: editingGroup.country,
      links: editingGroup.links.filter((l: any) => l.label && l.url),
    };

    updateDoc(docRef, updateData)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updateData
        }));
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12 overflow-x-hidden">
      <div className="border-b border-white/5 pb-6">
        <h1 className="font-headline text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white">Bundle Management</h1>
        <p className="text-muted-foreground mt-1 text-[10px] sm:text-xs uppercase tracking-widest font-mono">Create and manage multi-link Telegram bundles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
        <div className="lg:col-span-8 space-y-8 min-w-0">
          <Card className="glass-card border-white/5 w-full">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="font-headline text-lg sm:text-xl uppercase tracking-widest text-white">New Bundle Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <form onSubmit={handleAddGroup} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Bundle Identity</Label>
                    <input type="text" value={groupTitle} onChange={(e) => setGroupTitle(e.target.value)} className="flex h-12 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="e.g. VIP Master Bundle" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Base Valuation (₦)</Label>
                    <input type="number" value={groupPrice} onChange={(e) => setGroupPrice(e.target.value)} className="flex h-12 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="5000" required />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Encrypted Access Links</Label>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/5 border border-accent/10">
                      <Layers className="h-2.5 w-2.5 text-accent" />
                      <span className="text-[9px] font-bold text-accent uppercase tracking-widest font-mono">
                        {groupLinks.length} Active Nodes
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {groupLinks.map((link, idx) => (
                      <div key={idx} className="flex flex-col gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                          <div className="space-y-1">
                            <Label className="text-[9px] uppercase font-bold opacity-40 font-mono">Link Label</Label>
                            <Input placeholder="e.g. Signals" value={link.label} onChange={(e) => handleLinkChange(idx, "label", e.target.value)} className="bg-white/5 h-10 border-white/10" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9px] uppercase font-bold opacity-40 font-mono">Invite URL</Label>
                            <Input placeholder="https://t.me/..." value={link.url} onChange={(e) => handleLinkChange(idx, "url", e.target.value)} className="bg-white/5 h-10 border-white/10" />
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          {groupLinks.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeLinkLabel(idx)} className="text-destructive h-8 px-3 text-[10px] font-bold uppercase tracking-tighter hover:bg-destructive/10">
                              <Trash2 className="h-3 w-3 mr-2" />
                              Remove Link
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addLinkLabel} className="w-full sm:w-auto text-[10px] font-bold uppercase tracking-widest h-10 border-dashed border-white/20">
                    <Plus className="h-3 w-3 mr-2" /> Add Next Link
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Region</Label>
                    <Select onValueChange={setGroupCountry} value={groupCountry}>
                      <SelectTrigger className="bg-white/5 h-12 border-white/10"><SelectValue placeholder="Select Country" /></SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        {countries.map((c: any) => <SelectItem key={c.id} value={c.name} className="uppercase text-[10px] font-bold">{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Visual Assets</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg border border-white/10 bg-black/20 group">
                        <img src={url} alt="" className="w-full h-full object-contain" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeImage(idx)}><X className="h-3 w-3" /></Button>
                      </div>
                    ))}
                    <div className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Transmission Details</Label>
                  <Textarea value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} className="bg-white/5 min-h-[100px] border-white/10" placeholder="Detailed description of bundle content..." required />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 uppercase tracking-widest text-xs">Authorize New Bundle</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8 min-w-0">
          <Card className="glass-card border-white/5 w-full">
            <CardHeader className="p-4 sm:p-6"><CardTitle className="font-headline text-lg uppercase tracking-widest text-white">Region Registry</CardTitle></CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <form onSubmit={handleAddCountry} className="space-y-4">
                <input type="text" value={countryName} onChange={(e) => setCountryName(e.target.value)} className="flex h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="New Country Name" required />
                <Button type="submit" variant="outline" className="w-full h-11 font-bold uppercase text-[10px] tracking-widest border-white/20">Register Region</Button>
              </form>
              <div className="mt-8 flex flex-wrap gap-2">
                {countries.map((c: any) => (
                  <div key={c.id} className="text-[9px] sm:text-[10px] font-bold bg-white/5 pl-2 pr-1 py-1 rounded-md border border-white/5 flex items-center gap-2 group transition-all hover:border-accent/40">
                    <Globe className="h-3 w-3 text-accent" /> 
                    <span className="text-white/80">{c.name}</span>
                    <button 
                      onClick={() => handleDeleteCountry(c.id)}
                      className="opacity-40 hover:opacity-100 transition-opacity p-0.5 hover:bg-red-500/20 rounded text-destructive"
                      title="Remove Region"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="font-headline text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">Active Bundles</h2>
        <Card className="glass-card border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5">
                  <TableHead className="font-bold uppercase text-[9px] sm:text-[10px] tracking-widest text-white/60 min-w-[150px]">Identity</TableHead>
                  <TableHead className="font-bold uppercase text-[9px] sm:text-[10px] tracking-widest text-white/60">Region</TableHead>
                  <TableHead className="font-bold uppercase text-[9px] sm:text-[10px] tracking-widest text-white/60">Tier</TableHead>
                  <TableHead className="font-bold uppercase text-[9px] sm:text-[10px] tracking-widest text-white/60 text-center">Sales</TableHead>
                  <TableHead className="font-bold uppercase text-[9px] sm:text-[10px] tracking-widest text-white/60">Price (Base)</TableHead>
                  <TableHead className="font-bold text-right uppercase text-[9px] sm:text-[10px] tracking-widest text-white/60">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group: any) => {
                  const pricing = getBundlePricing(group.price, group.salesCount || 0);
                  return (
                    <TableRow key={group.id} className="hover:bg-white/5 border-white/5">
                      <TableCell className="font-bold text-sm text-white">{group.title}</TableCell>
                      <TableCell className="text-[10px] uppercase opacity-60 font-mono text-white/80">{group.country}</TableCell>
                      <TableCell>
                        <div className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${pricing.borderColor} ${pricing.bgColor} ${pricing.color} flex items-center gap-1 w-fit`}>
                          <Zap className="h-2 w-2" /> {pricing.tier}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono text-[10px] text-white/60">{group.salesCount || 0}</TableCell>
                      <TableCell className="font-headline font-bold text-sm">
                        <div className="flex flex-col">
                          <span className={pricing.color}>₦{pricing.price.toLocaleString()}</span>
                          <span className="text-[9px] opacity-40 font-mono">Base: ₦{group.price?.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleResetSales(group.id)} 
                            title="Reset Sales Count" 
                            className="h-8 w-8 text-yellow-500 hover:bg-yellow-500/10"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(group)} className="h-8 w-8 text-accent hover:bg-accent/10"><Edit3 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteGroup(group.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-white/10 max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-headline text-lg sm:text-xl uppercase tracking-widest text-white">Update Protocol</DialogTitle></DialogHeader>
          {editingGroup && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-bold font-mono">Bundle Title</Label>
                  <Input value={editingGroup.title} onChange={(e) => setEditingGroup({...editingGroup, title: e.target.value})} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-bold font-mono">Base Price (₦)</Label>
                  <Input type="number" value={editingGroup.price} onChange={(e) => setEditingGroup({...editingGroup, price: e.target.value})} className="bg-white/5 border-white/10" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[9px] uppercase font-bold font-mono">Update Region</Label>
                <Select onValueChange={(val) => setEditingGroup({...editingGroup, country: val})} value={editingGroup.country}>
                  <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select Country" /></SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    {countries.map((c: any) => <SelectItem key={c.id} value={c.name} className="uppercase text-[10px] font-bold">{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Update Links</Label>
                  <span className="text-[9px] font-bold text-accent uppercase font-mono px-2 py-0.5 rounded-full bg-accent/5">
                    {editingGroup.links.length} Nodes Loaded
                  </span>
                </div>
                <div className="space-y-4">
                  {editingGroup.links.map((link: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                        <div className="space-y-1">
                          <Label className="text-[9px] uppercase font-bold opacity-40 font-mono">Label</Label>
                          <Input placeholder="Label" value={link.label} onChange={(e) => {
                            const l = [...editingGroup.links];
                            l[idx].label = e.target.value;
                            setEditingGroup({...editingGroup, links: l});
                          }} className="bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] uppercase font-bold opacity-40 font-mono">URL</Label>
                          <Input placeholder="URL" value={link.url} onChange={(e) => {
                            const l = [...editingGroup.links];
                            l[idx].url = e.target.value;
                            setEditingGroup({...editingGroup, links: l});
                          }} className="bg-white/5 border-white/10" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="button" variant="ghost" size="sm" onClick={() => {
                          const l = editingGroup.links.filter((_:any, i:number) => i !== idx);
                          setEditingGroup({...editingGroup, links: l});
                        }} className="text-destructive h-8 text-[10px] font-bold uppercase hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 mr-2" />Remove</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingGroup({...editingGroup, links: [...editingGroup.links, {label:"", url:""}]})} className="w-full sm:w-auto text-[10px] uppercase tracking-widest border-white/20">Add Link</Button>
              </div>

              <div className="space-y-1">
                <Label className="text-[9px] uppercase font-bold font-mono">Protocol Description</Label>
                <Textarea value={editingGroup.description} onChange={(e) => setEditingGroup({...editingGroup, description: e.target.value})} className="bg-white/5 min-h-[100px] border-white/10" />
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto order-2 sm:order-1 text-white/60">Cancel</Button>
            <Button onClick={handleUpdateGroup} className="w-full sm:w-auto bg-primary text-white order-1 sm:order-2">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

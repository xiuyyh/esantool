
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFirestore, useCollection, useUser, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Trash2, Edit3, Loader2, Plus, Zap, Download, Monitor, HardDrive } from "lucide-react";
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

const DEFAULT_SOFTWARE_IMAGE = "https://picsum.photos/seed/software/600/400";

export default function AdminSoftwarePage() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile, loading: profileLoading } = useDoc(userRef);

  const softwareQuery = useMemoFirebase(() => db ? collection(db, "software") : null, [db]);
  const { data: softwareItems, loading: softwareLoading } = useCollection(softwareQuery);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const [editingSoftware, setEditingSoftware] = useState<any>(null);
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

  const handleAddSoftware = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    const data = {
      title,
      price: Number(price),
      description: desc,
      downloadUrl,
      version,
      imageUrls: imageUrls.length > 0 ? imageUrls : [DEFAULT_SOFTWARE_IMAGE],
      createdAt: serverTimestamp(),
    };

    addDoc(collection(db, "software"), data)
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'software',
          operation: 'create',
          requestResourceData: data
        }));
      });
    
    toast({ title: "Success", description: "Software listed successfully." });
    setTitle("");
    setPrice("");
    setDesc("");
    setDownloadUrl("");
    setVersion("1.0.0");
    setImageUrls([]);
  };

  const handleDeleteSoftware = (id: string) => {
    if (!db || !confirm("Delete this software?")) return;
    deleteDoc(doc(db, "software", id))
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `software/${id}`,
          operation: 'delete'
        }));
      });
    toast({ title: "Deleted", description: "Software removed from registry." });
  };

  const openEditDialog = (item: any) => {
    setEditingSoftware({ ...item });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSoftware = () => {
    if (!db || !editingSoftware) return;
    
    const docRef = doc(db, "software", editingSoftware.id);
    const updateData = {
      title: editingSoftware.title,
      price: Number(editingSoftware.price),
      description: editingSoftware.description,
      downloadUrl: editingSoftware.downloadUrl,
      version: editingSoftware.version,
    };

    updateDoc(docRef, updateData)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updateData
        }));
      });

    toast({ title: "Updated", description: "Software registry updated." });
    setIsEditDialogOpen(false);
    setEditingSoftware(null);
  };

  if (authLoading || profileLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user || !profile?.isAdmin) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12 overflow-x-hidden">
      <div className="border-b border-white/5 pb-6">
        <h1 className="font-headline text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white">Software Lab</h1>
        <p className="text-muted-foreground mt-1 text-[10px] sm:text-xs uppercase tracking-widest font-mono">Digital Asset Deployment & Registry</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
        <div className="lg:col-span-8 space-y-8 min-w-0">
          <Card className="glass-card border-white/5 w-full">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="font-headline text-lg sm:text-xl uppercase tracking-widest text-white">List New Asset</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <form onSubmit={handleAddSoftware} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Software Identity</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Nexus VPN Client" required className="bg-white/5 h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Valuation (₦)</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="15000" required className="bg-white/5 h-12" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Secure Download URL</Label>
                    <Input value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} placeholder="https://cloud-storage.com/..." required className="bg-white/5 h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Build Version</Label>
                    <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" className="bg-white/5 h-12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Visual Brief</Label>
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
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Technical Intelligence</Label>
                  <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="bg-white/5 min-h-[100px] border-white/10" placeholder="Software features, requirements, etc..." required />
                </div>

                <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90 font-bold h-14 uppercase tracking-widest text-xs shadow-lg">
                   <Monitor className="h-4 w-4 mr-2" />
                   Authorize Asset Listing
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <Card className="glass-card border-white/5 bg-accent/5">
              <CardHeader className="p-6">
                 <CardTitle className="text-sm uppercase tracking-[0.2em] font-bold text-accent">Active Registry Info</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground">Total Assets</span>
                    <span className="text-xl font-bold text-white">{softwareItems.length}</span>
                 </div>
                 <div className="p-4 rounded-xl border border-white/5 bg-black/20">
                    <p className="text-[9px] text-muted-foreground uppercase leading-relaxed">
                       Software assets are delivered via encrypted download URLs immediately after authorized checkout.
                    </p>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>

      <section className="space-y-6">
        <h2 className="font-headline text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">Asset Deployment Ledger</h2>
        <Card className="glass-card border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5">
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-white/60">Software Identity</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-white/60">Version</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-white/60">Valuation</TableHead>
                  <TableHead className="font-bold text-right uppercase text-[10px] tracking-widest text-white/60">Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {softwareItems.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-white/5 border-white/5">
                    <TableCell className="font-bold text-sm text-white">{item.title}</TableCell>
                    <TableCell className="font-mono text-[10px] text-white/60">{item.version}</TableCell>
                    <TableCell className="font-headline font-bold text-accent text-sm">₦{item.price?.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)} className="h-8 w-8 text-accent hover:bg-accent/10"><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteSoftware(item.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {softwareItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 opacity-40 uppercase text-[10px]">No software deployed.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-white/10 max-w-2xl">
          <DialogHeader><DialogTitle className="font-headline text-lg uppercase tracking-widest text-white">Update Asset Protocol</DialogTitle></DialogHeader>
          {editingSoftware && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-bold">Identity</Label>
                  <Input value={editingSoftware.title} onChange={(e) => setEditingSoftware({...editingSoftware, title: e.target.value})} className="bg-white/5" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-bold">Valuation (₦)</Label>
                  <Input type="number" value={editingSoftware.price} onChange={(e) => setEditingSoftware({...editingSoftware, price: e.target.value})} className="bg-white/5" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-bold">Download URL</Label>
                  <Input value={editingSoftware.downloadUrl} onChange={(e) => setEditingSoftware({...editingSoftware, downloadUrl: e.target.value})} className="bg-white/5" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-bold">Version</Label>
                  <Input value={editingSoftware.version} onChange={(e) => setEditingSoftware({...editingSoftware, version: e.target.value})} className="bg-white/5" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] uppercase font-bold">Technical Inteligance</Label>
                <Textarea value={editingSoftware.description} onChange={(e) => setEditingSoftware({...editingSoftware, description: e.target.value})} className="bg-white/5 min-h-[100px]" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateSoftware} className="bg-primary text-white">Save Updates</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

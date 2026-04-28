"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export default function AdminDashboard() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: categories } = useCollection(db ? collection(db, "categories") : null);

  const [groupTitle, setGroupTitle] = useState("");
  const [groupPrice, setGroupPrice] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupCat, setGroupCat] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  const [catName, setCatName] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, authLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) { // Limit to ~800KB for Base64 storage in Firestore for this prototype
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 800KB for optimal performance.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    try {
      await addDoc(collection(db, "groups"), {
        title: groupTitle,
        price: Number(groupPrice),
        description: groupDesc,
        category: groupCat,
        imageUrl: imageUrl || "https://picsum.photos/seed/default/600/400",
        createdAt: serverTimestamp(),
      });
      
      toast({ title: "Success", description: "Listing created successfully." });
      setGroupTitle("");
      setGroupPrice("");
      setGroupDesc("");
      setGroupCat("");
      setImageUrl("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    try {
      await addDoc(collection(db, "categories"), {
        name: catName,
      });
      
      toast({ title: "Success", description: "Category created." });
      setCatName("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="font-headline animate-pulse uppercase tracking-widest text-accent">Securing Connection...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="border-b border-white/5 pb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tight uppercase">Admin Console</h1>
        <p className="text-muted-foreground mt-2">Manage marketplace assets and system configurations.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="font-headline text-xl">New Group Listing</CardTitle>
              <CardDescription>Configure and deploy a new private access link.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGroup} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. VIP Alpha Network" 
                      value={groupTitle}
                      onChange={(e) => setGroupTitle(e.target.value)}
                      className="bg-white/5 border-white/10"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₦)</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        placeholder="0" 
                        value={groupPrice}
                        onChange={(e) => setGroupPrice(e.target.value)}
                        className="bg-white/5 border-white/10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select onValueChange={setGroupCat} value={groupCat}>
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="glass-card">
                          {categories.map((c: any) => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Preview Image</Label>
                    <div className="flex flex-col gap-4">
                      {imageUrl ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                          <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setImageUrl("")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="aspect-video rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Upload Preview Image</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea 
                      id="desc" 
                      placeholder="Details about group benefits and access level..." 
                      value={groupDesc}
                      onChange={(e) => setGroupDesc(e.target.value)}
                      className="bg-white/5 border-white/10 min-h-[120px]"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest py-6">
                  Deploy Listing
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="font-headline text-xl text-center">Manage Sectors</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="catName">Category Name</Label>
                  <Input 
                    id="catName" 
                    placeholder="e.g. Trading, Gaming" 
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <Button type="submit" variant="outline" className="w-full border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest">
                  Create Category
                </Button>
              </form>

              <div className="mt-8 space-y-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest border-b border-white/5 pb-2">Existing Sectors</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c: any) => (
                    <div key={c.id} className="text-xs font-bold bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                      {c.name}
                    </div>
                  ))}
                  {categories.length === 0 && <p className="text-xs text-muted-foreground italic">No sectors defined.</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 border-dashed">
            <CardContent className="pt-6 text-center space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Terminal Status</p>
              <div className="font-mono text-sm text-green-500">OPERATIONAL</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

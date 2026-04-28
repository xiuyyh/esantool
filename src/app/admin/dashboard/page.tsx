
"use client";

import { useState } from "react";
import { 
  Plus, 
  Package, 
  Tags, 
  Terminal,
  ShieldCheck,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  
  // Data for Selects
  const { data: categories } = useCollection(db ? collection(db, "categories") : null);

  // Form States
  const [groupTitle, setGroupTitle] = useState("");
  const [groupPrice, setGroupPrice] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupCat, setGroupCat] = useState("");
  
  const [catName, setCatName] = useState("");

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    try {
      await addDoc(collection(db, "groups"), {
        title: groupTitle,
        price: Number(groupPrice),
        description: groupDesc,
        category: groupCat,
        imageUrl: "https://picsum.photos/seed/" + Math.random() + "/600/400",
        createdAt: serverTimestamp(),
      });
      
      toast({ title: "Success", description: "Telegram group added successfully." });
      setGroupTitle("");
      setGroupPrice("");
      setGroupDesc("");
      setGroupCat("");
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex items-center space-x-4 border-b border-white/5 pb-8">
        <div className="bg-primary/20 p-3 rounded-2xl">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground">Manage marketplace assets and categories.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Add Group Form */}
        <Card className="glass-card border-white/5">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-accent" />
              <CardTitle className="font-headline text-xl">New Group Listing</CardTitle>
            </div>
            <CardDescription>Launch a new private Telegram group into the market.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddGroup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Group Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Alpha Signals HQ" 
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
                    placeholder="25000" 
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
                      {categories.length === 0 && <SelectItem value="none" disabled>No categories</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea 
                  id="desc" 
                  placeholder="Explain why this group is high-value..." 
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  className="bg-white/5 border-white/10 min-h-[100px]"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-bold">
                <Plus className="h-4 w-4 mr-2" />
                CREATE LISTING
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Add Category Form */}
        <div className="space-y-8">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Tags className="h-5 w-5 text-accent" />
                <CardTitle className="font-headline text-xl">Manage Categories</CardTitle>
              </div>
              <CardDescription>Organize your marketplace by adding new sectors.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="catName">Category Name</Label>
                  <Input 
                    id="catName" 
                    placeholder="e.g. DeFi, OpSec, Gaming" 
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="bg-white/5 border-white/10"
                    required
                  />
                </div>
                <Button type="submit" variant="outline" className="w-full border-white/10 hover:bg-white/5 font-bold">
                  <Plus className="h-4 w-4 mr-2" />
                  ADD CATEGORY
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 border-dashed">
            <CardHeader>
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="font-headline text-lg">System Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Database: <span className="text-green-500 font-mono">ONLINE</span></p>
              <p>Active Listings: <span className="text-foreground font-mono">{categories.length} sections available</span></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


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
import { Upload, X, Globe, Lock } from "lucide-react";

export default function AdminDashboard() {
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: countries } = useCollection(db ? collection(db, "countries") : null);

  const [groupTitle, setGroupTitle] = useState("");
  const [groupPrice, setGroupPrice] = useState("");
  const [groupLink, setGroupLink] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupCountry, setGroupCountry] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const [countryName, setCountryName] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, authLoading, router]);

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
    
    try {
      addDoc(collection(db, "groups"), {
        title: groupTitle,
        price: Number(groupPrice),
        accessLink: groupLink,
        description: groupDesc,
        country: groupCountry,
        imageUrls: imageUrls.length > 0 ? imageUrls : ["https://picsum.photos/seed/default/600/400"],
        createdAt: serverTimestamp(),
      });
      
      toast({ title: "Success", description: "Listing deployed successfully." });
      setGroupTitle("");
      setGroupPrice("");
      setGroupLink("");
      setGroupDesc("");
      setGroupCountry("");
      setImageUrls([]);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    try {
      addDoc(collection(db, "countries"), {
        name: countryName,
      });
      
      toast({ title: "Success", description: "Country added." });
      setCountryName("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  if (authLoading) return null;
  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <div className="border-b border-white/5 pb-8">
        <h1 className="font-headline text-3xl font-bold uppercase">Admin Command</h1>
        <p className="text-muted-foreground mt-1">Deploy and manage private group links.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Deploy New Access Point</CardTitle>
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
                    <Label htmlFor="link">Private Access Link (Hidden until paid)</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="link" 
                        placeholder="https://t.me/joinchat/..." 
                        value={groupLink}
                        onChange={(e) => setGroupLink(e.target.value)}
                        className="bg-white/5 pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Country</Label>
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
                    <Label>Preview Graphics</Label>
                    <div className="grid grid-cols-3 gap-4">
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
                    <Label htmlFor="desc">Intelligence Brief (Description)</Label>
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
                  Deploy Listing
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Manage Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCountry} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="countryName">Country Name</Label>
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

              <div className="mt-6 space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest border-b border-white/5 pb-1">Active Regions</p>
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
    </div>
  );
}

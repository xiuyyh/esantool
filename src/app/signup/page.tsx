"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Terminal, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: name,
      });

      // Initialize User Profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        balance: 0,
        purchasedGroups: [],
        cart: [],
        createdAt: new Date().toISOString()
      });

      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl glass-card border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-accent/40"></div>
        <CardHeader className="space-y-2 text-center pb-4 pt-6">
          <div className="mx-auto bg-accent/10 p-3 rounded-xl w-fit mb-1 shadow-inner">
            <ShieldCheck className="h-8 w-8 text-accent" />
          </div>
          <div className="space-y-1">
            <CardTitle className="font-headline text-2xl font-bold uppercase tracking-tight">Sign Up</CardTitle>
            <CardDescription className="text-muted-foreground text-sm font-medium">
              Create an account to start buying.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-8 sm:px-12">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="John Doe"
                  className="h-11 pl-12 glass-card border-white/10 focus:border-accent/30 focus:ring-accent/20 transition-all" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com"
                  className="h-11 pl-12 glass-card border-white/10 focus:border-accent/30 focus:ring-accent/20 transition-all" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" title="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Create Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="h-11 pl-12 glass-card border-white/10 focus:border-accent/30 focus:ring-accent/20 transition-all" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg uppercase tracking-widest mt-2 shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? "CREATING..." : "SIGN UP"}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="pb-6 pt-4 flex flex-col space-y-2">
          <div className="w-full h-px bg-white/5 mb-2"></div>
          <p className="text-center w-full text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-accent font-bold hover:underline tracking-tight">
              Login here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

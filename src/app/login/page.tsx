
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Terminal, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth || !db) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Ensure user profile exists and is initialized
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        balance: 0,
        purchasedGroups: [],
        cart: [],
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Network Interruption",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-accent/30"></div>
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto bg-accent/10 p-3 rounded-xl w-fit mb-2">
            <Terminal className="h-8 w-8 text-accent" />
          </div>
          <CardTitle className="font-headline text-3xl font-bold">Authentication</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to access regional intelligence nodes.
          </CardDescription>
        </Header>
        <CardContent className="space-y-6">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                className="h-12 glass-card border-white/10" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Security Key</Label>
              <Input 
                id="password" 
                type="password" 
                className="h-12 glass-card border-white/10" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg"
              disabled={loading}
            >
              {loading ? "AUTHENTICATING..." : "SIGN IN"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">External Provider</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-12 border-white/10 hover:bg-white/5 font-bold"
            onClick={handleGoogleLogin}
          >
            GOOGLE AUTH
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-center w-full text-sm text-muted-foreground">
            No credentials?{" "}
            <Link href="/signup" className="text-accent font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

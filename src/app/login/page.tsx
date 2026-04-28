
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Terminal, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
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
        title: "Login Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl glass-card border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-accent/40"></div>
        <CardHeader className="space-y-6 text-center pb-8 pt-10">
          <div className="mx-auto bg-accent/10 p-5 rounded-2xl w-fit mb-2 shadow-inner">
            <Terminal className="h-12 w-12 text-accent" />
          </div>
          <div className="space-y-2">
            <CardTitle className="font-headline text-4xl font-bold uppercase tracking-tight">Login</CardTitle>
            <CardDescription className="text-muted-foreground text-base font-medium">
              Sign in to buy your groups.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 px-8 sm:px-12">
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com"
                  className="h-14 pl-12 glass-card border-white/10 text-lg focus:border-accent/30 focus:ring-accent/20 transition-all" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Your Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="h-14 pl-12 glass-card border-white/10 text-lg focus:border-accent/30 focus:ring-accent/20 transition-all" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl uppercase tracking-[0.15em] mt-6 shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
              {!loading && <ArrowRight className="ml-2 h-6 w-6" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="pb-12 pt-6 flex flex-col space-y-4">
          <div className="w-full h-px bg-white/5 mb-2"></div>
          <p className="text-center w-full text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-accent font-bold hover:underline tracking-tight">
              Sign up here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

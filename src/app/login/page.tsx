
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
      <Card className="w-full max-w-lg glass-card border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-accent/30"></div>
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto bg-accent/10 p-4 rounded-xl w-fit mb-2">
            <Terminal className="h-10 w-10 text-accent" />
          </div>
          <div className="space-y-2">
            <CardTitle className="font-headline text-4xl font-bold">Login</CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Sign in to buy groups.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-10">
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com"
                className="h-14 glass-card border-white/10 text-lg" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                className="h-14 glass-card border-white/10 text-lg" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl uppercase tracking-widest mt-4"
              disabled={loading}
            >
              {loading ? "Logging in..." : "LOGIN"}
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="pb-10 pt-4 flex flex-col space-y-4">
          <p className="text-center w-full text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/signup" className="text-accent font-bold hover:underline">
              Sign up here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

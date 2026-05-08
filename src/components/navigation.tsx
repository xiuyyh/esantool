"use client";

import Link from "next/link";
import { ShoppingCart, User, Terminal, LogOut, LayoutDashboard, Activity, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Navigation() {
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();

  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile } = useDoc(userRef);

  const cartCount = profile?.cart?.length || 0;

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <nav className="sticky top-0 w-full z-[100] border-b border-accent/20 bg-background/80 backdrop-blur-xl h-16 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-6">
          <SidebarTrigger className="text-accent hover:text-accent/80" />
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-accent animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent/60">System Online</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3 text-accent" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent/60">Server: Local-01</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <Button variant="ghost" size="icon" className="relative hover:bg-accent/10 border border-accent/10" asChild>
            <Link href="/checkout">
              <ShoppingCart className="h-5 w-5 text-accent" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent text-background text-[8px] font-bold rounded-full border border-background flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-4 border border-accent/20 rounded-none bg-accent/5 hover:bg-accent/10 text-accent font-mono text-[10px] tracking-widest uppercase">
                  <User className="h-3 w-3 mr-2" />
                  {user.displayName || "User"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 glass-card border-accent/20 z-[110] rounded-none">
                <DropdownMenuLabel className="px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-accent/60">
                  Account Settings
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-accent/10" />
                <DropdownMenuItem className="focus:bg-accent focus:text-background py-2 px-3 rounded-none cursor-pointer font-mono text-[10px] uppercase" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-3 w-3 mr-2" />
                    My Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-accent/10" />
                <DropdownMenuItem 
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive py-2 px-3 rounded-none cursor-pointer font-mono text-[10px] uppercase" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-3 w-3 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-[10px] font-mono font-bold tracking-[0.2em] h-8 text-accent/60 hover:text-accent" asChild>
                <Link href="/login">LOGIN</Link>
              </Button>
              <Button variant="default" size="sm" className="bg-accent text-background hover:bg-accent/90 font-mono font-bold px-4 h-8 text-[10px] tracking-[0.2em] rounded-none" asChild>
                <Link href="/signup">SIGN UP</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

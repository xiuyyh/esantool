
"use client";

import Link from "next/link";
import { ShoppingCart, User, Terminal, LogOut, LayoutDashboard, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useAuth, useFirestore, useDoc } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Navigation() {
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();

  const userRef = user && db ? doc(db, "users", user.uid) : null;
  const { data: profile } = useDoc(userRef);

  const cartCount = profile?.cart?.length || 0;

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <nav className="sticky top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md h-16 flex items-center px-4">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="h-4 w-[1px] bg-white/10 mx-2 hidden md:block" />
          <div className="hidden md:flex items-center space-x-6 text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">
            <span>Protocol: Secure</span>
            <span>Region: Global</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative hover:bg-white/5" asChild>
            <Link href="/checkout">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent text-accent-foreground text-[8px] font-bold rounded-full border-2 border-background flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 border border-white/10 overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 glass-card z-[100]">
                <DropdownMenuLabel className="px-3 py-2 font-headline text-xs uppercase tracking-wider text-muted-foreground">
                  Session Identity
                </DropdownMenuLabel>
                <div className="px-3 py-2 mb-2">
                   <p className="text-xs font-bold truncate">{user.displayName || user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground py-2 px-3 rounded-md cursor-pointer text-xs" asChild>
                  <Link href="/dashboard">
                    <UserCircle className="h-3 w-3 mr-2" />
                    My Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem 
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive py-2 px-3 rounded-md cursor-pointer text-xs" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-3 w-3 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-[10px] font-bold tracking-widest h-8 hidden sm:inline-flex" asChild>
                <Link href="/login">LOGIN</Link>
              </Button>
              <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 h-8 text-[10px] tracking-widest" asChild>
                <Link href="/signup">SIGN UP</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

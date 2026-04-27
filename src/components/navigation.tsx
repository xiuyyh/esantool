
"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, User, Menu, X, Terminal, LogOut, LayoutDashboard, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-accent/10 p-2 rounded-lg group-hover:bg-accent/20 transition-colors">
                <Terminal className="h-7 w-7 text-accent" />
              </div>
              <span className="font-headline text-2xl font-bold tracking-tighter text-foreground">
                ESAN TOOLS
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            <Link href="/products" className="text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors">
              Marketplace
            </Link>
            
            <div className="flex items-center space-x-5 border-l border-white/10 pl-10">
              <Button variant="ghost" size="icon" className="relative hover:bg-white/5">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-accent rounded-full border-2 border-background"></span>
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 border border-white/10 overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || "User"} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 p-2 glass-card">
                    <DropdownMenuLabel className="px-3 py-2 font-headline text-sm uppercase tracking-wider">
                      {user.displayName || user.email || "My Account"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground py-2 px-3 rounded-md cursor-pointer" asChild>
                      <Link href="/dashboard">
                        <UserCircle className="h-4 w-4 mr-2" />
                        My Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground py-2 px-3 rounded-md cursor-pointer" asChild>
                      <Link href="/admin/dashboard">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem 
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive py-2 px-3 rounded-md cursor-pointer" 
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-3">
                  <Button variant="ghost" asChild className="font-bold hover:text-accent">
                    <Link href="/login">LOGIN</Link>
                  </Button>
                  <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6" asChild>
                    <Link href="/signup">GET ACCESS</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-white/5 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-4 pb-8 space-y-2">
            <Link href="/products" className="block px-4 py-3 text-lg font-bold uppercase tracking-widest hover:bg-white/5 rounded-lg" onClick={() => setIsMenuOpen(false)}>Marketplace</Link>
            {user && (
              <Link href="/dashboard" className="block px-4 py-3 text-lg font-bold uppercase tracking-widest hover:bg-white/5 rounded-lg" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
            )}
            <div className="pt-6 border-t border-white/5 mt-4 space-y-3">
              {user ? (
                <Button className="w-full h-12 justify-center font-bold text-destructive" variant="ghost" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>LOGOUT</Button>
              ) : (
                <>
                  <Button className="w-full h-12 justify-center font-bold" variant="outline" asChild onClick={() => setIsMenuOpen(false)}>
                    <Link href="/login">LOGIN</Link>
                  </Button>
                  <Button className="w-full h-12 justify-center font-bold" variant="default" asChild onClick={() => setIsMenuOpen(false)}>
                    <Link href="/signup">SIGN UP</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

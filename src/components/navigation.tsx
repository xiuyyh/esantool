
"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, User, Menu, X, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock state

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Terminal className="h-8 w-8 text-accent" />
              <span className="font-headline text-xl font-bold tracking-tight text-foreground">
                ESAN TOOLS
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-sm font-medium hover:text-accent transition-colors">
              Marketplace
            </Link>
            <Link href="/services" className="text-sm font-medium hover:text-accent transition-colors">
              Web Dev
            </Link>
            <Link href="/support" className="text-sm font-medium hover:text-accent transition-colors">
              Support
            </Link>
            
            <div className="flex items-center space-x-4 border-l border-white/10 pl-8">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full"></span>
              </Button>

              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/orders">My Orders</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/admin/dashboard">Admin Dashboard</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsLoggedIn(false)}>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="default" className="bg-primary hover:bg-primary/90" onClick={() => setIsLoggedIn(true)}>
                  Get Access
                </Button>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-white/5 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/products" className="block px-3 py-2 text-base font-medium hover:text-accent">Marketplace</Link>
            <Link href="/services" className="block px-3 py-2 text-base font-medium hover:text-accent">Services</Link>
            <Link href="/orders" className="block px-3 py-2 text-base font-medium hover:text-accent">My Orders</Link>
            <div className="pt-4 border-t border-white/5">
              <Button className="w-full justify-start" variant="ghost">Login</Button>
              <Button className="w-full mt-2" variant="default">Sign Up</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

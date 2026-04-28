
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  LayoutDashboard,
  ShoppingCart,
  ShieldCheck,
  Globe,
  Settings,
  LogOut,
  User,
  Package,
  Key,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useUser, useAuth, useFirestore, useDoc } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const userRef = user && db ? doc(db, "users", user.uid) : null;
  const { data: profile } = useDoc(userRef);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const menuGroups = [
    {
      label: "General",
      items: [
        {
          title: "Shop",
          url: "/products",
          icon: Globe,
        },
      ],
    },
    {
      label: "My Account",
      items: [
        {
          title: "My Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
  ];

  if (user) {
    menuGroups.push({
      label: "Admin",
      items: [
        {
          title: "Admin Dashboard",
          url: "/admin/dashboard",
          icon: ShieldCheck,
        },
      ],
    });
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-card/50 backdrop-blur-xl">
      <SidebarHeader className="h-20 flex items-center justify-center border-b border-white/5">
        <Link href="/" className="flex items-center space-x-3 group px-4">
          <div className="bg-accent/10 p-2 rounded-lg group-hover:bg-accent/20 transition-colors">
            <Terminal className="h-6 w-6 text-accent" />
          </div>
          <span className="font-headline text-xl font-bold tracking-tighter text-foreground group-data-[collapsible=icon]:hidden">
            ESAN TOOLS
          </span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      className="hover:bg-accent/10 hover:text-accent transition-colors"
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/5 p-4">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center">
              <div className="h-8 w-8 rounded-full border border-white/10 bg-secondary flex items-center justify-center shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="h-full w-full object-cover rounded-full" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-bold truncate">{user.displayName || user.email}</p>
                <p className="text-[10px] text-muted-foreground truncate uppercase tracking-tighter">User</p>
              </div>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive group-data-[collapsible=icon]:justify-center"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="bg-primary text-white hover:bg-primary/90 group-data-[collapsible=icon]:justify-center">
                <Link href="/login">
                  <Key className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">Login</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

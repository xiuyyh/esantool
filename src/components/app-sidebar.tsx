"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  LayoutDashboard,
  LogOut,
  User,
  Key,
  History,
  Settings,
  CreditCard,
  Users,
  MessageSquare,
  LifeBuoy,
  Gift,
  ShieldAlert,
  Monitor,
  Zap,
  Layers,
  HelpCircle,
  HardDrive
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
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user?.uid]);
  const { data: profile } = useDoc(userRef);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const menuGroups = [
    {
      label: "Marketplace",
      items: [
        {
          title: "Telegram Groups",
          url: "/",
          icon: Layers,
        },
        {
          title: "Software Store",
          url: "/software",
          icon: Monitor,
        },
        {
          title: "Help & FAQ",
          url: "/faq",
          icon: HelpCircle,
        },
      ],
    },
  ];

  if (user) {
    menuGroups.push({
      label: "My Account",
      items: [
        {
          title: "My Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Wallet History",
          url: "/dashboard/transactions",
          icon: History,
        },
        {
          title: "Refer & Earn",
          url: "/dashboard/referrals",
          icon: Gift,
        },
        {
          title: "Support Desk",
          url: "/dashboard/support",
          icon: LifeBuoy,
        },
      ],
    });

    if (profile?.isAdmin) {
      menuGroups.push({
        label: "Admin Management",
        items: [
          {
            title: "Groups & Links",
            url: "/admin/dashboard",
            icon: Key,
          },
          {
            title: "Software Lab",
            url: "/admin/software",
            icon: HardDrive,
          },
          {
            title: "User Manager",
            url: "/admin/users",
            icon: Users,
          },
          {
            title: "Deposit Requests",
            url: "/admin/transactions",
            icon: CreditCard,
          },
          {
            title: "Issue Resolver",
            url: "/admin/disputes",
            icon: ShieldAlert,
          },
          {
            title: "Support Messages",
            url: "/admin/support",
            icon: MessageSquare,
          },
          {
            title: "FAQ Manager",
            url: "/admin/faqs",
            icon: HelpCircle,
          },
          {
            title: "App Settings",
            url: "/admin/settings",
            icon: Settings,
          },
        ],
      });
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 bg-card/60 backdrop-blur-2xl">
      <SidebarHeader className="h-20 flex items-center justify-center border-b border-white/10">
        <Link href="/" className="flex items-center space-x-3 group px-4">
          <div className="bg-accent/20 p-2 rounded-lg group-hover:bg-accent/30 transition-colors shadow-lg shadow-accent/5">
            <Terminal className="h-6 w-6 text-accent" />
          </div>
          <span className="font-headline text-xl font-bold tracking-tighter text-white group-data-[collapsible=icon]:hidden">
            ESAN TOOLS
          </span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent">
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
                      className="hover:bg-accent/20 hover:text-accent transition-colors h-11 text-white data-[active=true]:bg-accent/20 data-[active=true]:text-accent"
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4.5 w-4.5" />
                        <span className="font-mono text-[11px] uppercase tracking-wider font-bold">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-4">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center">
              <div className="h-9 w-9 rounded-full border border-accent/30 bg-secondary flex items-center justify-center shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="h-full w-full object-cover rounded-full" />
                ) : (
                  <User className="h-5 w-5 text-accent" />
                )}
              </div>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-bold truncate text-white">{user.displayName || user.email}</p>
                <p className="text-[9px] text-accent truncate uppercase tracking-widest font-bold">
                  {profile?.isAdmin ? "Administrator" : "Member"}
                </p>
              </div>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  className="w-full text-destructive hover:bg-destructive/20 hover:text-destructive group-data-[collapsible=icon]:justify-center h-10 font-bold"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden uppercase text-[10px] tracking-widest">Log Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="bg-primary text-white hover:bg-primary/90 group-data-[collapsible=icon]:justify-center h-12 shadow-lg shadow-primary/20">
                <Link href="/login">
                  <Key className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden font-bold uppercase tracking-widest text-xs">Login</span>
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
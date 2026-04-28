
"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/toaster";

/**
 * AppShell handles the conditional rendering of the application's chrome.
 * It hides the sidebar and navigation on authentication pages to provide a clean UI.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Define paths where the sidebar and navigation should be completely hidden
  const authPaths = ["/login", "/signup", "/admin/login", "/admin/signup"];
  const isAuthPage = authPaths.includes(pathname);

  if (isAuthPage) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex flex-col items-center justify-center">
          {children}
        </main>
        <Toaster />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <Navigation />
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}


'use client';

import { ReactNode, useState } from "react";
import Link from "next/link";
import { Home, PanelLeft, LogOut } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth-actions";

// This is a dedicated root layout for the /admin section.
// It ensures the admin panel is completely separate from the main app,
// with its own styling, navigation, and structure.
export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-muted/40">
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            storageKey="plan-b-admin-theme" // Use a separate theme key for admin
            enableSystem
        >
          <div className="flex min-h-screen w-full">
            <AdminSidebar className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex" />
            <div className="flex w-full flex-col sm:pl-14">
              <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="sm:hidden">
                      <PanelLeft className="h-5 w-5" />
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="sm:max-w-xs p-0">
                    <AdminSidebar isMobile={true} onLinkClick={() => setIsSheetOpen(false)} />
                  </SheetContent>
                </Sheet>
                 <div className="flex-1">
                    {/* Breadcrumbs could be added here in the future */}
                 </div>
                 <Button variant="outline" asChild>
                   <Link
                      href="/"
                      className="flex items-center gap-2 text-sm"
                    >
                      <Home className="h-4 w-4" />
                      <span>Ver Sitio</span>
                    </Link>
                 </Button>
                 <form action={logout}>
                    <Button variant="destructive" size="sm">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Salir</span>
                    </Button>
                 </form>
              </header>
              <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
                {children}
              </main>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}


'use client';

import { ReactNode, useState } from "react";
import Link from "next/link";
import { Home, PanelLeft, LogOut, Sun, Moon } from "lucide-react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth-actions";

function ThemeToggleButton() {
    const { setTheme, theme } = useTheme();
    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    // Admin layout uses a separate ThemeProvider to avoid conflicts with public site theme
    <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        storageKey="plan-b-admin-theme"
        enableSystem
    >
      <div className="flex min-h-screen w-full bg-muted/40">
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
             <div className="flex items-center gap-2">
                <ThemeToggleButton />
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
             </div>
          </header>
          <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-6 md:gap-8">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

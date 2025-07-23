import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    // The login page is a standalone page and needs its own html/body structure.
    // It uses a separate ThemeProvider to ensure the admin theme is applied.
    <html lang="es" suppressHydrationWarning>
      <body>
         <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            storageKey="plan-b-admin-theme"
            enableSystem
        >
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

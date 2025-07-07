import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
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

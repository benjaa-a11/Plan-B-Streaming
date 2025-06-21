import type { Metadata } from "next";
import { Poppins, PT_Sans } from 'next/font/google';
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/header";

const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});

const fontPTSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: "Plan B Streaming",
  description: "Tu alternativa para ver televisión en vivo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet"/>
      </head>
      <body
        className={cn(
          "min-h-screen font-body antialiased",
          fontPoppins.variable,
          fontPTSans.variable
        )}
      >
        <Header />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

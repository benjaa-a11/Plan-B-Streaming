import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { cn } from "@/lib/utils";
import { getCategories, getMovieCategories, getAppStatus } from "@/lib/actions";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import { redirect } from 'next/navigation'
import { cookies } from "next/headers";
import { decrypt } from "./lib/session";

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Plan B Streaming",
  description: "Tu alternativa para ver televisión en vivo.",
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Plan B Streaming",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#000000' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [channelCategories, movieCategories] = await Promise.all([
    getCategories(),
    getMovieCategories()
  ]);

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          fontInter.variable
        )}
      >
        <Providers 
          channelCategories={channelCategories} 
          movieCategories={movieCategories}
        >
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

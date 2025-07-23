import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { cn } from "@/lib/utils";
import { getCategories, getMovieCategories } from "@/lib/actions";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import LayoutWrapper from "@/components/layout-wrapper";

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
    { media: '(prefers-color-scheme: light)', color: '#F1F5F8' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
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
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

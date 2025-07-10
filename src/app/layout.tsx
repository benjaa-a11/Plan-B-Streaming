import type { Metadata, Viewport } from "next";
import { Poppins, PT_Sans } from 'next/font/google';
import "./globals.css";
import { cn } from "@/lib/utils";
import { getCategories, getMovieCategories } from "@/lib/actions";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";

const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
});

const fontPtSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
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
    { media: '(prefers-color-scheme: light)', color: '#F7F8F9' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const channelCategories = await getCategories();
  const movieCategories = await getMovieCategories();

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          fontPoppins.variable,
          fontPtSans.variable
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
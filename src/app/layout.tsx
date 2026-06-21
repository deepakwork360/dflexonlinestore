import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import MainHeader from "@/components/ui/layout/MainHeader";
import Footer from "@/components/ui/layout/Footer";
import { Volkhov, Kanit, Space_Grotesk, Bodoni_Moda, Lilita_One } from "next/font/google";
import TopAnnouncementBar from "@/components/ui/layout/TopAnnouncementBar";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Toaster } from "sonner";
import CartDrawer from "@/components/ui/cart/CartDrawer";
import WishlistDrawer from "@/components/ui/cart/WishlistDrawer";

const volkhov = Volkhov({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
});

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["900"],
  style: ["italic"],
  variable: "--font-kanit",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"], // Fetch regular and heavy weights
  variable: "--font-space-grotesk",
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-bodoni",
});

const lilitaOne = Lilita_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-lilita",
});


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: "StepAhead Store",
  description: "Step into style with StepAhead Sneakers. Premium, comfortable, and designed for every step of your journey. Shop men's, women's, and kids' footwear now.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "StepAhead Store",
    description: "Step into style with StepAhead Sneakers. Premium, comfortable, and designed for every step of your journey. Shop men's, women's, and kids' footwear now.",
    url: "https://stepahead.vercel.app",
    siteName: "StepAhead Store",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "StepAhead Store",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          logoImageUrl: '/logo.png',
          logoPlacement: 'inside',
        },
        variables: {
          colorPrimary: '#B61C38',
          borderRadius: '0px',
          fontFamily: 'var(--font-sans)',
        },
      }}
    >
      <html
        lang="en"
        className={cn("h-full", "antialiased", volkhov.variable, geistMono.variable, kanit.variable, spaceGrotesk.variable, bodoniModa.variable, lilitaOne.variable, "font-sans",)}
      >
        <body className="min-h-full flex flex-col">
        <WishlistProvider>
          <CartProvider>
            <TopAnnouncementBar />
            <MainHeader />
            <main className="flex-grow">{children}</main>
            <Footer />
            <CartDrawer />
            <WishlistDrawer />
            <Toaster position="bottom-center" richColors closeButton />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}

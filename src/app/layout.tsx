import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import MainHeader from "@/components/ui/layout/MainHeader";
import Footer from "@/components/ui/layout/Footer";
import { Volkhov } from "next/font/google";
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


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dflex Online Store",
  description: "Step into style with Dflex Sneakers. Premium, comfortable, and designed for every step of your journey. Shop men's, women's, and kids' footwear now.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Dflex Online Store",
    description: "Step into style with Dflex Sneakers. Premium, comfortable, and designed for every step of your journey. Shop men's, women's, and kids' footwear now.",
    url: "https://dflex.vercel.app",
    siteName: "Dflex Online Store",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Dflex Online Store",
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
    <html
      lang="en"
      className={cn("h-full", "antialiased", volkhov.variable, geistMono.variable, "font-sans",)}
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
  );
}

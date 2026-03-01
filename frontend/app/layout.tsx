import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "War Strategy - $WSTR Token",
  description: "Real Balance Sheet Memecoin Backed by Conflict Resources",
  keywords: [
    "Solana",
    "memecoin",
    "WSTR",
    "blockchain",
    "DeFi",
    "commodities",
  ],
  authors: [{ name: "War Strategy Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://warstrategy.io",
    siteName: "War Strategy",
  },
};

/**
 * Root layout component
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-military-dark text-gray-100`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

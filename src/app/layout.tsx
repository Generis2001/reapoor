import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ToastProvider } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reapoor — Stake. Supply. Earn.",
  description:
    "Earn stablecoin yield by staking and providing liquidity with USDC and EURC on Arc Testnet. Institutional-grade DeFi built natively for Arc.",
  keywords: ["DeFi", "stablecoin", "USDC", "EURC", "yield", "Arc", "staking", "liquidity"],
  openGraph: {
    title: "Reapoor — Stake. Supply. Earn.",
    description: "Earn stablecoin yield on Arc Testnet with USDC and EURC.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <Providers>
          <ToastProvider>
            {children}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}

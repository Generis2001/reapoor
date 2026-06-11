"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/Button";
import { shortAddress } from "@/lib/utils";
import { Wallet, ChevronDown, LogOut, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ARCSCAN_ADDR } from "@/lib/config";

export function Header() {
  const { address, isConnected } = useAccount();
  const { login, logout, ready } = usePrivy();
  const [dropOpen, setDropOpen] = useState(false);

  const handleDisconnect = useCallback(async () => {
    setDropOpen(false);
    await logout();
  }, [logout]);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">Reapoor</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: "/#about", label: "About" },
            { href: "/#how-it-works", label: "How It Works" },
            { href: "/#assets", label: "Assets" },
            { href: "/#security", label: "Security" },
            { href: "/#faq", label: "FAQ" },
          ].map(({ href, label }) => (
            <a key={href} href={href} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/app/dashboard">
            <Button variant="secondary" size="sm">Launch App</Button>
          </Link>

          {isConnected && address ? (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                {shortAddress(address)}
                <ChevronDown className={cn("w-4 h-4 transition-transform", dropOpen && "rotate-180")} />
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-900/10 p-1 z-50">
                  <a
                    href={ARCSCAN_ADDR(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl"
                  >
                    <ExternalLink className="w-4 h-4" /> View on Arcscan
                  </a>
                  <button
                    onClick={handleDisconnect}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <LogOut className="w-4 h-4" /> Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button size="sm" onClick={login} disabled={!ready}>
              <Wallet className="w-4 h-4" /> Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

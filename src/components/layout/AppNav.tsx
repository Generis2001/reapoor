"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { cn, shortAddress } from "@/lib/utils";
import { LayoutDashboard, Layers, Droplets, Gift, BookOpen, Wallet, LogOut, Menu, X, ExternalLink } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { ARCSCAN_ADDR } from "@/lib/config";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/stake", label: "Stake", icon: Layers },
  { href: "/app/liquidity", label: "Liquidity", icon: Droplets },
  { href: "/app/rewards", label: "Rewards", icon: Gift },
  { href: "/app/docs", label: "Documentation", icon: BookOpen },
];

export function AppNav() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { login, logout, ready } = usePrivy();
  const { disconnect } = useDisconnect();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDisconnect = useCallback(async () => {
    setMobileOpen(false);
    try { await logout(); } catch { /* ignore */ }
    disconnect();
  }, [logout, disconnect]);

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-slate-100 min-h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">Reapoor</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-blue-600" : "text-slate-400")} />
                {label}
                {active && <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          {isConnected && address ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50">
                <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
                <span className="text-xs font-mono text-slate-700 truncate">{shortAddress(address)}</span>
                <span className="ml-auto text-xs text-slate-400">Arc</span>
              </div>
              <a
                href={ARCSCAN_ADDR(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View on Arcscan
              </a>
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Disconnect
              </button>
            </div>
          ) : (
            <Button
              className="w-full"
              size="sm"
              onClick={login}
              disabled={!ready}
            >
              <Wallet className="w-4 h-4" /> Connect Wallet
            </Button>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 h-14 flex items-center px-4 justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <span className="font-bold text-lg text-slate-900">Reapoor</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-600">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white pt-14">
          <nav className="p-4 space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className={cn("w-5 h-5", active ? "text-blue-600" : "text-slate-400")} />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 pt-4 border-t border-slate-100">
            {isConnected && address ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 text-sm">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                  <span className="font-mono text-slate-700">{shortAddress(address)}</span>
                </div>
                <button onClick={handleDisconnect} className="w-full px-4 py-3 text-sm text-red-500 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Disconnect
                </button>
              </div>
            ) : (
              <Button className="w-full" onClick={login} disabled={!ready}>
                <Wallet className="w-4 h-4" /> Connect Wallet
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

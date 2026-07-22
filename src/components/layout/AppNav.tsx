"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { cn, shortAddress } from "@/lib/utils";
import { LayoutDashboard, Layers, Droplets, Gift, BookOpen, Wallet, LogOut, Menu, X, ExternalLink, Copy, Check } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { ARCSCAN_ADDR } from "@/lib/config";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/stake", label: "Stake", icon: Layers },
  { href: "/app/liquidity", label: "Liquidity", icon: Droplets },
  { href: "/app/rewards", label: "Rewards", icon: Gift },
  { href: "/app/docs", label: "Documentation", icon: BookOpen },
];

async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();

  const copied = document.execCommand("copy");
  textArea.remove();

  if (!copied) {
    throw new Error("Unable to copy wallet address");
  }
}

function CopyAddressButton({ address }: { address: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);

    try {
      await copyText(address);
      setStatus("copied");
    } catch {
      setStatus("error");
    }

    resetTimer.current = setTimeout(() => setStatus("idle"), 2_000);
  }, [address]);

  const label =
    status === "copied"
      ? "Wallet address copied"
      : status === "error"
        ? "Copy failed"
        : "Copy wallet address";

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      className={cn(
        "group relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-95",
        status === "copied"
          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
          : status === "error"
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-slate-200 bg-white text-slate-400 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
      )}
    >
      {status === "copied" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      <span
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-medium text-white shadow-lg transition-all duration-150",
          status === "copied"
            ? "visible translate-y-0 bg-emerald-600 opacity-100"
            : status === "error"
              ? "visible translate-y-0 bg-red-600 opacity-100"
              : "invisible translate-y-1 bg-slate-900 opacity-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:visible group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        )}
      >
        {status === "copied" ? "Copied" : status === "error" ? "Try again" : "Copy address"}
      </span>
    </button>
  );
}

export function AppNav() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { login, logout, ready } = usePrivy();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = useCallback(async () => {
    setMobileOpen(false);
    setDisconnecting(true);
    try {
      await disconnectAsync();
    } catch {
      // Some connectors do not expose a disconnect flow.
    }

    try {
      await logout();
    } finally {
      setDisconnecting(false);
    }
  }, [disconnectAsync, logout]);

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-slate-100 min-h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100">
          <Link href="/" className="flex items-center">
            <Image src="/reapoor-logo.png" alt="Reapoor" width={1080} height={852} className="h-9 w-auto" priority />
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
                <CopyAddressButton address={address} />
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
                disabled={disconnecting}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" /> {disconnecting ? "Disconnecting..." : "Disconnect"}
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
        <Link href="/" className="flex items-center">
          <Image src="/reapoor-logo.png" alt="Reapoor" width={1080} height={852} className="h-8 w-auto" priority />
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
                  <CopyAddressButton address={address} />
                </div>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="w-full px-4 py-3 text-sm text-red-500 flex items-center gap-2 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" /> {disconnecting ? "Disconnecting..." : "Disconnect"}
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

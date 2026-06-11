"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { USDCIcon, EURCIcon } from "@/components/ui/TokenIcon";
import { ArrowRight, TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CIRCLE_FAUCET_URL } from "@/lib/config";
import { useProtocolMetrics } from "@/hooks/useProtocolMetrics";

function formatUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000)     return `$${(value / 1_000).toFixed(1)}K`;
  if (value > 0)          return `$${value.toFixed(2)}`;
  return "$0";
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return value.toLocaleString("en-US");
  return value.toString();
}

function AnimatedNumber({ value, formatter }: { value: number; formatter: (n: number) => string }) {
  const [display, setDisplay] = useState(formatter(0));
  const prevRef = useRef(0);
  const frameRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  useEffect(() => {
    if (value === 0 && prevRef.current === 0) return;
    const start = prevRef.current;
    const end = value;
    const duration = 1200;
    const startTime = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = start + (end - start) * eased;
      setDisplay(formatter(current));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = end;
      }
    }

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current !== null) cancelAnimationFrame(frameRef.current); };
  }, [value, formatter]);

  return <span>{display}</span>;
}

export function Hero() {
  const { metrics, loading } = useProtocolMetrics();

  const stats = [
    {
      label: "Total Value Locked",
      value: metrics.tvl,
      formatter: formatUSD,
      icon: DollarSign,
    },
    {
      label: "Total Deposits",
      value: metrics.totalDeposits,
      formatter: formatUSD,
      icon: TrendingUp,
    },
    {
      label: "Rewards Distributed",
      value: metrics.rewardsDistributed,
      formatter: formatUSD,
      icon: Activity,
    },
    {
      label: "Active Users",
      value: metrics.activeUsers,
      formatter: formatCount,
      icon: Users,
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-24 w-full">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium tracking-wider uppercase mb-8">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Live on Arc Testnet
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-none mb-6">
            STAKE.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              SUPPLY.
            </span>{" "}
            EARN.
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
            Earn stablecoin yield by staking and providing liquidity with USDC and EURC on Arc Testnet. Institutional-grade DeFi, built for the next generation of onchain commerce.
          </p>

          {/* Asset pills */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white text-sm font-medium">
              <USDCIcon size="sm" /> USDC
            </div>
            <div className="w-4 h-px bg-slate-600" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white text-sm font-medium">
              <EURCIcon size="sm" /> EURC
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/app/dashboard">
              <Button size="lg" className="min-w-[160px]">
                Launch App <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href={CIRCLE_FAUCET_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="min-w-[160px] border-white/30 text-white hover:bg-white hover:text-blue-900">
                Claim Testnet Assets
              </Button>
            </a>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, formatter, icon: Icon }) => (
            <div
              key={label}
              className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 text-center group hover:border-blue-500/40 hover:bg-white/8 transition-all"
            >
              <Icon className="w-5 h-5 text-blue-400 mx-auto mb-2 opacity-70" />
              <div className="text-2xl font-bold text-white mb-1">
                {loading ? (
                  <span className="inline-block w-16 h-6 bg-white/10 rounded animate-pulse" />
                ) : (
                  <AnimatedNumber value={value} formatter={formatter} />
                )}
              </div>
              <div className="text-xs text-slate-400 tracking-wide">{label}</div>
            </div>
          ))}
        </div>

        {/* Live indicator */}
        {!loading && metrics.updatedAt > 0 && (
          <p className="text-center text-xs text-slate-600 mt-4">
            On-chain data · refreshes every 60s
          </p>
        )}
      </div>
    </section>
  );
}

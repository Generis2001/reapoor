import { USDCIcon, EURCIcon } from "@/components/ui/TokenIcon";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { CIRCLE_FAUCET_URL } from "@/lib/config";

const steps = [
  { num: "1", text: "Visit Circle Faucet", sub: "faucet.circle.com" },
  { num: "2", text: "Connect your wallet", sub: "MetaMask or WalletConnect" },
  { num: "3", text: "Select Arc Testnet", sub: "Choose the Arc network" },
  { num: "4", text: "Claim USDC & EURC", sub: "Free testnet tokens" },
];

export function GetTestnetAssets() {
  return (
    <section id="get-assets" className="py-28 bg-gradient-to-b from-slate-950 to-blue-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-1/2 left-1/2 -translate-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
          Get Started
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Get Testnet Assets
        </h2>
        <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto">
          Before you can stake or provide liquidity, you&apos;ll need Arc Testnet USDC and EURC. Claim them for free from the Circle Faucet in under a minute.
        </p>

        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-white font-semibold">
            <USDCIcon size="md" /> USDC
          </div>
          <span className="text-slate-500">+</span>
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-white font-semibold">
            <EURCIcon size="md" /> EURC
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {steps.map(({ num, text, sub }, i) => (
            <div key={num} className="relative p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-3">
                {num}
              </div>
              <div className="text-white text-sm font-semibold mb-1">{text}</div>
              <div className="text-slate-500 text-xs">{sub}</div>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 z-10" />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href={CIRCLE_FAUCET_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="min-w-[220px] gap-2">
              <USDCIcon size="sm" />
              <EURCIcon size="sm" />
              Claim Testnet USDC &amp; EURC
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
          <Link href="/app/dashboard">
            <Button size="lg" variant="outline" className="min-w-[160px] border-white/20 text-white hover:bg-white hover:text-blue-900">
              Launch App <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

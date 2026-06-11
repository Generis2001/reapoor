import { ArrowDown, Wallet, TrendingUp, Gift } from "lucide-react";
import { USDCIcon, EURCIcon } from "@/components/ui/TokenIcon";

const steps = [
  {
    number: "01",
    icon: Wallet,
    title: "Deposit",
    description: "Connect your wallet and deposit USDC, EURC, or both. Choose between staking for fixed APY or providing liquidity to earn pool rewards. No minimums, no lock-ups.",
    detail: "Your tokens are transferred directly to audited smart contracts. You retain full withdrawal rights at all times.",
  },
  {
    number: "02",
    icon: TrendingUp,
    title: "Earn",
    description: "Once deposited, your stablecoins immediately begin generating yield. Staking rewards accumulate block-by-block. Liquidity rewards are distributed proportionally from pool fees.",
    detail: "Rewards compound in real time. Your pending balance grows continuously without any manual intervention.",
  },
  {
    number: "03",
    icon: Gift,
    title: "Claim",
    description: "Claim your earned USDC and EURC rewards at any time with a single transaction. There are no lock-up periods, no waiting queues, and no minimum claim thresholds.",
    detail: "Claimed rewards land directly in your connected wallet. Withdraw your principal alongside rewards whenever you choose.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-6">
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Three steps to earning.
          </h2>
          <p className="text-slate-500 text-lg">
            Reapoor is designed to be as frictionless as a savings account while delivering DeFi-grade yields.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {steps.map(({ number, icon: Icon, title, description, detail }, i) => (
            <div key={title}>
              <div className="flex gap-6 p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-blue-400 tracking-widest">STEP {number}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-3">{description}</p>
                  <p className="text-sm text-slate-400 leading-relaxed border-t border-slate-50 pt-3">{detail}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown className="w-5 h-5 text-blue-200" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reward flow diagram */}
        <div className="mt-20 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 md:p-12 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="relative">
            <h3 className="text-2xl font-bold mb-8 text-center">Reward Flow</h3>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { label: "Stake USDC", earn: "→ Earn USDC", icon: <USDCIcon size="md" className="mx-auto mb-2" /> },
                { label: "Stake EURC", earn: "→ Earn EURC", icon: <EURCIcon size="md" className="mx-auto mb-2" /> },
                {
                  label: "Stake Both / Provide Liquidity",
                  earn: "→ Earn USDC + EURC",
                  icon: (
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <USDCIcon size="md" />
                      <EURCIcon size="md" />
                    </div>
                  )
                },
              ].map(({ label, earn, icon }) => (
                <div key={label} className="bg-white/10 rounded-2xl p-6 border border-white/10">
                  {icon}
                  <div className="font-semibold mb-1">{label}</div>
                  <div className="text-blue-200 text-sm font-medium">{earn}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Zap, DollarSign, Code2, Globe, ShieldCheck, TrendingUp } from "lucide-react";

const arcFeatures = [
  {
    icon: Zap,
    title: "Near-Instant Finality",
    description: "Arc's high-throughput consensus delivers transaction finality in under 2 seconds. Staking, claiming rewards, and managing liquidity all feel as fast as a web2 app.",
  },
  {
    icon: DollarSign,
    title: "Micro-Transaction Fees",
    description: "With gas fees measured in fractions of a cent, Reapoor makes yield strategies viable at any deposit size. No minimum thresholds, no gas barriers.",
  },
  {
    icon: Globe,
    title: "Stablecoin-Native Ecosystem",
    description: "Arc was designed from the ground up for stablecoin commerce. USDC and EURC are first-class citizens with native Circle integration and deep liquidity.",
  },
  {
    icon: Code2,
    title: "EVM-Compatible Infrastructure",
    description: "Full compatibility with Ethereum tooling means no compromises on developer experience. Hardhat, Foundry, Viem, Wagmi — all work out of the box on Arc.",
  },
  {
    icon: ShieldCheck,
    title: "Permissionless & Open",
    description: "Arc's open architecture means any developer can deploy protocols, any user can participate, and no gatekeepers control access to financial primitives.",
  },
  {
    icon: TrendingUp,
    title: "Next-Gen Onchain Commerce",
    description: "Arc is purpose-built for the future of payments and commerce. Reapoor is positioned at the yield layer of this emerging stablecoin economy.",
  },
];

export function WhyArc() {
  return (
    <section id="why-arc" className="py-28 bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/15 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
            Why Arc
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Built on the right foundation.
          </h2>
          <p className="text-slate-400 text-lg">
            Arc is the next generation of stablecoin-native infrastructure. Reapoor was designed specifically to leverage what Arc does best.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {arcFeatures.map(({ icon: Icon, title, description }) => (
            <div key={title} className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-blue-500/30 hover:bg-white/8 transition-all group">
              <div className="w-10 h-10 bg-blue-500/20 group-hover:bg-blue-500/30 rounded-xl flex items-center justify-center mb-4 transition-colors">
                <Icon className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">{title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-white/10 bg-white/5 p-8 md:p-12 text-center">
          <div className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
            &lt; 2s settlement.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              $0.001 fees.
            </span>
          </div>
          <p className="text-slate-400 max-w-xl mx-auto">
            Arc&apos;s performance profile makes Reapoor the most capital-efficient stablecoin yield protocol in the ecosystem.
          </p>
        </div>
      </div>
    </section>
  );
}

import { Shield, Zap, TrendingUp, Globe, Lock, BarChart3 } from "lucide-react";
import { USDCIcon, EURCIcon } from "@/components/ui/TokenIcon";

const features = [
  {
    icon: TrendingUp,
    title: "Stablecoin Yield",
    description: "Earn real yield denominated in the same stablecoins you deposit. No volatile reward tokens, no impermanent loss exposure — just pure, predictable stablecoin returns.",
  },
  {
    icon: Shield,
    title: "Non-Custodial by Design",
    description: "Your assets are controlled entirely by auditable smart contracts. Reapoor never holds your funds — only the protocol contracts do, governed by transparent on-chain logic.",
  },
  {
    icon: Zap,
    title: "Arc-Native Performance",
    description: "Built specifically for Arc's high-throughput, low-latency infrastructure. Transactions settle in seconds with near-zero fees, making micro-yield strategies viable.",
  },
  {
    icon: Globe,
    title: "Dual Currency Engine",
    description: "USDC and EURC form a natural pairing — Dollar and Euro exposure in a single protocol. Diversify your stablecoin holdings while earning yield on both.",
  },
  {
    icon: Lock,
    title: "Security-First Architecture",
    description: "Every contract implements reentrancy guards, role-based access control, pausable emergency mechanisms, and upgradeable proxy patterns reviewed for production safety.",
  },
  {
    icon: BarChart3,
    title: "Transparent Accounting",
    description: "All reward calculations, pool shares, and APYs are computed on-chain. Every number you see in the UI has a corresponding verifiable on-chain state.",
  },
];

export function About() {
  return (
    <section id="about" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-6">
            About Reapoor
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Stablecoin yield,{" "}
            <span className="text-blue-600">reimagined for Arc.</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Reapoor is a stablecoin yield protocol built exclusively for the Arc ecosystem. It enables anyone to deposit USDC or EURC and immediately begin earning yield through two mechanisms: staking and liquidity provision. Both pathways are designed to reward long-term participation while maintaining capital efficiency and full on-chain transparency.
          </p>
        </div>

        {/* Main about content */}
        <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">Why stablecoin yield matters</h3>
            <p className="text-slate-600 leading-relaxed">
              Most DeFi yield protocols reward depositors with volatile governance tokens that depreciate against the dollar. Reapoor takes a different approach: rewards are paid in the same stablecoins you deposit. When you stake USDC, you earn USDC. When you stake EURC, you earn EURC. This creates a genuinely compounding, inflation-hedged return without introducing speculative risk.
            </p>
            <p className="text-slate-600 leading-relaxed">
              As both the Dollar and Euro face continued monetary expansion, holding stablecoins idle represents a real opportunity cost. Reapoor eliminates that cost by putting your stablecoins to work in a secure, auditable, and non-custodial protocol.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <USDCIcon size="lg" className="mb-4" />
              <div className="text-3xl font-bold mb-1">8.0%</div>
              <div className="text-blue-200 text-sm">USDC Staking APY</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white">
              <EURCIcon size="lg" className="mb-4" />
              <div className="text-3xl font-bold mb-1">7.5%</div>
              <div className="text-sky-200 text-sm">EURC Staking APY</div>
            </div>
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="text-3xl font-bold text-blue-700 mb-1">9.0%</div>
              <div className="text-blue-600 text-sm font-medium">USDC LP APY</div>
            </div>
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="text-3xl font-bold text-blue-700 mb-1">8.5%</div>
              <div className="text-blue-600 text-sm font-medium">EURC LP APY</div>
            </div>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="p-6 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-md hover:shadow-blue-50 transition-all group">
              <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">{title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { USDCIcon, EURCIcon } from "@/components/ui/TokenIcon";
import { CheckCircle } from "lucide-react";
import type { ProtocolMetrics } from "@/lib/metrics";

const usdcPoints = [
  "Issued and backed 1:1 by Circle Internet Financial",
  "Regulated, fully reserved, and redeemable at par",
  "The world's most widely used programmable dollar",
  "Available on Arc Testnet for yield-earning via Reapoor",
  "Reward denominator for USDC staking and LP positions",
];

const eurcPoints = [
  "Euro-denominated stablecoin issued by Circle",
  "1:1 backed by Euro-denominated assets held in regulated accounts",
  "Brings European currency exposure to the Arc ecosystem",
  "Enables natural Euro-denominated yield strategies",
  "Reward denominator for EURC staking and LP positions",
];

interface Props {
  metrics: Pick<ProtocolMetrics, "usdcStakingApy" | "eurcStakingApy" | "usdcLpApy" | "eurcLpApy">;
}

function fmtApy(n: number) {
  return `${n.toFixed(1)}%`;
}

export function Assets({ metrics }: Props) {
  return (
    <section id="assets" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-6">
            Supported Assets
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            The world&apos;s most trusted stablecoins.
          </h2>
          <p className="text-slate-500 text-lg">
            Reapoor is built exclusively around Circle&apos;s regulated stablecoins — USDC and EURC — offering Dollar and Euro exposure in a single protocol.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* USDC Card */}
          <div className="rounded-3xl border border-blue-100 overflow-hidden group hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 p-8 text-white relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full" />
              <div className="relative flex items-center gap-4 mb-6">
                <USDCIcon size="xl" />
                <div>
                  <div className="text-2xl font-bold">USD Coin</div>
                  <div className="text-blue-200 text-sm font-medium tracking-wider">USDC</div>
                </div>
              </div>
              <div className="relative grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-xl font-bold">{fmtApy(metrics.usdcStakingApy)}</div>
                  <div className="text-blue-200 text-xs">Staking APY</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-xl font-bold">{fmtApy(metrics.usdcLpApy)}</div>
                  <div className="text-blue-200 text-xs">LP APY</div>
                </div>
              </div>
            </div>
            <div className="p-8 bg-white">
              <p className="text-slate-600 leading-relaxed mb-6">
                USD Coin (USDC) is a fully regulated, US Dollar-denominated stablecoin issued by Circle. It is the gold standard for institutional DeFi participation — fully reserved, redeemable at par, and backed by short-duration US Treasuries and cash equivalents.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6">
                On Reapoor, USDC depositors earn USDC rewards. Whether staking directly or participating as a liquidity provider, your yield is paid in the same dollar-pegged asset you deposit.
              </p>
              <ul className="space-y-2">
                {usdcPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* EURC Card */}
          <div className="rounded-3xl border border-sky-100 overflow-hidden group hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-300">
            <div className="bg-gradient-to-br from-sky-500 via-blue-500 to-blue-600 p-8 text-white relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full" />
              <div className="relative flex items-center gap-4 mb-6">
                <EURCIcon size="xl" />
                <div>
                  <div className="text-2xl font-bold">Euro Coin</div>
                  <div className="text-sky-200 text-sm font-medium tracking-wider">EURC</div>
                </div>
              </div>
              <div className="relative grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-xl font-bold">{fmtApy(metrics.eurcStakingApy)}</div>
                  <div className="text-sky-200 text-xs">Staking APY</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-xl font-bold">{fmtApy(metrics.eurcLpApy)}</div>
                  <div className="text-sky-200 text-xs">LP APY</div>
                </div>
              </div>
            </div>
            <div className="p-8 bg-white">
              <p className="text-slate-600 leading-relaxed mb-6">
                Euro Coin (EURC) is Circle&apos;s Euro-denominated stablecoin — the first institutional-grade, fully regulated Euro stablecoin available on-chain. Each EURC is backed 1:1 by Euro-denominated bank deposits held in regulated financial institutions.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6">
                For European users and institutions, EURC enables natural Euro-denominated yield without USD conversion risk. On Reapoor, EURC depositors earn EURC rewards, maintaining complete currency coherence.
              </p>
              <ul className="space-y-2">
                {eurcPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

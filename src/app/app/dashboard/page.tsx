"use client";

import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { StatCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { USDCIcon, EURCIcon } from "@/components/ui/TokenIcon";
import { useStakingPosition } from "@/hooks/useStaking";
import { useLiquidityPosition } from "@/hooks/useLiquidity";
import { useWalletBalances } from "@/hooks/useWalletBalances";
import { formatToken, formatApy } from "@/lib/utils";
import { Wallet, TrendingUp, Layers, Droplets, Gift } from "lucide-react";
import Link from "next/link";

function ConnectPrompt() {
  const { login, ready } = usePrivy();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
        <Wallet className="w-8 h-8 text-blue-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect your wallet</h2>
        <p className="text-slate-500 max-w-sm">Connect a wallet to view your Reapoor dashboard and start earning stablecoin yield.</p>
      </div>
      <Button size="lg" onClick={login} disabled={!ready}>
        <Wallet className="w-4 h-4" /> Connect Wallet
      </Button>
    </div>
  );
}

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const { usdcStaked, eurcStaked, pendingUsdc: stakePendingUsdc, pendingEurc: stakePendingEurc, totalUsdcStaked, totalEurcStaked, usdcApy, eurcApy, lifetimeUsdc: stakeLifetimeUsdc, lifetimeEurc: stakeLifetimeEurc } = useStakingPosition();
  const { usdcDeposit, eurcDeposit, pendingUsdc: liqPendingUsdc, pendingEurc: liqPendingEurc, totalUsdcDeposited, totalEurcDeposited } = useLiquidityPosition();
  const { usdcBalance, eurcBalance } = useWalletBalances();

  const totalPendingUsdc = stakePendingUsdc + liqPendingUsdc;
  const totalPendingEurc = stakePendingEurc + liqPendingEurc;
  const tvl = totalUsdcStaked + totalEurcStaked + totalUsdcDeposited + totalEurcDeposited;

  if (!isConnected) return <ConnectPrompt />;

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-slate-500 text-sm">Your Reapoor portfolio overview on Arc Testnet.</p>
      </div>

      {/* Wallet balances */}
      <div className="mb-8 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Wallet Balances</h2>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <USDCIcon size="md" />
            <div>
              <div className="text-lg font-bold text-slate-900">{formatToken(usdcBalance)} USDC</div>
              <div className="text-xs text-slate-400">Available to deposit</div>
            </div>
          </div>
          <div className="w-px bg-slate-100" />
          <div className="flex items-center gap-3">
            <EURCIcon size="md" />
            <div>
              <div className="text-lg font-bold text-slate-900">{formatToken(eurcBalance)} EURC</div>
              <div className="text-xs text-slate-400">Available to deposit</div>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol TVL */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Protocol TVL"
          value={`$${formatToken(tvl)}`}
          icon={<TrendingUp className="w-4 h-4" />}
          accent
        />
        <StatCard
          label="USDC Staking APY"
          value={formatApy(usdcApy)}
          sub="Staking"
          icon={<USDCIcon size="sm" />}
        />
        <StatCard
          label="EURC Staking APY"
          value={formatApy(eurcApy)}
          sub="Staking"
          icon={<EURCIcon size="sm" />}
        />
        <StatCard
          label="Pending Rewards"
          value={`$${formatToken(totalPendingUsdc + totalPendingEurc)}`}
          sub="USDC + EURC"
          icon={<Gift className="w-4 h-4" />}
        />
      </div>

      {/* My positions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Staking */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-slate-900">My Stakes</h3>
            </div>
            <Link href="/app/stake">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                Manage →
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2">
                <USDCIcon size="sm" />
                <span className="text-sm font-medium text-slate-700">USDC Staked</span>
              </div>
              <span className="font-bold text-slate-900">{formatToken(usdcStaked)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2">
                <EURCIcon size="sm" />
                <span className="text-sm font-medium text-slate-700">EURC Staked</span>
              </div>
              <span className="font-bold text-slate-900">{formatToken(eurcStaked)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Pending USDC</div>
                <div className="font-semibold text-slate-800 text-sm">{formatToken(stakePendingUsdc)} USDC</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Pending EURC</div>
                <div className="font-semibold text-slate-800 text-sm">{formatToken(stakePendingEurc)} EURC</div>
              </div>
            </div>
          </div>
        </div>

        {/* Liquidity */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-slate-900">My Liquidity</h3>
            </div>
            <Link href="/app/liquidity">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                Manage →
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2">
                <USDCIcon size="sm" />
                <span className="text-sm font-medium text-slate-700">USDC Supplied</span>
              </div>
              <span className="font-bold text-slate-900">{formatToken(usdcDeposit)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2">
                <EURCIcon size="sm" />
                <span className="text-sm font-medium text-slate-700">EURC Supplied</span>
              </div>
              <span className="font-bold text-slate-900">{formatToken(eurcDeposit)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Pending USDC</div>
                <div className="font-semibold text-slate-800 text-sm">{formatToken(liqPendingUsdc)} USDC</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Pending EURC</div>
                <div className="font-semibold text-slate-800 text-sm">{formatToken(liqPendingEurc)} EURC</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lifetime earnings */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <h3 className="font-semibold mb-4 text-blue-100 text-sm uppercase tracking-wider">Lifetime Earnings</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <USDCIcon size="lg" />
            <div>
              <div className="text-2xl font-bold">{formatToken(stakeLifetimeUsdc)} USDC</div>
              <div className="text-blue-200 text-xs mt-0.5">Total USDC earned</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <EURCIcon size="lg" />
            <div>
              <div className="text-2xl font-bold">{formatToken(stakeLifetimeEurc)} EURC</div>
              <div className="text-blue-200 text-xs mt-0.5">Total EURC earned</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

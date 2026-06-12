"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { USDCIcon, EURCIcon } from "@/components/ui/TokenIcon";
import { useStakingPosition, useStakeActions } from "@/hooks/useStaking";
import { useLiquidityPosition, useLiquidityActions } from "@/hooks/useLiquidity";
import { useToast } from "@/components/ui/Toast";
import { formatToken } from "@/lib/utils";
import { Gift, Wallet, TrendingUp, Clock } from "lucide-react";
import { parseTxError } from "@/lib/txUtils";

type ClaimOp = "stake" | "liq" | "all" | null;

function RewardsPanel() {
  const [claiming, setClaiming] = useState<ClaimOp>(null);

  const { pendingUsdc: stakePendingUsdc, pendingEurc: stakePendingEurc, lifetimeUsdc: stakeLifetimeUsdc, lifetimeEurc: stakeLifetimeEurc, refetch: refetchStake } = useStakingPosition();
  const { pendingUsdc: liqPendingUsdc, pendingEurc: liqPendingEurc, lifetimeUsdc: liqLifetimeUsdc, lifetimeEurc: liqLifetimeEurc, refetch: refetchLiq } = useLiquidityPosition();
  const { claimRewards: claimStake } = useStakeActions();
  const { claimRewards: claimLiq } = useLiquidityActions();
  const { toast } = useToast();

  const totalPendingUsdc = stakePendingUsdc + liqPendingUsdc;
  const totalPendingEurc = stakePendingEurc + liqPendingEurc;
  const totalLifetimeUsdc = stakeLifetimeUsdc + liqLifetimeUsdc;
  const totalLifetimeEurc = stakeLifetimeEurc + liqLifetimeEurc;
  const hasRewards = totalPendingUsdc > BigInt(0) || totalPendingEurc > BigInt(0);
  const isLoading = claiming !== null;

  const handleClaimAll = async () => {
    setClaiming("all");
    try {
      if (stakePendingUsdc > BigInt(0) || stakePendingEurc > BigInt(0)) {
        const h = await claimStake();
        toast({ type: "success", title: "Staking rewards claimed!", txHash: h });
      }
      if (liqPendingUsdc > BigInt(0) || liqPendingEurc > BigInt(0)) {
        const h = await claimLiq();
        toast({ type: "success", title: "Liquidity rewards claimed!", txHash: h });
      }
      refetchStake(); refetchLiq();
    } catch (err) {
      toast({ type: "error", title: "Claim failed", description: parseTxError(err) });
    } finally {
      setClaiming(null);
    }
  };

  const handleClaimStaking = async () => {
    if (stakePendingUsdc === BigInt(0) && stakePendingEurc === BigInt(0)) return;
    setClaiming("stake");
    try {
      const h = await claimStake();
      toast({ type: "success", title: "Staking rewards claimed!", txHash: h });
      refetchStake();
    } catch (err) {
      toast({ type: "error", title: "Claim failed", description: parseTxError(err) });
    } finally {
      setClaiming(null);
    }
  };

  const handleClaimLiquidity = async () => {
    if (liqPendingUsdc === BigInt(0) && liqPendingEurc === BigInt(0)) return;
    setClaiming("liq");
    try {
      const h = await claimLiq();
      toast({ type: "success", title: "Liquidity rewards claimed!", txHash: h });
      refetchLiq();
    } catch (err) {
      toast({ type: "error", title: "Claim failed", description: parseTxError(err) });
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Claimable rewards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <USDCIcon size="md" />
              <div className="text-xs text-blue-200 font-medium uppercase tracking-wider">Claimable USDC</div>
            </div>
            <div className="text-4xl font-black mb-1">{formatToken(totalPendingUsdc)}</div>
            <div className="text-blue-200 text-sm mb-1">USDC</div>
            <div className="text-xs text-blue-300 mt-2">
              Staking: {formatToken(stakePendingUsdc)} · Liquidity: {formatToken(liqPendingUsdc)}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <EURCIcon size="md" />
              <div className="text-xs text-sky-200 font-medium uppercase tracking-wider">Claimable EURC</div>
            </div>
            <div className="text-4xl font-black mb-1">{formatToken(totalPendingEurc)}</div>
            <div className="text-sky-200 text-sm mb-1">EURC</div>
            <div className="text-xs text-sky-300 mt-2">
              Staking: {formatToken(stakePendingEurc)} · Liquidity: {formatToken(liqPendingEurc)}
            </div>
          </div>
        </div>
      </div>

      {/* Claim actions */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Claim Rewards</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={handleClaimStaking}
            loading={claiming === "stake"}
            disabled={isLoading || (stakePendingUsdc === BigInt(0) && stakePendingEurc === BigInt(0))}
          >
            From Staking
          </Button>
          <Button
            variant="secondary"
            onClick={handleClaimLiquidity}
            loading={claiming === "liq"}
            disabled={isLoading || (liqPendingUsdc === BigInt(0) && liqPendingEurc === BigInt(0))}
          >
            From Liquidity
          </Button>
          <Button
            onClick={handleClaimAll}
            loading={claiming === "all"}
            disabled={isLoading || !hasRewards}
          >
            <Gift className="w-4 h-4" /> Claim All
          </Button>
        </div>
        {!hasRewards && (
          <p className="text-sm text-slate-400 mt-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> No pending rewards yet. Stake or supply liquidity to start earning.
          </p>
        )}
      </Card>

      {/* Lifetime earnings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">Lifetime Earnings</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Total USDC Earned</div>
            <div className="flex items-center gap-3 mb-3">
              <USDCIcon size="lg" />
              <div className="text-3xl font-bold text-slate-900">{formatToken(totalLifetimeUsdc)}</div>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>From staking</span>
                <span className="font-medium text-slate-700">{formatToken(stakeLifetimeUsdc)} USDC</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>From liquidity</span>
                <span className="font-medium text-slate-700">{formatToken(liqLifetimeUsdc)} USDC</span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Total EURC Earned</div>
            <div className="flex items-center gap-3 mb-3">
              <EURCIcon size="lg" />
              <div className="text-3xl font-bold text-slate-900">{formatToken(totalLifetimeEurc)}</div>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>From staking</span>
                <span className="font-medium text-slate-700">{formatToken(stakeLifetimeEurc)} EURC</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>From liquidity</span>
                <span className="font-medium text-slate-700">{formatToken(liqLifetimeEurc)} EURC</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function RewardsPage() {
  const { isConnected } = useAccount();
  const { login, ready } = usePrivy();

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Rewards</h1>
        <p className="text-slate-500 text-sm">View and claim your USDC and EURC rewards from staking and liquidity provision.</p>
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Gift className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Connect wallet to view rewards</h2>
            <p className="text-slate-500 text-sm">Connect a wallet to see and claim your earned rewards.</p>
          </div>
          <Button onClick={login} disabled={!ready}>
            <Wallet className="w-4 h-4" /> Connect Wallet
          </Button>
        </div>
      ) : (
        <RewardsPanel />
      )}
    </div>
  );
}

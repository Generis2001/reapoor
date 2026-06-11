"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { USDCIcon, EURCIcon } from "@/components/ui/TokenIcon";
import { useStakingPosition, useStakeActions } from "@/hooks/useStaking";
import { useWalletBalances } from "@/hooks/useWalletBalances";
import { useToast } from "@/components/ui/Toast";
import { formatToken, formatApy } from "@/lib/utils";
import { parseUnits } from "viem";
import { Wallet, TrendingUp } from "lucide-react";
import { ARCSCAN_TX } from "@/lib/config";

type StakeMode = "usdc" | "eurc" | "both";
type Tab = "stake" | "unstake";

function StakePanel() {
  const [mode, setMode] = useState<StakeMode>("both");
  const [tab, setTab] = useState<Tab>("stake");
  const [usdcInput, setUsdcInput] = useState("");
  const [eurcInput, setEurcInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { usdcStaked, eurcStaked, pendingUsdc, pendingEurc, usdcApy, eurcApy, lifetimeUsdc, lifetimeEurc, refetch } = useStakingPosition();
  const { usdcBalance, eurcBalance, refetch: refetchBalances } = useWalletBalances();
  const { approveUsdc, approveEurc, stake, unstake, claimRewards } = useStakeActions();
  const { toast } = useToast();

  const handleStake = async () => {
    setLoading(true);
    try {
      if (usdcInput && (mode === "usdc" || mode === "both")) {
        toast({ type: "pending", title: "Approving USDC..." });
        const approveTx = await approveUsdc(parseUnits(usdcInput, 6));
        toast({ type: "success", title: "USDC Approved", txHash: approveTx });
      }
      if (eurcInput && (mode === "eurc" || mode === "both")) {
        toast({ type: "pending", title: "Approving EURC..." });
        const approveTx = await approveEurc(parseUnits(eurcInput, 6));
        toast({ type: "success", title: "EURC Approved", txHash: approveTx });
      }
      toast({ type: "pending", title: "Staking..." });
      const u = mode === "eurc" ? "0" : (usdcInput || "0");
      const e = mode === "usdc" ? "0" : (eurcInput || "0");
      const hash = await stake(u, e);
      toast({ type: "success", title: "Staked successfully!", txHash: hash });
      setUsdcInput(""); setEurcInput("");
      refetch(); refetchBalances();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      toast({ type: "error", title: "Stake failed", description: msg.slice(0, 80) });
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    setLoading(true);
    try {
      toast({ type: "pending", title: "Unstaking..." });
      const u = mode === "eurc" ? "0" : (usdcInput || "0");
      const e = mode === "usdc" ? "0" : (eurcInput || "0");
      const hash = await unstake(u, e);
      toast({ type: "success", title: "Unstaked successfully!", txHash: hash });
      setUsdcInput(""); setEurcInput("");
      refetch(); refetchBalances();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      toast({ type: "error", title: "Unstake failed", description: msg.slice(0, 80) });
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    setLoading(true);
    try {
      toast({ type: "pending", title: "Claiming rewards..." });
      const hash = await claimRewards();
      toast({ type: "success", title: "Rewards claimed!", description: `${formatToken(pendingUsdc)} USDC + ${formatToken(pendingEurc)} EURC`, txHash: hash });
      refetch(); refetchBalances();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      toast({ type: "error", title: "Claim failed", description: msg.slice(0, 80) });
    } finally {
      setLoading(false);
    }
  };

  const showUsdc = mode === "usdc" || mode === "both";
  const showEurc = mode === "eurc" || mode === "both";

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left: Action panel */}
      <div className="lg:col-span-2 space-y-4">
        {/* Mode selector */}
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Select Asset</h3>
          <div className="flex gap-2">
            {(["usdc", "eurc", "both"] as StakeMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  mode === m ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25" : "bg-white text-slate-600 border-slate-200 hover:border-blue-200"
                }`}
              >
                {m === "usdc" && <><USDCIcon size="sm" /> USDC Only</>}
                {m === "eurc" && <><EURCIcon size="sm" /> EURC Only</>}
                {m === "both" && <><USDCIcon size="sm" /><EURCIcon size="sm" /> Both</>}
              </button>
            ))}
          </div>
        </Card>

        {/* Stake / Unstake tabs */}
        <Card className="p-5">
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5 w-fit">
            {(["stake", "unstake"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {showUsdc && (
              <Input
                label="USDC Amount"
                type="number"
                placeholder="0.00"
                value={usdcInput}
                onChange={(e) => setUsdcInput(e.target.value)}
                prefix={<USDCIcon size="sm" />}
                suffix={
                  <button
                    onClick={() => setUsdcInput(tab === "stake" ? formatToken(usdcBalance, 6, 6) : formatToken(usdcStaked, 6, 6))}
                    className="text-xs text-blue-600 font-semibold hover:text-blue-700"
                  >MAX</button>
                }
              />
            )}
            {showEurc && (
              <Input
                label="EURC Amount"
                type="number"
                placeholder="0.00"
                value={eurcInput}
                onChange={(e) => setEurcInput(e.target.value)}
                prefix={<EURCIcon size="sm" />}
                suffix={
                  <button
                    onClick={() => setEurcInput(tab === "stake" ? formatToken(eurcBalance, 6, 6) : formatToken(eurcStaked, 6, 6))}
                    className="text-xs text-blue-600 font-semibold hover:text-blue-700"
                  >MAX</button>
                }
              />
            )}

            <Button
              className="w-full mt-2"
              size="lg"
              onClick={tab === "stake" ? handleStake : handleUnstake}
              loading={loading}
            >
              {tab === "stake" ? "Stake" : "Unstake"}
            </Button>
          </div>
        </Card>
      </div>

      {/* Right: Position info */}
      <div className="space-y-4">
        {/* APYs */}
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Current APY</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <USDCIcon size="sm" /> USDC
              </div>
              <span className="font-bold text-blue-600">{formatApy(usdcApy)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <EURCIcon size="sm" /> EURC
              </div>
              <span className="font-bold text-blue-600">{formatApy(eurcApy)}</span>
            </div>
          </div>
        </Card>

        {/* My position */}
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">My Position</h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-slate-600"><USDCIcon size="xs" /> Staked USDC</div>
              <span className="font-semibold">{formatToken(usdcStaked)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-slate-600"><EURCIcon size="xs" /> Staked EURC</div>
              <span className="font-semibold">{formatToken(eurcStaked)}</span>
            </div>
            <div className="h-px bg-slate-100 my-1" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Pending USDC</span>
              <span className="font-semibold text-blue-600">{formatToken(pendingUsdc)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Pending EURC</span>
              <span className="font-semibold text-blue-600">{formatToken(pendingEurc)}</span>
            </div>
          </div>
          <Button
            className="w-full mt-4"
            variant="secondary"
            size="sm"
            onClick={handleClaim}
            loading={loading}
            disabled={pendingUsdc === BigInt(0) && pendingEurc === BigInt(0)}
          >
            Claim Rewards
          </Button>
        </Card>

        {/* Lifetime */}
        <Card className="p-5 bg-gradient-to-br from-blue-600 to-blue-700 border-0">
          <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-4">Lifetime Earned</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-blue-200"><USDCIcon size="xs" /> USDC</div>
              <span className="font-bold text-white">{formatToken(lifetimeUsdc)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-blue-200"><EURCIcon size="xs" /> EURC</div>
              <span className="font-bold text-white">{formatToken(lifetimeEurc)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function StakePage() {
  const { isConnected } = useAccount();
  const { login, ready } = usePrivy();

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Stake</h1>
        <p className="text-slate-500 text-sm">Stake USDC and EURC to earn stablecoin yield on Arc Testnet.</p>
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Wallet className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Connect wallet to stake</h2>
            <p className="text-slate-500 text-sm">You need a connected wallet to stake and earn rewards.</p>
          </div>
          <Button onClick={login} disabled={!ready}>
            <Wallet className="w-4 h-4" /> Connect Wallet
          </Button>
        </div>
      ) : (
        <StakePanel />
      )}
    </div>
  );
}

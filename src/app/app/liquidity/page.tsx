"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { USDCIcon, EURCIcon } from "@/components/ui/TokenIcon";
import { useLiquidityPosition, useLiquidityActions } from "@/hooks/useLiquidity";
import { useWalletBalances } from "@/hooks/useWalletBalances";
import { useToast } from "@/components/ui/Toast";
import { formatToken, formatApy } from "@/lib/utils";
import { parseUnits } from "viem";
import { Wallet, Droplets } from "lucide-react";

type LiqMode = "usdc" | "eurc" | "both";
type Tab = "add" | "remove";

function LiquidityPanel() {
  const [mode, setMode] = useState<LiqMode>("both");
  const [tab, setTab] = useState<Tab>("add");
  const [usdcInput, setUsdcInput] = useState("");
  const [eurcInput, setEurcInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { usdcShares, eurcShares, usdcDeposit, eurcDeposit, pendingUsdc, pendingEurc, totalUsdcDeposited, totalEurcDeposited, usdcApy, eurcApy, lifetimeUsdc, lifetimeEurc, refetch } = useLiquidityPosition();
  const { usdcBalance, eurcBalance, refetch: refetchBalances } = useWalletBalances();
  const { approveUsdc, approveEurc, addLiquidity, removeLiquidity, claimRewards } = useLiquidityActions();
  const { toast } = useToast();

  const handleAdd = async () => {
    setLoading(true);
    try {
      if (usdcInput && (mode === "usdc" || mode === "both")) {
        toast({ type: "pending", title: "Approving USDC..." });
        const h = await approveUsdc(parseUnits(usdcInput, 6));
        toast({ type: "success", title: "USDC Approved", txHash: h });
      }
      if (eurcInput && (mode === "eurc" || mode === "both")) {
        toast({ type: "pending", title: "Approving EURC..." });
        const h = await approveEurc(parseUnits(eurcInput, 6));
        toast({ type: "success", title: "EURC Approved", txHash: h });
      }
      toast({ type: "pending", title: "Adding liquidity..." });
      const u = mode === "eurc" ? "0" : (usdcInput || "0");
      const e = mode === "usdc" ? "0" : (eurcInput || "0");
      const hash = await addLiquidity(u, e);
      toast({ type: "success", title: "Liquidity added!", txHash: hash });
      setUsdcInput(""); setEurcInput("");
      refetch(); refetchBalances();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      toast({ type: "error", title: "Add liquidity failed", description: msg.slice(0, 80) });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      toast({ type: "pending", title: "Removing liquidity..." });
      const uShares = mode === "eurc" ? BigInt(0) : usdcShares;
      const eShares = mode === "usdc" ? BigInt(0) : eurcShares;
      const hash = await removeLiquidity(uShares, eShares);
      toast({ type: "success", title: "Liquidity removed!", txHash: hash });
      refetch(); refetchBalances();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      toast({ type: "error", title: "Remove failed", description: msg.slice(0, 80) });
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    setLoading(true);
    try {
      toast({ type: "pending", title: "Claiming rewards..." });
      const hash = await claimRewards();
      toast({ type: "success", title: "Rewards claimed!", txHash: hash });
      refetch(); refetchBalances();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      toast({ type: "error", title: "Claim failed", description: msg.slice(0, 80) });
    } finally {
      setLoading(false);
    }
  };

  const poolTotalUsdc = Number(totalUsdcDeposited) / 1e6;
  const poolTotalEurc = Number(totalEurcDeposited) / 1e6;
  const userUsdcDeposit = Number(usdcDeposit) / 1e6;
  const userEurcDeposit = Number(eurcDeposit) / 1e6;
  const usdcShare = poolTotalUsdc > 0 ? ((userUsdcDeposit / poolTotalUsdc) * 100).toFixed(2) : "0.00";
  const eurcShare = poolTotalEurc > 0 ? ((userEurcDeposit / poolTotalEurc) * 100).toFixed(2) : "0.00";

  const showUsdc = mode === "usdc" || mode === "both";
  const showEurc = mode === "eurc" || mode === "both";

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left: action */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Select Asset</h3>
          <div className="flex gap-2 flex-wrap">
            {(["usdc", "eurc", "both"] as LiqMode[]).map((m) => (
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

        <Card className="p-5">
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5 w-fit">
            {(["add", "remove"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {t === "add" ? "Add Liquidity" : "Remove Liquidity"}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {tab === "add" ? (
              <>
                {showUsdc && (
                  <Input
                    label="USDC Amount"
                    type="number"
                    placeholder="0.00"
                    value={usdcInput}
                    onChange={(e) => setUsdcInput(e.target.value)}
                    prefix={<USDCIcon size="sm" />}
                    suffix={
                      <button onClick={() => setUsdcInput(formatToken(usdcBalance, 6, 6))} className="text-xs text-blue-600 font-semibold">MAX</button>
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
                      <button onClick={() => setEurcInput(formatToken(eurcBalance, 6, 6))} className="text-xs text-blue-600 font-semibold">MAX</button>
                    }
                  />
                )}
                <Button className="w-full" size="lg" onClick={handleAdd} loading={loading}>
                  Add Liquidity
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-800">
                  This will remove all your {mode === "both" ? "USDC and EURC" : mode.toUpperCase()} liquidity. Pending rewards will be claimed automatically.
                </div>
                <Button className="w-full" size="lg" variant="danger" onClick={handleRemove} loading={loading}
                  disabled={(mode !== "eurc" && usdcShares === BigInt(0)) && (mode !== "usdc" && eurcShares === BigInt(0))}>
                  Remove Liquidity
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Right: info */}
      <div className="space-y-4">
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Pool Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-600"><USDCIcon size="xs" /> Pool Size</div>
              <span className="font-semibold">{poolTotalUsdc.toFixed(2)} USDC</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-600"><EURCIcon size="xs" /> Pool Size</div>
              <span className="font-semibold">{poolTotalEurc.toFixed(2)} EURC</span>
            </div>
            <div className="h-px bg-slate-100" />
            <div className="flex items-center justify-between">
              <span className="text-slate-500">USDC APY</span>
              <span className="font-bold text-blue-600">{formatApy(usdcApy)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">EURC APY</span>
              <span className="font-bold text-blue-600">{formatApy(eurcApy)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">My Position</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <div className="flex items-center gap-1.5 text-slate-600"><USDCIcon size="xs" /> Supplied</div>
              <span className="font-semibold">{formatToken(usdcDeposit)}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-1.5 text-slate-600"><EURCIcon size="xs" /> Supplied</div>
              <span className="font-semibold">{formatToken(eurcDeposit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">USDC Pool Share</span>
              <span className="font-semibold">{usdcShare}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">EURC Pool Share</span>
              <span className="font-semibold">{eurcShare}%</span>
            </div>
            <div className="h-px bg-slate-100" />
            <div className="flex justify-between">
              <span className="text-slate-500">Pending USDC</span>
              <span className="font-semibold text-blue-600">{formatToken(pendingUsdc)}</span>
            </div>
            <div className="flex justify-between">
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

        <Card className="p-5 bg-gradient-to-br from-blue-600 to-blue-700 border-0">
          <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-4">Lifetime Earned</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <div className="flex items-center gap-1.5 text-blue-200"><USDCIcon size="xs" /> USDC</div>
              <span className="font-bold text-white">{formatToken(lifetimeUsdc)}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-1.5 text-blue-200"><EURCIcon size="xs" /> EURC</div>
              <span className="font-bold text-white">{formatToken(lifetimeEurc)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function LiquidityPage() {
  const { isConnected } = useAccount();
  const { login, ready } = usePrivy();

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Liquidity</h1>
        <p className="text-slate-500 text-sm">Supply USDC and EURC liquidity to earn rewards on Arc Testnet.</p>
      </div>
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Droplets className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Connect wallet to supply liquidity</h2>
            <p className="text-slate-500 text-sm">Connect a wallet to manage your liquidity positions.</p>
          </div>
          <Button onClick={login} disabled={!ready}>
            <Wallet className="w-4 h-4" /> Connect Wallet
          </Button>
        </div>
      ) : (
        <LiquidityPanel />
      )}
    </div>
  );
}

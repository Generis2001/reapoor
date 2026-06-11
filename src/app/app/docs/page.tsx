import Link from "next/link";
import { USDCIcon, EURCIcon } from "@/components/ui/TokenIcon";
import { Card } from "@/components/ui/Card";
import { BookOpen, Code2, Shield, ExternalLink } from "lucide-react";
import { ARCSCAN_URL, CIRCLE_FAUCET_URL } from "@/lib/config";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";

const sections = [
  {
    id: "overview",
    title: "Protocol Overview",
    content: `Reapoor is a stablecoin yield protocol deployed on Arc Testnet. It enables users to earn USDC and EURC rewards through two distinct mechanisms: direct staking and liquidity provision. The protocol is fully non-custodial — all user funds are held in auditable smart contracts with no admin withdrawal capability over user deposits.`,
  },
  {
    id: "staking",
    title: "Staking",
    content: `Staking deposits USDC or EURC into the ReapoorStakingManager contract. Rewards accrue continuously based on the configured APY and are distributed from protocol reward reserves. You can stake USDC only, EURC only, or both simultaneously. Rewards can be claimed at any time without unstaking your principal.`,
  },
  {
    id: "liquidity",
    title: "Liquidity Provision",
    content: `Supplying liquidity deposits tokens into the ReapoorLiquidityManager pool. Your deposit is tracked as proportional pool shares. Rewards are distributed to liquidity providers proportionally to their share. Adding and removing liquidity is permissionless and can be performed at any time.`,
  },
  {
    id: "rewards",
    title: "Reward Distribution",
    content: `The RewardDistributor contract periodically distributes USDC and EURC from the TreasuryVault to the staking and liquidity contracts. Rewards are allocated by weight — 50% to stakers, 50% to liquidity providers by default. All distribution logic is governed by on-chain smart contract rules.`,
  },
  {
    id: "security",
    title: "Security Architecture",
    content: `All Reapoor contracts implement: ReentrancyGuard on all state-mutating functions; AccessControl with distinct ADMIN, DISTRIBUTOR, and UPGRADER roles; Pausable to halt protocol activity in emergencies; emergencyWithdraw allowing users to always recover principal; UUPS upgradeable proxies for patching without fund migration; SafeERC20 for all token transfers.`,
  },
  {
    id: "testnet",
    title: "Testnet Information",
    content: `Reapoor runs exclusively on Arc Testnet (Chain ID: 5042002). All assets are testnet tokens with no real-world value. Obtain free USDC and EURC from the Circle Faucet at faucet.circle.com. View all transactions on Arcscan at testnet.arcscan.app.`,
  },
];

export default function DocsPage() {
  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">Documentation</h1>
        </div>
        <p className="text-slate-500 text-sm">Technical reference for the Reapoor protocol on Arc Testnet.</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {[
          { label: "Circle Faucet", href: CIRCLE_FAUCET_URL, icon: <><USDCIcon size="xs" /><EURCIcon size="xs" /></> },
          { label: "Arcscan Explorer", href: ARCSCAN_URL, icon: <ExternalLink className="w-3 h-3" /> },
          { label: "Arc Testnet RPC", href: "#", icon: <Code2 className="w-3 h-3" /> },
        ].map(({ label, href, icon }) => (
          <a
            key={label}
            href={href}
            target={href !== "#" ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-100 bg-white hover:border-blue-100 hover:bg-blue-50 text-sm font-medium text-slate-700 transition-all"
          >
            <span className="flex items-center gap-1 text-blue-600">{icon}</span>
            {label}
          </a>
        ))}
      </div>

      {/* Network config */}
      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-slate-900">Arc Testnet Configuration</h2>
        </div>
        <div className="space-y-2 font-mono text-sm">
          {[
            ["Network Name", "Arc Testnet"],
            ["Chain ID", "5042002"],
            ["RPC URL", "https://rpc.testnet.arc.network"],
            ["Block Explorer", "https://testnet.arcscan.app"],
            ["Currency Symbol", "USDC"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-start gap-3 py-1.5 border-b border-slate-50 last:border-0">
              <span className="text-slate-400 w-36 shrink-0">{k}</span>
              <span className="text-slate-800 break-all">{v}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Token addresses */}
      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1"><USDCIcon size="sm" /><EURCIcon size="sm" /></div>
          <h2 className="font-semibold text-slate-900">Token Addresses</h2>
        </div>
        <div className="space-y-3 font-mono text-sm">
          <div className="flex items-center gap-3 py-1.5 border-b border-slate-50">
            <div className="flex items-center gap-1.5 w-20 shrink-0"><USDCIcon size="xs" /><span className="text-slate-500">USDC</span></div>
            <a href={`${ARCSCAN_URL}/address/${CONTRACT_ADDRESSES.USDC}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
              {CONTRACT_ADDRESSES.USDC}
            </a>
          </div>
          <div className="flex items-center gap-3 py-1.5">
            <div className="flex items-center gap-1.5 w-20 shrink-0"><EURCIcon size="xs" /><span className="text-slate-500">EURC</span></div>
            <a href={`${ARCSCAN_URL}/address/${CONTRACT_ADDRESSES.EURC}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
              {CONTRACT_ADDRESSES.EURC}
            </a>
          </div>
        </div>
      </Card>

      {/* Protocol sections */}
      <div className="space-y-4">
        {sections.map(({ id, title, content }) => (
          <Card key={id} className="p-5" hover>
            <h2 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block" />
              {title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{content}</p>
          </Card>
        ))}
      </div>

      {/* Security callout */}
      <div className="mt-6 p-5 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
        <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Testnet Only.</strong> All contracts are deployed on Arc Testnet. No real funds should ever be deposited. Smart contracts are not yet formally audited. Use only testnet tokens from the Circle Faucet.
        </div>
      </div>
    </div>
  );
}

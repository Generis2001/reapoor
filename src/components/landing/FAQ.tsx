"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How are rewards calculated?",
    a: "Rewards are distributed proportionally based on your share of the total staked or supplied amount. For staking, the APY is fixed and set by protocol governance. For liquidity provision, rewards come from the protocol's reward distribution contract, allocated proportionally to your pool share. All calculations are performed on-chain and verifiable.",
  },
  {
    q: "How does staking work?",
    a: "When you stake USDC or EURC, your tokens are transferred to the ReapoorStakingManager contract. Your position is recorded on-chain, and you begin accruing rewards immediately. You can stake USDC only, EURC only, or both simultaneously. Rewards are claimable at any time, and your principal can be unstaked in full or partially with no waiting period.",
  },
  {
    q: "How does liquidity provision work?",
    a: "When you supply liquidity, you receive a proportional share of the pool. Your share is tracked as an internal accounting unit. Rewards accumulate in proportion to your pool share and are claimable at any time. When you remove liquidity, you receive back the underlying USDC or EURC proportional to your share plus any unclaimed rewards.",
  },
  {
    q: "How do withdrawals work?",
    a: "You can unstake or remove liquidity at any time — there are no lock-up periods, withdrawal queues, or cooldown delays. Simply enter the amount you want to withdraw on the Stake or Liquidity page and confirm the transaction. Your tokens plus any pending rewards are returned to your wallet in the same transaction.",
  },
  {
    q: "What are the risks?",
    a: "As with all DeFi protocols, smart contract risk exists. While Reapoor contracts implement industry-standard security patterns (reentrancy guards, RBAC, pausability, upgrade capability), they have not yet been formally audited. Additionally, this deployment is on Arc Testnet only — assets have no real-world value. Never deposit real funds into testnet contracts.",
  },
  {
    q: "What is the difference between staking and liquidity provision?",
    a: "Staking deposits your tokens at a fixed APY into a dedicated staking pool. Liquidity provision deposits tokens into a pool that may also serve protocol-level functions. Both strategies earn USDC and EURC rewards, but liquidity provision typically offers slightly higher APYs in exchange for pool participation. Both are fully non-custodial.",
  },
  {
    q: "Can I claim rewards without unstaking?",
    a: "Yes. You can claim your pending USDC and EURC rewards at any time from the Rewards page without touching your staked principal or liquidity position. Your principal continues earning after you claim.",
  },
  {
    q: "Is this a testnet application?",
    a: "Yes. Reapoor is currently deployed exclusively on Arc Testnet. All USDC and EURC tokens used are testnet tokens available for free from the Circle Faucet at faucet.circle.com. These tokens have zero real-world monetary value. Reapoor on Arc Testnet is for testing, development, and demonstration purposes only.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("border rounded-2xl overflow-hidden transition-all", open ? "border-blue-200 bg-blue-50/30" : "border-slate-100 bg-white")}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className={cn("font-semibold text-sm md:text-base transition-colors", open ? "text-blue-700" : "text-slate-900")}>
          {q}
        </span>
        <ChevronDown className={cn("w-5 h-5 flex-shrink-0 transition-transform text-slate-400", open && "rotate-180 text-blue-500")} />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="py-28 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-6">
            FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Common questions.
          </h2>
          <p className="text-slate-500 text-lg">
            Everything you need to know before depositing.
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map((item) => (
            <FAQItem key={item.q} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

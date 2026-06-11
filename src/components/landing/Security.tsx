import { Shield, Lock, AlertTriangle, Eye, Key, RefreshCcw } from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "Reentrancy Protection",
    description: "All state-mutating functions are protected by OpenZeppelin's ReentrancyGuard, preventing any recursive call exploits on deposit, withdrawal, or claim operations.",
  },
  {
    icon: Key,
    title: "Role-Based Access Control",
    description: "Administrative functions are protected by granular RBAC with distinct roles for admins, distributors, and upgraders. No single key controls the entire protocol.",
  },
  {
    icon: AlertTriangle,
    title: "Pausable Emergency Mechanisms",
    description: "All contracts implement an emergency pause capability. In the event of a detected exploit or vulnerability, protocol admins can halt new deposits and withdrawals instantly.",
  },
  {
    icon: Lock,
    title: "Emergency Withdrawal",
    description: "Users can always withdraw their principal via the emergencyWithdraw function, even when the protocol is paused. Your capital is never trapped.",
  },
  {
    icon: Eye,
    title: "Fully Auditable On-Chain Logic",
    description: "Every reward calculation, share accounting step, and access control check is performed in Solidity with no off-chain dependencies. Any independent auditor can verify correctness.",
  },
  {
    icon: RefreshCcw,
    title: "Upgradeable Proxy Architecture",
    description: "Contracts use the UUPS proxy pattern allowing security patches to be applied without migrating user funds. Upgrade authority is restricted to the UPGRADER_ROLE.",
  },
];

export function Security() {
  return (
    <section id="security" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-6">
            Security
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Security is not a feature.<br />It&apos;s the foundation.
          </h2>
          <p className="text-slate-500 text-lg">
            Every design decision in Reapoor prioritizes the safety of user funds. Here&apos;s how we protect your assets.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {securityFeatures.map(({ icon: Icon, title, description }) => (
            <div key={title} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
              <div className="w-10 h-10 bg-blue-600/10 group-hover:bg-blue-600/15 rounded-xl flex items-center justify-center mb-4 transition-colors">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">{title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Testnet Disclaimer</h3>
            <p className="text-slate-600 leading-relaxed max-w-2xl">
              Reapoor is currently deployed on Arc Testnet for development and testing purposes. All assets used are testnet tokens with no real-world value. Smart contracts have not yet undergone a formal third-party audit. Do not use real funds. Production deployment will follow a comprehensive security audit process.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

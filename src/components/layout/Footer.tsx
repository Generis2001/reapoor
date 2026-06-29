import Link from "next/link";
import Image from "next/image";
import { USDCIcon, EURCIcon } from "@/components/ui/TokenIcon";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1">
            <div className="mb-4">
              <Image src="/reapoor-logo.jpeg" alt="Reapoor" width={140} height={40} className="h-10 w-auto object-contain" />
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Institutional-grade stablecoin yield protocol built natively for Arc Testnet.
            </p>
            <div className="flex items-center gap-2">
              <USDCIcon size="sm" />
              <EURCIcon size="sm" />
              <span className="text-xs text-slate-500 ml-1">USDC & EURC by Circle</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Protocol</h4>
            <ul className="space-y-2 text-sm">
              {["Dashboard", "Stake", "Liquidity", "Rewards"].map((item) => (
                <li key={item}>
                  <Link href={`/app/${item.toLowerCase()}`} className="hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Learn</h4>
            <ul className="space-y-2 text-sm">
              {[
                ["About", "/#about"],
                ["How It Works", "/#how-it-works"],
                ["Security", "/#security"],
                ["FAQ", "/#faq"],
                ["Documentation", "/app/docs"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Circle Faucet ↗
                </a>
              </li>
              <li>
                <a href="https://testnet.arcscan.app/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Arc Explorer ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © 2026 Reapoor. Deployed on Arc Testnet. For testing purposes only.
          </p>
          <p className="text-xs text-slate-600">
            USDC and EURC are trademarks of Circle Internet Financial, LLC.
          </p>
        </div>
      </div>
    </footer>
  );
}

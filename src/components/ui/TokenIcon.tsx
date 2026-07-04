import Image from "next/image";
import { cn } from "@/lib/utils";

interface TokenIconProps {
  token: "USDC" | "EURC";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: "w-4 h-4 text-[8px]",
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
  xl: "w-14 h-14 text-base",
};

export function USDCIcon({ size = "md", className }: Omit<TokenIconProps, "token">) {
  return (
    <span className={cn("relative inline-flex items-center justify-center flex-shrink-0 overflow-hidden", sizes[size], className)}>
      <Image
        src="/usdc-logo.png"
        alt="USDC"
        width={56}
        height={56}
        className="h-full w-full object-contain"
      />
    </span>
  );
}

export function EURCIcon({ size = "md", className }: Omit<TokenIconProps, "token">) {
  return (
    <div className={cn("relative inline-flex items-center justify-center rounded-full flex-shrink-0", sizes[size], className)}>
      <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#1AA3FF"/>
        <path d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6Z" fill="#0066CC" fillOpacity="0.3"/>
        <path d="M19.5 10.5c-1.2-.7-2.6-1-4-.8-3.2.4-5.5 3.3-5.1 6.5.3 2.6 2.3 4.7 4.9 5.1 1.4.2 2.8-.1 4-.8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9.5 14.5h7M9.5 17.5h7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

export function TokenIcon({ token, size = "md", className }: TokenIconProps) {
  if (token === "USDC") return <USDCIcon size={size} className={className} />;
  return <EURCIcon size={size} className={className} />;
}

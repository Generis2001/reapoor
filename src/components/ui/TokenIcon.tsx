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
    <div className={cn("relative inline-flex items-center justify-center rounded-full flex-shrink-0", sizes[size], className)}>
      <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#2775CA"/>
        <path d="M20.022 18.124c0-2.124-1.28-2.852-3.84-3.156-1.828-.232-2.192-.696-2.192-1.512s.58-1.348 1.74-1.348c1.04 0 1.62.348 1.908 1.212a.419.419 0 0 0 .396.292h.9a.4.4 0 0 0 .4-.412c-.232-1.48-1.304-2.588-3.02-2.76V9.516a.42.42 0 0 0-.42-.42h-.844a.42.42 0 0 0-.42.42v.928c-1.784.232-2.92 1.36-2.92 2.836 0 2.008 1.22 2.78 3.78 3.084 1.7.232 2.252.58 2.252 1.568s-.812 1.64-1.908 1.64c-1.508 0-2.032-.64-2.208-1.508a.418.418 0 0 0-.408-.32h-.928a.4.4 0 0 0-.4.408c.232 1.74 1.4 2.92 3.14 3.14v.932a.42.42 0 0 0 .42.42h.844a.42.42 0 0 0 .42-.42v-.928c1.788-.228 2.908-1.44 2.908-3.052Z" fill="white"/>
        <path d="M12.916 21.588C9.1 20.308 7.1 16.124 8.388 12.332c.66-1.98 2.108-3.54 3.996-4.34a.432.432 0 0 0 .26-.404v-.832a.424.424 0 0 0-.42-.42.384.384 0 0 0-.144.028C7.744 7.708 5.34 12.3 6.784 16.884a10.246 10.246 0 0 0 5.7 6.3.384.384 0 0 0 .144.028.424.424 0 0 0 .42-.42v-.832a.432.432 0 0 0-.132-.372ZM19.908 6.364a.384.384 0 0 0-.144-.028.424.424 0 0 0-.42.42v.832c0 .16.088.304.228.372 3.816 1.28 5.82 5.464 4.528 9.256a8.178 8.178 0 0 1-3.996 4.34.432.432 0 0 0-.26.404v.832c0 .232.188.42.42.42.048 0 .1-.008.144-.028 4.336-1.344 6.744-5.936 5.3-10.52a10.22 10.22 0 0 0-5.8-6.3Z" fill="white"/>
      </svg>
    </div>
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

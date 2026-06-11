import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  glass?: boolean;
  hover?: boolean;
}

export function Card({ className, children, glass, hover }: CardProps) {
  return (
    <div className={cn(
      "rounded-2xl border transition-all duration-200",
      glass
        ? "bg-white/70 backdrop-blur-sm border-white/50 shadow-lg shadow-blue-900/5"
        : "bg-white border-slate-100 shadow-sm",
      hover && "hover:shadow-md hover:border-blue-100 hover:-translate-y-0.5",
      className
    )}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn("p-5", accent && "bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white", className)}>
      <div className="flex items-start justify-between mb-1">
        <p className={cn("text-xs font-medium tracking-wide uppercase", accent ? "text-blue-200" : "text-slate-500")}>
          {label}
        </p>
        {icon && <div className={cn("opacity-70", accent && "text-white")}>{icon}</div>}
      </div>
      <p className={cn("text-2xl font-bold mt-1", accent ? "text-white" : "text-slate-900")}>{value}</p>
      {sub && <p className={cn("text-xs mt-1", accent ? "text-blue-200" : "text-slate-400")}>{sub}</p>}
    </Card>
  );
}

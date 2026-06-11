import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> & {
  label?: string;
  error?: string;
  suffix?: ReactNode;
  prefix?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, suffix, prefix, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <div className="absolute left-3 flex items-center pointer-events-none">{prefix}</div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900",
              "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400",
              "transition-all duration-150",
              prefix && "pl-10",
              suffix && "pr-24",
              error && "border-red-300 focus:ring-red-500/30 focus:border-red-400",
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 flex items-center">{suffix}</div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

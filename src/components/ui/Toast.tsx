"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertCircle, X, ExternalLink } from "lucide-react";

type ToastType = "success" | "error" | "info" | "pending";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  txHash?: string;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    if (t.type !== "pending") {
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 5000);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500" />,
    pending: (
      <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ),
  };

  return (
    <div className={cn(
      "relative flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl shadow-slate-900/10 animate-slide-up",
      toast.type === "success" && "border-emerald-100",
      toast.type === "error" && "border-red-100",
      (toast.type === "info" || toast.type === "pending") && "border-blue-100",
    )}>
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
        {toast.description && <p className="text-xs text-slate-500 mt-0.5">{toast.description}</p>}
        {toast.txHash && (
          <a
            href={`https://testnet.arcscan.app/tx/${toast.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> View on Arcscan
          </a>
        )}
      </div>
      <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

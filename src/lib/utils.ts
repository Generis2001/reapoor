import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatUnits } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatToken(value: bigint, decimals = 6, displayDecimals = 2): string {
  const num = parseFloat(formatUnits(value, decimals));
  return num.toLocaleString("en-US", {
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals,
  });
}

export function formatUsd(value: bigint, decimals = 6): string {
  const num = parseFloat(formatUnits(value, decimals));
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatApy(bps: bigint): string {
  return (Number(bps) / 100).toFixed(2) + "%";
}

export function shortAddress(addr: string): string {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

export function formatTvl(value: number): string {
  if (value >= 1_000_000) return "$" + (value / 1_000_000).toFixed(2) + "M";
  if (value >= 1_000) return "$" + (value / 1_000).toFixed(1) + "K";
  return "$" + value.toFixed(2);
}

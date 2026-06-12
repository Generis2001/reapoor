export const MAX_UINT256 = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935");

export type TxStatus = "idle" | "approving_usdc" | "approving_eurc" | "submitting" | "confirming" | "success";

export interface TxState {
  status: TxStatus;
  hash?: `0x${string}`;
}

export function parseTxError(e: unknown): string {
  if (!(e instanceof Error)) return "Transaction failed";
  const msg = e.message;
  if (/user rejected|User rejected|UserRejectedRequestError/i.test(msg)) return "Transaction rejected";
  if (msg.includes("insufficient funds")) return "Insufficient funds for gas";
  const reverted = msg.match(/reverted with reason string '([^']+)'/);
  if (reverted) return reverted[1];
  const custom = msg.match(/reverted with custom error '([^(]+)/);
  if (custom) return custom[1];
  return msg.slice(0, 100);
}

export function txButtonLabel(status: TxStatus, defaultLabel: string): string {
  switch (status) {
    case "approving_usdc": return "Approving USDC...";
    case "approving_eurc": return "Approving EURC...";
    case "submitting": return "Sending...";
    case "confirming": return "Confirming...";
    default: return defaultLabel;
  }
}

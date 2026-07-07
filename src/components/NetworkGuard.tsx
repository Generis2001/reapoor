"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useCallback, useEffect, useRef, useState } from "react";
import { arcTestnet, arcTestnetWalletChain } from "@/lib/chains";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Wifi } from "lucide-react";

type Eip1193Provider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
};

function getEthereumProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null;

  const ethereum = (window as Window & { ethereum?: Eip1193Provider }).ethereum;
  return ethereum ?? null;
}

function getErrorEntries(error: unknown, seen = new Set<unknown>()): Array<{ code?: number; message: string }> {
  if (!error || typeof error !== "object" || seen.has(error)) return [];

  seen.add(error);

  const entries: Array<{ code?: number; message: string }> = [];
  const withMeta = error as {
    code?: number;
    message?: string;
    details?: string;
    shortMessage?: string;
    cause?: unknown;
    data?: { originalError?: unknown };
  };

  const message = withMeta.shortMessage ?? withMeta.message ?? withMeta.details;
  if (message) {
    entries.push({ code: withMeta.code, message: String(message) });
  }

  if (withMeta.cause) entries.push(...getErrorEntries(withMeta.cause, seen));
  if (withMeta.data?.originalError) entries.push(...getErrorEntries(withMeta.data.originalError, seen));

  return entries;
}

function matchesError(error: unknown, matcher: (entry: { code?: number; message: string }) => boolean) {
  return getErrorEntries(error).some(matcher);
}

function isChainMissingError(error: unknown) {
  return matchesError(error, ({ code, message }) => {
    const normalized = message.toLowerCase();
    return (
      code === 4902 ||
      normalized.includes("unrecognized chain") ||
      normalized.includes("unknown chain") ||
      normalized.includes("not added") ||
      normalized.includes("chain not configured")
    );
  });
}

function isUserRejectedError(error: unknown) {
  return matchesError(error, ({ code, message }) => {
    const normalized = message.toLowerCase();
    return code === 4001 || normalized.includes("user rejected") || normalized.includes("rejected the request");
  });
}

function getReadableError(error: unknown) {
  if (isUserRejectedError(error)) {
    return "The network change request was rejected in your wallet.";
  }

  const firstMessage = getErrorEntries(error)
    .map((entry) => entry.message.trim())
    .find(Boolean);

  return firstMessage ?? "Unable to switch to Arc Testnet from this wallet.";
}

async function addArcTestnet() {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error("No compatible wallet provider was found for adding Arc Testnet.");
  }

  await provider.request({
    method: "wallet_addEthereumChain",
    params: [arcTestnetWalletChain],
  });
}

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending } = useSwitchChain();
  const [isRequesting, setIsRequesting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const autoPromptedChainRef = useRef<number | null>(null);

  const isWrongNetwork = isConnected && chainId !== arcTestnet.id;
  const isBusy = isPending || isRequesting;

  const promptArcSwitch = useCallback(async () => {
    setErrorMessage(null);
    setIsRequesting(true);

    try {
      await switchChainAsync({ chainId: arcTestnet.id });
    } catch (switchError) {
      if (!isChainMissingError(switchError)) {
        setErrorMessage(getReadableError(switchError));
        setIsRequesting(false);
        return;
      }

      try {
        await addArcTestnet();
        await switchChainAsync({ chainId: arcTestnet.id });
      } catch (addError) {
        setErrorMessage(getReadableError(addError));
      }
    } finally {
      setIsRequesting(false);
    }
  }, [switchChainAsync]);

  useEffect(() => {
    if (!isWrongNetwork) {
      autoPromptedChainRef.current = null;
      return;
    }

    if (isBusy || autoPromptedChainRef.current === chainId) return;

    autoPromptedChainRef.current = chainId;
    void promptArcSwitch();
  }, [chainId, isBusy, isWrongNetwork, promptArcSwitch]);

  if (!isWrongNetwork) return <>{children}</>;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[100] border-b border-amber-300 bg-amber-500 px-4 py-3 text-white shadow-lg shadow-amber-900/20 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                Reapoor requires Arc Testnet.
              </p>
              <p className="text-xs text-amber-50/90">
                We&apos;ll switch your wallet automatically if Arc is already configured, or ask to add Arc Testnet first.
              </p>
              {errorMessage && (
                <p className="mt-1 text-xs text-amber-100">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>

          <Button
            size="sm"
            variant="secondary"
            className="border-0 bg-white text-amber-700 hover:bg-amber-50"
            loading={isBusy}
            onClick={() => void promptArcSwitch()}
          >
            <Wifi className="h-4 w-4" />
            Switch or Add Arc Testnet
          </Button>
        </div>
      </div>
      <div className="h-20 md:h-16" />
      {children}
    </>
  );
}

export function AddArcNetworkButton() {
  const { switchChainAsync, isPending } = useSwitchChain();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleAddNetwork = useCallback(async () => {
    setIsRequesting(true);

    try {
      await switchChainAsync({ chainId: arcTestnet.id });
    } catch (switchError) {
      if (!isChainMissingError(switchError)) {
        throw switchError;
      }

      await addArcTestnet();
      await switchChainAsync({ chainId: arcTestnet.id });
    } finally {
      setIsRequesting(false);
    }
  }, [switchChainAsync]);

  return (
    <Button
      size="sm"
      variant="secondary"
      loading={isPending || isRequesting}
      onClick={() => void handleAddNetwork()}
      className="gap-1.5"
    >
      <Wifi className="w-4 h-4" />
      Add Arc Testnet
    </Button>
  );
}

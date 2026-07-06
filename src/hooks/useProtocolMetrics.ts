"use client";

import { useEffect, useState, useCallback } from "react";
import type { ProtocolMetrics } from "@/lib/metrics";

const POLL_INTERVAL = 60_000; // 1 minute

export function useProtocolMetrics(initialMetrics: ProtocolMetrics | null = null) {
  const [metrics, setMetrics] = useState<ProtocolMetrics | null>(initialMetrics);
  const [loading, setLoading] = useState(initialMetrics === null);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/metrics", { cache: "no-store" });
      if (!res.ok) {
        return;
      }

      const data: ProtocolMetrics = await res.json();
      setMetrics(data);
    } catch {
      // retain previous value on network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchMetrics);
    const id = setInterval(() => {
      void fetchMetrics();
    }, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchMetrics]);

  return { metrics, loading };
}

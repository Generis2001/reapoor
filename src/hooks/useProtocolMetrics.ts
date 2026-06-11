"use client";

import { useEffect, useState, useCallback } from "react";
import type { ProtocolMetrics } from "@/lib/metrics";
import { METRICS_FALLBACK } from "@/lib/metrics";

const POLL_INTERVAL = 60_000; // 1 minute

export function useProtocolMetrics() {
  const [metrics, setMetrics] = useState<ProtocolMetrics>(METRICS_FALLBACK);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/metrics", { cache: "no-store" });
      if (res.ok) {
        const data: ProtocolMetrics = await res.json();
        setMetrics(data);
      }
    } catch {
      // retain previous value on network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const id = setInterval(fetchMetrics, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchMetrics]);

  return { metrics, loading };
}

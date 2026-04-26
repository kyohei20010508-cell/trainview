"use client";

import { useState, useEffect, useCallback } from "react";
import type { Train } from "@/lib/api/types";

const REFRESH_INTERVAL =
  parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL ?? "30000", 10);

export function useTrains(lineId: string) {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/trains?lineId=${lineId}`);
      if (!res.ok) return;
      const data: Train[] = await res.json();
      setTrains(data);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [lineId]);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchData]);

  return { trains, loading, lastUpdated, refresh: fetchData };
}

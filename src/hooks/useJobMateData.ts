// ============================================================================
// useJobMateData — React hook wrapping the jobMateStore
// ============================================================================
// Subscribes to the store and re-renders on every write. Returns the latest
// JobMateData (or null on first render before init completes). Any component
// that needs settings or the active profile should use this instead of
// calling the store directly, so saves in one view update all others.
// ============================================================================

import { useEffect, useState } from "react";
import { jobMateStore } from "../store/jobMateStore";
import type { JobMateData } from "../models/models";

export function useJobMateData(): JobMateData | null {
  const [data, setData] = useState<JobMateData | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Prime the cache. subscribe() will fire immediately if the cache is
    // already warm, but it won't trigger init — so we kick it here.
    jobMateStore.getData().then((initial) => {
      if (!cancelled) setData(initial);
    });

    const unsubscribe = jobMateStore.subscribe((next) => {
      if (!cancelled) setData(next);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return data;
}

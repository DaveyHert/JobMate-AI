// ============================================================================
// useMockData — Developer toggle: seed / clear mock application data
// ============================================================================
// Detects whether mock applications are loaded by checking for their IDs.
// Toggle ON  → merges mockApplications with any real (non-mock) apps already
//              in the store, so real data is never clobbered.
// Toggle OFF → strips all mock app IDs out, leaving only real entries.
// ============================================================================

import { useMemo } from "react";
import { jobMateStore } from "@/store/jobMateStore";
import { mockApplications } from "@/data/mockApplications";
import { useJobMateData } from "./useJobMateData";

const MOCK_IDS = new Set(mockApplications.map((a) => a.id));

export function useMockData() {
  const data = useJobMateData();

  const isMockActive = useMemo(
    () => (data?.applications ?? []).some((a) => MOCK_IDS.has(a.id)),
    [data?.applications],
  );

  const toggle = async (on: boolean) => {
    const current = data?.applications ?? [];
    const realApps = current.filter((a) => !MOCK_IDS.has(a.id));

    if (on) {
      await jobMateStore.replaceApplications([...mockApplications, ...realApps]);
    } else {
      await jobMateStore.replaceApplications(realApps);
    }
  };

  return { isMockActive, toggle };
}

"use client";
import { useEffect, useState, useCallback } from "react";
import { Capsule } from "@/lib/types";
import { loadCapsules, saveCapsules, addCapsule, updateCapsule } from "@/lib/store";

export function useCapsules() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCapsules(loadCapsules());
    setLoading(false);
  }, []);

  const refresh = useCallback(() => setCapsules(loadCapsules()), []);

  const create = useCallback((c: Capsule) => {
    const next = addCapsule(c);
    setCapsules(next);
  }, []);

  const update = useCallback((id: string, patch: Partial<Capsule>) => {
    const next = updateCapsule(id, patch);
    setCapsules(next);
  }, []);

  const readyCapsule = capsules.find((c) => new Date(c.unlockAt).getTime() <= Date.now() && c.status !== "OPENED");
  const lockedCount = capsules.filter((c) => new Date(c.unlockAt).getTime() > Date.now() && c.status !== "OPENED").length;

  return { capsules, loading, refresh, create, update, readyCapsule, lockedCount, save: (cs: Capsule[]) => { saveCapsules(cs); setCapsules(cs); } };
}

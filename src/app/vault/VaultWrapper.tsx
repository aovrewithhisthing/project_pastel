"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import VaultClient from "@/components/VaultClient";
import { useToast } from "@/components/ToastContext";

export default function VaultWrapper() {
  const params = useSearchParams();
  const initialQuery = params.get("q") ?? "";
  const lockedId = params.get("locked");
  const { toast } = useToast();
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    if (lockedId && !notified) {
      toast("Kapsul masih tersegel — isinya terenkripsi hingga tanggal buka.", "error");
      setNotified(true);
    }
  }, [lockedId, notified, toast]);

  return <VaultClient initialQuery={initialQuery} />;
}

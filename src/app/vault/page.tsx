import { Suspense } from "react";
import VaultWrapper from "./VaultWrapper";

export default function VaultPage() {
  return (
    <Suspense fallback={<div className="max-w-[1280px] mx-auto px-6 py-20 text-center text-sm text-[#84746d]">Memuat vault...</div>}>
      <VaultWrapper />
    </Suspense>
  );
}

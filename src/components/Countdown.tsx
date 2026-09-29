"use client";
import { useEffect, useState } from "react";

function getRemaining(targetIso: string) {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return { expired: true, d: 0, h: 0, m: 0, s: 0 };
  const s = Math.floor(diff / 1000);
  return {
    expired: false,
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export default function Countdown({ targetIso, compact }: { targetIso: string; compact?: boolean }) {
  const [time, setTime] = useState(() => getRemaining(targetIso));
  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining(targetIso)), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (time.expired) {
    return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7e5713] bg-[#fec97b]/40 px-2.5 py-1 rounded-full"><span className="material-symbols-outlined text-[14px]">lock_open</span> Siap Dibuka</span>;
  }
  if (compact) {
    return (
      <span className="font-mono text-xs font-semibold text-[#83533c]">
        {time.d}h {time.h}j {time.m}m
      </span>
    );
  }
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {[
        [time.d, "Hari"],
        [time.h, "Jam"],
        [time.m, "Menit"],
        [time.s, "Detik"],
      ].map(([v, l]) => (
        <div key={l as string} className="bg-white rounded-lg px-2 py-2 text-center shadow-inner border border-[#e6e2df]">
          <div className="font-mono text-[15px] font-bold leading-none text-[#1c1b1a]">{String(v).padStart(2, "0")}</div>
          <div className="text-[10px] uppercase tracking-widest font-semibold text-[#84746d] mt-0.5">{l as string}</div>
        </div>
      ))}
    </div>
  );
}

export function InlineCountdown({ targetIso }: { targetIso: string }) {
  const [time, setTime] = useState(() => getRemaining(targetIso));
  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining(targetIso)), 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  if (time.expired) return <span className="text-[#7e5713] font-semibold text-sm">Siap dibuka hari ini</span>;
  return <span className="font-mono text-sm font-semibold text-[#83533c]">{time.d} hari • {time.h} jam • {time.m} menit</span>;
}

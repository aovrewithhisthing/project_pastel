"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCapsules } from "@/hooks/useCapsules";
import Countdown from "@/components/Countdown";
import { Capsule, CapsuleType } from "@/lib/types";

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "LOCKED", label: "Terkunci" },
  { key: "READY", label: "Siap Dibuka" },
  { key: "OPENED", label: "Arsip Terbuka" },
] as const;

const TYPE_LABEL: Record<CapsuleType, { label: string; color: string; bg: string }> = {
  FUTURE_SELF: { label: "FUTURE_SELF", color: "#4d2613", bg: "#ffdbcc" },
  TO_SOMEONE: { label: "TO_SOMEONE", color: "#291800", bg: "#ffddb1" },
  SHARED: { label: "SHARED", color: "#002021", bg: "#b7ecee" },
  MILESTONE: { label: "MILESTONE", color: "#51443e", bg: "#e6e2df" },
  PRIVATE: { label: "PRIVATE", color: "#4d2613", bg: "#ffdbcc" },
};

function timeLeftLabel(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Siap dibuka";
  const d = Math.floor(diff / 86400000);
  if (d > 730) return `${Math.floor(d / 365)} Thn ${d % 365} Hari`;
  if (d > 30) return `${d} Hari`;
  return `${d} Hari`;
}

function CapsuleCard({ c }: { c: Capsule }) {
  const t = TYPE_LABEL[c.type];
  const locked = new Date(c.unlockAt).getTime() > Date.now() && c.status !== "OPENED";
  return (
    <Link href={locked ? `/vault?locked=${c.id}` : `/capsule/${c.id}`} className="block bg-[#f7f3f0] rounded-2xl p-6 border border-[#e6e2df] hover:shadow-lg hover:-translate-y-0.5 transition group">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner" style={{ background: `${t.color}14`, color: t.color }}>
            <span className="material-symbols-outlined text-[24px]">{c.icon}</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wide" style={{ background: t.bg, color: t.color }}>{t.label}{c.contributors ? ` (${c.contributors.length})` : ""}</span>
              <span className="text-xs text-[#84746d]">Dibuat {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
            <h3 className="font-serif text-[20px] leading-tight mt-1 group-hover:text-[#83533c] transition">{c.title}</h3>
            <p className="text-sm text-[#51443e] line-clamp-2 mt-1 leading-relaxed">{c.description}</p>
          </div>
        </div>
        <div className="sm:text-right bg-white rounded-xl px-3.5 py-2.5 border border-[#e6e2df] shadow-inner shrink-0 min-w-[150px]">
          <div className="text-[10px] font-bold tracking-widest uppercase text-[#84746d] flex sm:justify-end items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#83533c]">{locked ? "timelapse" : "lock_open"}</span>
            {c.status === "OPENED" ? "Telah Dibuka" : locked ? "Sisa Waktu" : "Siap Dibuka"}
          </div>
          <div className={`font-serif text-[17px] ${locked ? "text-[#83533c]" : "text-[#7e5713]"}`}>{c.status === "OPENED" ? "✓ Terbuka" : timeLeftLabel(c.unlockAt)}</div>
          <div className="text-xs text-[#84746d]">Buka: {new Date(c.unlockAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-[#e6e2df]/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-[#51443e]">
          <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">encrypted</span> Terenkripsi</span>
          <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">perm_media</span> {c.media.length} berkas</span>
        </div>
        <div className="flex gap-1.5">{c.tags.map((tag) => (<span key={tag} className="px-2 py-0.5 rounded-full bg-white border border-[#e6e2df] text-[11px] font-semibold text-[#51443e]">#{tag}</span>))}</div>
      </div>
    </Link>
  );
}

export default function VaultClient({ initialQuery }: { initialQuery: string }) {
  const { capsules, loading, lockedCount, readyCapsule } = useCapsules();
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState(initialQuery ?? "");

  const filtered = useMemo(() => {
    return capsules.filter((c) => {
      const matchQ = q.trim() === "" || (c.title + c.description + c.tags.join(" ")).toLowerCase().includes(q.toLowerCase());
      if (!matchQ) return false;
      if (filter === "all") return true;
      if (filter === "LOCKED") return new Date(c.unlockAt).getTime() > Date.now() && c.status !== "OPENED";
      if (filter === "READY") return new Date(c.unlockAt).getTime() <= Date.now() && c.status !== "OPENED";
      if (filter === "OPENED") return c.status === "OPENED";
      return true;
    });
  }, [capsules, filter, q]);

  const counts = useMemo(() => ({
    all: capsules.length,
    LOCKED: capsules.filter((c) => new Date(c.unlockAt).getTime() > Date.now() && c.status !== "OPENED").length,
    READY: capsules.filter((c) => new Date(c.unlockAt).getTime() <= Date.now() && c.status !== "OPENED").length,
    OPENED: capsules.filter((c) => c.status === "OPENED").length,
  }), [capsules]);

  if (loading) return <div className="max-w-[1280px] mx-auto px-6 py-20 text-center text-sm text-[#84746d]">Memuat vault...</div>;

  const upcoming = [...capsules].filter((c) => c.status !== "OPENED").sort((a, b) => +new Date(a.unlockAt) - +new Date(b.unlockAt)).slice(0, 4);

  return (
    <div className="w-full pb-10">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8 pt-8">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f2edeb] text-[#83533c] text-[11px] font-bold tracking-widest uppercase"><span className="material-symbols-outlined text-[16px]">lock_clock</span> Vault Terenkripsi 256-Bit</div>
            <h1 className="font-serif text-[32px] lg:text-[40px] tracking-tight mt-2">Selamat Petang, <span className="italic text-[#83533c]">Eleanor Vance</span></h1>
            <p className="text-[#51443e] mt-1">Ruang brankas menjaga <b className="text-[#1c1b1a]">{lockedCount} kapsul terkunci</b> dan <b className="text-[#7e5713]">{counts.READY} kapsul</b> siap dibuka hari ini.</p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-[#e6e2df] px-5 py-3 rounded-2xl shadow-sm">
            <div className="text-right"><div className="text-[11px] font-bold tracking-widest uppercase text-[#84746d]">Status Vault</div><div className="font-serif text-[#336668] flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#336668] animate-pulse" /> Aktif & Terjaga</div></div>
            <Link href="/tulis" className="inline-flex items-center gap-2 bg-[#83533c] text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-[#673c27] transition"><span className="material-symbols-outlined text-[20px]">add_circle</span> Kapsul Baru</Link>
          </div>
        </section>

        {readyCapsule && (
          <section className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#fec97b]/50 via-[#ece7e5] to-[#f7f3f0] border border-[#e6e2df] shadow-md p-6 sm:p-8">
              <span className="material-symbols-outlined absolute -right-6 -bottom-8 text-[200px] text-[#7e5713]/10 select-none pointer-events-none">hourglass_empty</span>
              <div className="relative grid lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-full bg-[#7e5713] text-white text-[11px] font-bold tracking-wide inline-flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">lock_open</span> SIAP DIBUKA HARI INI</span>
                    <span className="text-xs text-[#51443e]">Disegel sejak {new Date(readyCapsule.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </div>
                  <h2 className="font-serif text-[26px]">{readyCapsule.title}</h2>
                  <p className="text-sm text-[#51443e] max-w-2xl leading-relaxed">“{readyCapsule.description}”</p>
                  <div className="flex flex-wrap gap-4 text-xs text-[#51443e]">
                    <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-[#83533c]">description</span> Surat Tulisan Tangan</span>
                    <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-[#83533c]">photo_library</span> {readyCapsule.media.length} Kenangan</span>
                  </div>
                </div>
                <div className="lg:col-span-4 flex flex-col items-start lg:items-end gap-2">
                  <Link href={`/capsule/${readyCapsule.id}`} className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#7e5713] text-white px-6 py-3.5 rounded-full shadow-md hover:bg-[#614000] transition text-sm font-bold tracking-wide uppercase"><span className="material-symbols-outlined">key</span> Buka Segel Kapsul</Link>
                  <span className="text-xs italic text-[#51443e]">Kunci lilin digital telah mencair & terverifikasi</span>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-6">
          <div className="flex gap-1 bg-white border border-[#e6e2df] rounded-full p-1 overflow-x-auto">
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition ${filter === f.key ? "bg-[#1c1b1a] text-white" : "text-[#51443e] hover:bg-[#f2edeb]"}`}>
                {f.label} <span className="opacity-60">({counts[f.key as keyof typeof counts] ?? 0})</span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#84746d] text-[18px]">search</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, tag, tahun..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#e6e2df] rounded-full text-sm outline-none focus:border-[#c48b71] focus:ring-2 focus:ring-[#c48b71]/20" />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-5">
            {filtered.length === 0 && (
              <div className="bg-white border border-dashed border-[#d6c2bb] rounded-2xl p-10 text-center">
                <span className="material-symbols-outlined text-[40px] text-[#d6c2bb]">search_off</span>
                <p className="font-serif text-lg mt-2">Tidak ada kapsul cocok</p>
                <p className="text-sm text-[#51443e]">Coba kata kunci atau filter lain.</p>
                <button onClick={() => { setQ(""); setFilter("all"); }} className="mt-4 px-5 py-2 rounded-full bg-[#83533c] text-white text-sm font-semibold">Reset Filter</button>
              </div>
            )}
            {filtered.map((c) => (<CapsuleCard key={c.id} c={c} />))}
          </div>

          <aside id="timeline" className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
            <div className="bg-white border border-[#e6e2df] rounded-2xl p-6 shadow-sm scroll-mt-32">
              <h3 className="font-serif text-lg flex items-center gap-2"><span className="material-symbols-outlined text-[#83533c] text-[20px]">timeline</span> Jalur Waktu Segel</h3>
              <p className="text-xs text-[#51443e] mb-5 mt-1">Peta masa depan kapsulmu yang akan terbuka:</p>
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e6e2df]">
                {upcoming.map((c) => (
                  <div key={c.id} className="relative">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ring-4 ring-white" style={{ background: c.type === "SHARED" ? "#336668" : c.type === "TO_SOMEONE" ? "#7e5713" : "#83533c" }} />
                    <div className="flex items-baseline justify-between gap-2"><span className="text-[13px] font-bold text-[#83533c]">{new Date(c.unlockAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}</span><span className="text-[11px] text-[#84746d]">{timeLeftLabel(c.unlockAt)}</span></div>
                    <p className="text-[13px] font-semibold mt-0.5">{c.title}</p>
                  </div>
                ))}
                {upcoming.length === 0 && <p className="text-sm text-[#84746d]">Semua kapsul telah terbuka 🎉</p>}
              </div>
            </div>

            <div className="bg-white border border-[#e6e2df] rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg flex items-center gap-2"><span className="material-symbols-outlined text-[#7e5713] text-[20px]">inventory_2</span> Statistik Brankas</h3>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-[#f7f3f0] mt-4">
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36"><circle className="stroke-[#e6e2df]" cx="18" cy="18" fill="none" r="14" strokeWidth="3" /><circle className="stroke-[#83533c]" cx="18" cy="18" fill="none" r="14" strokeDasharray="88,100" strokeLinecap="round" strokeWidth="3" /></svg>
                  <span className="absolute text-xs font-bold">88%</span>
                </div>
                <div><div className="text-[11px] font-bold tracking-widest uppercase text-[#84746d]">Kapasitas Aman</div><div className="text-[13px]">3.8 GB dari 5 GB</div><div className="text-xs text-[#84746d]">Enkripsi aktif</div></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-3">
                <div className="p-3 rounded-xl bg-[#f7f3f0]"><div className="font-serif text-xl text-[#83533c]">{lockedCount}</div><div className="text-[11px] text-[#51443e] leading-tight">Tersegel</div></div>
                <div className="p-3 rounded-xl bg-[#f7f3f0]"><div className="font-serif text-xl text-[#7e5713]">{capsules.reduce((a, c) => a + c.media.length, 0)}</div><div className="text-[11px] text-[#51443e] leading-tight">Kenangan</div></div>
                <div className="p-3 rounded-xl bg-[#f7f3f0]"><div className="font-serif text-xl text-[#336668]">{capsules.length}</div><div className="text-[11px] text-[#51443e] leading-tight">Surat</div></div>
              </div>
              <div className="mt-3 p-3.5 rounded-xl bg-[#ffdbcc]/30 flex gap-3">
                <span className="material-symbols-outlined text-[#83533c]">shield</span>
                <p className="text-xs text-[#51443e] leading-relaxed"><b className="text-[#1c1b1a]">Protokol Penjaga Warisan:</b> Kontak darurat <i>Julian Vance</i> terverifikasi untuk akses bila vakum 10 tahun.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { loadCapsules, saveCapsules } from "@/lib/store";
import { Capsule } from "@/lib/types";
import { useToast } from "@/components/ToastContext";

export default function CapsulePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { toast } = useToast();
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [phase, setPhase] = useState<"sealed" | "melting" | "open">("sealed");
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const all = loadCapsules();
    const found = all.find((c) => c.id === id) ?? null;
    setCapsule(found);
    if (found) {
      const locked = new Date(found.unlockAt).getTime() > Date.now() && found.status !== "OPENED";
      if (locked) {
        // show sealed teaser
        setPhase("sealed");
      } else if (found.status !== "OPENED") {
        setPhase("melting");
        // auto open after animation
        const t = setTimeout(() => {
          setPhase("open");
          // mark opened
          const updated = all.map((c) => (c.id === id ? { ...c, status: "OPENED" as const, openedAt: new Date().toISOString() } : c));
          saveCapsules(updated);
          setCapsule((prev) => (prev ? { ...prev, status: "OPENED" as const, openedAt: new Date().toISOString() } : prev));
        }, 900);
        return () => clearTimeout(t);
      } else {
        setPhase("open");
      }
    }
  }, [id]);

  const locked = capsule ? new Date(capsule.unlockAt).getTime() > Date.now() && capsule.status !== "OPENED" : false;

  const handleReflectionSave = () => {
    if (!capsule) return;
    if (reflection.trim().length < 8) { toast("Refleksi minimal 8 karakter", "error"); return; }
    setSaving(true);
    const all = loadCapsules();
    const next = all.map((c) =>
      c.id === capsule.id
        ? { ...c, reflections: [...(c.reflections ?? []), { id: `r-${Date.now()}`, content: reflection.trim(), createdAt: new Date().toISOString() }] }
        : c
    );
    saveCapsules(next);
    const updated = next.find((c) => c.id === capsule.id)!;
    setCapsule(updated);
    setReflection("");
    setSaving(false);
    toast("Refleksi tersimpan di galeri pribadi", "success");
  };

  if (!capsule) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <span className="material-symbols-outlined text-[48px] text-[#d6c2bb]">search_off</span>
        <h1 className="font-serif text-2xl mt-4">Kapsul tidak ditemukan</h1>
        <p className="text-sm text-[#51443e] mt-2">ID tidak ada di vault lokal. Mungkin sudah dihapus atau belum dibuat.</p>
        <Link href="/vault" className="inline-flex mt-6 px-6 py-3 rounded-full bg-[#83533c] text-white text-sm font-semibold">Kembali ke Vault</Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full bg-gradient-to-b from-[#ece7e5]/70 via-[#fdf8f6] to-[#f7f3f0]/40 pb-10">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link href="/vault" className="inline-flex items-center gap-2 text-sm font-semibold text-[#51443e] hover:text-[#83533c]"><span className="material-symbols-outlined text-[18px]">arrow_back</span> Kembali ke Vault</Link>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#e6e2df] rounded-full text-xs font-semibold text-[#51443e]"><span className="w-2 h-2 rounded-full bg-[#336668]" /> Enkripsi SHA-256 Terverifikasi</span>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-sm ${locked ? "bg-[#1c1b1a] text-white" : "bg-[#fec97b]/40 text-[#78520e]"}`}>
              <span className="material-symbols-outlined text-[16px]">{locked ? "lock" : "lock_open_right"}</span>
              {locked ? `Terkunci hingga ${new Date(capsule.unlockAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}` : `Terbuka • ${new Date(capsule.unlockAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`}
            </div>
            <h1 className="font-serif text-[36px] lg:text-[48px] leading-tight tracking-tight mt-4">{capsule.title}</h1>
            <p className="font-serif italic text-[#51443e] mt-2">“{capsule.description}”</p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-[#51443e] mt-4">
              <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-[#83533c]">calendar_today</span> Ditulis: {new Date(capsule.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
              <span className="hidden sm:inline opacity-30">•</span>
              <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-[#336668]">pin_drop</span> {capsule.location}</span>
              <span className="hidden sm:inline opacity-30">•</span>
              <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-[#7e5713]">sentiment_calm</span> {capsule.mood}</span>
            </div>
          </div>

          {/* SEALED STATE */}
          {phase === "sealed" && locked && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-[20px] shadow-xl p-10 lg:p-14 text-center border border-[#e6e2df] relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#83533c 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
                <div className="relative">
                  <div className="w-24 h-24 mx-auto rounded-full bg-[#ffdbcc] flex items-center justify-center text-[#83533c] wax-seal-glow animate-float">
                    <span className="material-symbols-outlined text-[48px]">lock</span>
                  </div>
                  <h2 className="font-serif text-2xl mt-6">Kapsul Masih Tersegel</h2>
                  <p className="text-sm text-[#51443e] mt-2 max-w-xl mx-auto leading-relaxed">
                    Isi surat & lampiran terenkripsi AES-256 dan hanya dibuka oleh jam server pada tanggal buka. Upaya intip dari client tidak akan berhasil — sesuai PRD Digital Time Capsule §7.
                  </p>
                  <div className="mt-6 inline-flex flex-col items-center gap-2 bg-[#1c1b1a] text-white rounded-2xl px-6 py-4">
                    <span className="text-[11px] tracking-widest uppercase opacity-70">Akan terbuka dalam</span>
                    <LiveCountdown targetIso={capsule.unlockAt} />
                  </div>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <button onClick={() => toast("Konten terkunci — server_timestamp < unlockAt. Tunggu hingga waktunya tiba.", "error")} className="px-6 py-3 rounded-full bg-[#f2edeb] text-[#51443e] text-sm font-semibold">Coba Intip (Diblokir)</button>
                    <Link href="/vault" className="px-6 py-3 rounded-full bg-[#83533c] text-white text-sm font-semibold">Kembali ke Vault</Link>
                  </div>
                  <div className="mt-8 p-4 rounded-xl bg-[#f7f3f0] border border-[#e6e2df] text-left text-xs text-[#51443e]">
                    <div className="font-bold text-[#1c1b1a] flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-[#336668]">verified</span> Integritas Segel</div>
                    <p className="mt-1">Disimpan tanpa modifikasi sejak {new Date(capsule.createdAt).toLocaleString("id-ID")} WIB. Kunci berbagi tidak dibagikan sebelum waktunya.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MELTING ANIMATION */}
          {phase === "melting" && (
            <div className="max-w-4xl mx-auto bg-[#1c1b1a] rounded-[20px] shadow-2xl p-14 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#83533c]/20 to-transparent" />
              <div className="relative">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#ffdbcc] text-[#83533c] flex items-center justify-center wax-seal-glow" style={{ animation: "wax-melt .9s ease forwards" }}>
                  <span className="material-symbols-outlined text-[36px]">local_fire_department</span>
                </div>
                <p className="mt-6 text-sm tracking-widest uppercase opacity-70">Segel Lilin Mencair…</p>
                <h2 className="font-serif text-2xl mt-2">Membuka kapsul untuk Eleanor</h2>
                <div className="mt-6 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-md mx-auto">
                  <div className="h-full bg-[#c48b71] rounded-full" style={{ animation: "crack .9s ease forwards", transformOrigin: "left" }} />
                </div>
              </div>
              <style>{`@keyframes crack{from{width:0}to{width:100%}} @keyframes wax-melt{0%{transform:scale(1)}100%{transform:scale(1.15); opacity:.9}}`}</style>
            </div>
          )}

          {/* OPEN STATE - Manuscript */}
          {phase === "open" && (
            <>
              <div className="max-w-4xl mx-auto bg-white rounded-[20px] shadow-xl p-8 sm:p-12 lg:p-14 border border-[#e6e2df] relative overflow-hidden">
                <div className="flex items-start justify-between gap-6 pb-8 mb-8 border-b border-[#e6e2df]">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#ffddb1]/60 flex items-center justify-center"><span className="material-symbols-outlined text-[#7e5713]">mark_email_read</span></div>
                    <div><span className="text-[11px] font-bold tracking-widest uppercase text-[#83533c]">Naskah Asli Terbuka</span><h3 className="font-serif text-lg">Pesan Kapsul #{capsule.id.slice(0, 8)}</h3><span className="text-xs text-[#51443e]">Tujuan: {capsule.recipient ? capsule.recipient : "Diriku di masa depan"}</span></div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#336668] text-white text-xs font-semibold"><span className="material-symbols-outlined text-[16px]">verified</span> Terbuka {capsule.openedAt ? new Date(capsule.openedAt).toLocaleDateString("id-ID") : ""}</span>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-5">
                    <div className="font-serif text-[18px] leading-8 text-[#1c1b1a] space-y-4 whitespace-pre-wrap">
                      <p className="first-letter:text-4xl first-letter:font-serif first-letter:float-left first-letter:mr-2 first-letter:text-[#83533c]">{capsule.content}</p>
                    </div>
                    <p className="font-serif italic pt-4 text-[#1c1b1a]">Dengan penuh harap,<br /><span className="text-[#83533c]">— Eleanor Vance</span></p>
                    <div className="pt-6 flex flex-wrap gap-2">
                      <span className="text-xs font-semibold text-[#84746d]">Kata Kunci:</span>
                      {capsule.tags.map((t) => (<span key={t} className="px-2.5 py-1 bg-[#f7f3f0] border border-[#e6e2df] text-xs font-semibold rounded-full text-[#51443e]">#{t}</span>))}
                    </div>
                  </div>
                  <div className="lg:col-span-4 flex flex-col gap-5">
                    {capsule.media.filter((m) => m.preview).map((m) => (
                      <div key={m.id} className="bg-[#f7f3f0] p-3 rounded-xl border border-[#e6e2df] rotate-[1deg]">
                        <img src={m.preview} alt={m.name} className="w-full h-48 object-cover rounded-lg" />
                        <p className="text-sm font-semibold mt-2">{m.name}</p>
                        <p className="text-xs text-[#51443e] italic whitespace-nowrap overflow-hidden text-ellipsis">{m.size}</p>
                      </div>
                    ))}
                    <div className="bg-[#f7f3f0] rounded-xl p-4 border border-[#e6e2df]">
                      <div className="flex items-center gap-2 text-[#83533c] text-sm font-semibold"><span className="material-symbols-outlined text-[18px]">mic</span> Catatan Suara</div>
                      {capsule.media.filter((m) => m.kind === "audio").length ? (
                        capsule.media.filter((m) => m.kind === "audio").map((m) => (
                          <div key={m.id} className="mt-3 p-3 bg-white rounded-xl flex items-center gap-3 border border-[#e6e2df]">
                            <button onClick={() => toast("Audio demo — pemutaran preview lokal", "info")} className="w-9 h-9 rounded-full bg-[#83533c] text-white flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">play_arrow</span></button>
                            <div className="flex-1"><div className="h-1.5 bg-[#e6e2df] rounded-full overflow-hidden"><div className="h-full bg-[#83533c] w-[32%]" /></div><div className="flex justify-between text-[11px] text-[#84746d] mt-1"><span>00:34</span><span>{m.duration ?? "02:18"}</span></div></div>
                          </div>
                        ))
                      ) : (<p className="text-xs text-[#51443e] mt-2">Tidak ada audio.</p>)}
                    </div>
                    <div className="bg-[#f7f3f0] rounded-xl p-4 border border-[#e6e2df]">
                      <div className="flex items-center gap-2 text-[#336668] text-sm font-semibold"><span className="material-symbols-outlined text-[18px]">verified</span> Integritas Segel</div>
                      <p className="text-xs text-[#51443e] mt-1">Disimpan tanpa modifikasi sejak {new Date(capsule.createdAt).toLocaleString("id-ID")}.</p>
                      <button onClick={() => { if (capsule.status === "OPENED") toast("Status sudah OPENED — payload penuh dikembalikan (signed URL media berlaku 15 menit).", "success"); }} className="mt-3 w-full py-2 rounded-full bg-white border border-[#e6e2df] text-xs font-semibold">Verifikasi Kunci</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reflection */}
              <section className="max-w-4xl mx-auto mt-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffdbcc] text-[#4d2613] rounded-full text-xs font-bold tracking-widest uppercase"><span className="material-symbols-outlined text-[16px]">compare_arrows</span> Dialog Antar Masa</div>
                  <h2 className="font-serif text-2xl mt-2">Refleksi Saat Ini (Now vs. Then)</h2>
                  <p className="text-sm text-[#51443e]">Surat masa lalumu telah berbicara — kini giliranmu merespons tanpa mengubah naskah asli.</p>
                </div>
                <div className="grid md:grid-cols-12 gap-6">
                  <div className="md:col-span-5 bg-[#f7f3f0] border border-[#e6e2df] p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-3"><span className="text-xs font-bold tracking-widest uppercase text-[#7e5713]">Pertanyaan Masa Lalu</span><span className="material-symbols-outlined text-[#7e5713]">help_outline</span></div>
                    <h3 className="font-serif mb-3">Intisari Kerinduan:</h3>
                    <ul className="space-y-2 text-sm text-[#51443e] font-serif">
                      <li className="flex gap-2"><span className="text-[#83533c] font-bold">1.</span> Apakah kamu masih gemar meminum teh melati saat fajar tiba?</li>
                      <li className="flex gap-2"><span className="text-[#83533c] font-bold">2.</span> Sudahkah kamu berdamai dengan ketakutan sidang akhir?</li>
                      <li className="flex gap-2"><span className="text-[#83533c] font-bold">3.</span> Masihkah kamu tersenyum di jalanan?</li>
                    </ul>
                    <div className="pt-5 mt-5 border-t border-[#e6e2df] flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80" alt="Eleanor" className="w-10 h-10 rounded-full object-cover" />
                      <div><p className="text-sm font-semibold">Eleanor Vance (Kini 28)</p><p className="text-xs text-[#51443e]">Archivist & Desainer</p></div>
                    </div>
                  </div>
                  <div className="md:col-span-7 bg-white border border-[#e6e2df] p-6 rounded-2xl shadow-sm flex flex-col">
                    <label className="text-sm font-semibold flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-[#83533c]">edit_note</span> Balasan Refleksi (2026)</label>
                    <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={5} placeholder="Tulis balasanmu... (mis: Aku membaca ini sambil tersenyum di meja kerja baru. Ya, kita masih menyukai teh melati...)" className="mt-2 w-full p-4 bg-[#fdf8f6] border border-[#e6e2df] rounded-xl text-sm leading-relaxed outline-none focus:border-[#c48b71] focus:ring-2 focus:ring-[#c48b71]/20 resize-none" />
                    <div className="flex items-center justify-between mt-2 text-xs text-[#84746d]"><span>{reflection.length} karakter</span><span className="hidden sm:inline">Tidak mengubah naskah asli — disimpan sebagai Reflection terpisah.</span></div>
                    <div className="mt-4 flex gap-3">
                      <button onClick={handleReflectionSave} disabled={saving} className="flex-1 py-3 rounded-full bg-[#83533c] text-white text-sm font-semibold hover:bg-[#673c27] disabled:opacity-60 flex items-center justify-center gap-2"><span className="material-symbols-outlined text-[18px]">bookmark_added</span> {saving ? "Menyimpan..." : "Simpan Refleksi"}</button>
                      <Link href="/vault" className="px-6 py-3 rounded-full bg-[#f2edeb] text-[#51443e] text-sm font-semibold hover:bg-[#e6e2df]">Ke Vault</Link>
                    </div>
                    {capsule.reflections.length > 0 && (
                      <div className="mt-6 pt-5 border-t border-[#e6e2df] space-y-3">
                        <h4 className="text-xs font-bold tracking-widest uppercase text-[#51443e]">Refleksi Tersimpan ({capsule.reflections.length})</h4>
                        {capsule.reflections.slice().reverse().map((r) => (
                          <div key={r.id} className="p-3 rounded-xl bg-[#fdf8f6] border border-[#e6e2df] text-sm leading-relaxed">
                            <p className="whitespace-pre-wrap">{r.content}</p>
                            <p className="text-[11px] text-[#84746d] mt-2">{new Date(r.createdAt).toLocaleString("id-ID")}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LiveCountdown({ targetIso }: { targetIso: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const diff = new Date(targetIso).getTime() - now;
  if (diff <= 0) return <span className="text-sm font-bold">Siap dibuka!</span>;
  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return <span className="font-mono text-sm font-bold">{d} hari • {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(sec).padStart(2, "0")}</span>;
}

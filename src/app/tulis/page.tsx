"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Capsule, CapsuleType } from "@/lib/types";
import { useCapsules } from "@/hooks/useCapsules";
import { useToast } from "@/components/ToastContext";

const TYPES: { key: CapsuleType; label: string; icon: string; desc: string }[] = [
  { key: "PRIVATE", label: "Pribadi / Diri Sendiri", icon: "person", desc: "Hanya untukmu" },
  { key: "TO_SOMEONE", label: "Kirim ke Seseorang", icon: "send", desc: "Email terkirim otomatis" },
  { key: "SHARED", label: "Kapsul Bersama", icon: "group", desc: "Multi kontributor" },
  { key: "MILESTONE", label: "Milestone Khusus", icon: "workspace_premium", desc: "Pemicu pencapaian" },
];

const MOODS = ["Penuh Harap ✨", "Nostalgia 🍂", "Tenang 🌿", "Rindu 💌", "Cinta ❤️", "Berani 💪"];

export default function TulisPage() {
  const router = useRouter();
  const { create } = useCapsules();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<CapsuleType>("PRIVATE");
  const [title, setTitle] = useState("Kepada Diriku di Ujung Usia 30");
  const [mood, setMood] = useState("Penuh Harap ✨");
  const [content, setContent] = useState(
    "Jika kamu membaca lembar ini, maka sepuluh tahun telah berlalu sejak hari di mana kita memutuskan untuk meninggalkan kenyamanan lama demi melangkah ke kota baru dengan hanya satu ransel kulit dan setumpuk manuskrip yang belum selesai.\n\n\"Jangan pernah menukar ketulusan rasa ingin tahu kita dengan kepastian yang membuat jiwa memudar.\"\n\nHari ini hujan deras turun di Jalan Teuku Umar. Apakah kamu masih menyukai aroma kertas basah di pagi hari? Apakah kamu sudah menyelesaikan tulisan tentang perjalanan di pulau terluar itu?\n\nKuharap kamu tidak terlalu keras menilai kegagalan masa muda ini. Segala keraguan yang kutulis di sini adalah fondasi dari siapa kamu hari ini."
  );
  const [location, setLocation] = useState("Bandung, Jawa Barat");
  const [recipient, setRecipient] = useState("");
  const [tags, setTags] = useState("harapan, masa-depan");
  const [unlockDate, setUnlockDate] = useState(() => {
    const d = new Date(); d.setFullYear(d.getFullYear() + 5); return d.toISOString().slice(0, 10);
  });
  const [unlockTime, setUnlockTime] = useState("08:00");
  const [media, setMedia] = useState<{ name: string; size: string; preview?: string }[]>([
    { name: "catatan_suara_malam_hujan.m4a", size: "2.4 MB • 03:14 menit" },
    { name: "sketsa_impian_dimsum_2026.jpg", size: "4.8 MB • Polaroid High-Res", preview: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80" },
  ]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const e: string[] = [];
    if (title.trim().length < 6) e.push("Judul minimal 6 karakter");
    if (content.trim().split(/\s+/).length < 10) e.push("Isi surat minimal 10 kata");
    if (!unlockDate) e.push("Tanggal buka wajib diisi");
    else if (new Date(unlockDate + "T" + unlockTime).getTime() <= Date.now() + 1000 * 60 * 60) e.push("Tanggal buka harus di masa depan (min 1 jam)");
    if ((type === "TO_SOMEONE" || type === "SHARED") && recipient.trim().length < 3) e.push("Nama/email penerima wajib diisi untuk tipe ini");
    return e;
  };

  const handleSeal = () => {
    const e = validate();
    setErrors(e);
    if (e.length) { toast(e[0], "error"); return; }
    const unlockAt = new Date(unlockDate + "T" + unlockTime + ":00").toISOString();
    const id = `cs-${Date.now().toString(36)}`;
    const capsule: Capsule = {
      id,
      title: title.trim(),
      description: content.slice(0, 140) + (content.length > 140 ? "…" : ""),
      type,
      status: "LOCKED",
      createdAt: new Date().toISOString(),
      unlockAt,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Asia/Jakarta",
      content: content.trim(),
      mood,
      location: location.trim() || "Indonesia",
      tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 6),
      media: media.map((m, i) => ({ id: `m-${id}-${i}`, name: m.name, size: m.size, kind: m.name.match(/\.(mp3|m4a|wav)$/i) ? "audio" : m.name.match(/\.(jpg|jpeg|png|webp)$/i) ? "photo" : "doc", preview: m.preview })),
      recipient: recipient || undefined,
      contributors: type === "SHARED" ? recipient.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      reflections: [],
      coverGradient: "from-[#ffdbcc] to-[#f2edeb]",
      icon: type === "TO_SOMEONE" ? "favorite" : type === "SHARED" ? "group" : type === "MILESTONE" ? "auto_stories" : "lock",
    };
    create(capsule);
    toast("Kapsul berhasil disegel! Terenkripsi & terkunci.", "success");
    setTimeout(() => router.push("/vault"), 700);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
        {/* Stepper */}
        <div className="bg-white border border-[#e6e2df] rounded-2xl p-5 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#83533c] text-xs font-bold tracking-widest uppercase"><span className="material-symbols-outlined text-[18px]">history_edu</span> Protokol Penulisan Kapsul Dimsum</div>
            <h1 className="font-serif text-xl mt-1">Meja Tulis Arsip Kapsul Dimsum</h1>
            <p className="text-xs text-[#51443e]">Langkah {step} dari 4: Menyusun memori & kurasi lampiran.</p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${step === s ? "bg-[#1c1b1a] text-white" : step > s ? "bg-[#83533c] text-white" : "bg-[#f2edeb] text-[#84746d]"}`}>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[11px]">{step > s ? "✓" : s}</span>
                <span className="hidden sm:inline">{["Penerima & Tema", "Pesan & Media", "Kunci Waktu", "Segel Lilin"][s - 1]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Type */}
            <div className="bg-white border border-[#e6e2df] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3"><label className="text-xs font-bold tracking-widest uppercase text-[#51443e]">Tipe Kapsul Dimsum</label><span className="text-xs font-semibold text-[#83533c] flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">lock</span> Terenkripsi Pribadi</span></div>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button key={t.key} onClick={() => setType(t.key)} className={`px-4 py-2.5 rounded-full text-[13px] font-semibold flex items-center gap-2 border transition ${type === t.key ? "bg-[#1c1b1a] text-white border-[#1c1b1a]" : "bg-[#f7f3f0] text-[#51443e] border-[#e6e2df] hover:bg-white"}`}>
                    <span className="material-symbols-outlined text-[16px]">{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>
              {(type === "TO_SOMEONE" || type === "SHARED") && (
                <div className="mt-4">
                  <label className="text-xs font-semibold text-[#51443e]">{type === "SHARED" ? "Email kontributor (pisah koma)" : "Penerima / Email"}</label>
                  <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder={type === "SHARED" ? "renata@mail.com, theo@mail.com" : "Julian — julian@mail.com"} className="mt-1 w-full px-4 py-3 rounded-xl border border-[#e6e2df] text-sm outline-none focus:border-[#c48b71] focus:ring-2 focus:ring-[#c48b71]/20" />
                </div>
              )}
            </div>

            {/* Manuscript */}
            <div className="bg-white border border-[#e6e2df] rounded-2xl p-6 sm:p-8 shadow-md">
              <div className="flex items-center justify-between text-xs text-[#84746d] mb-4"><span className="flex items-center gap-1.5 font-medium"><span className="material-symbols-outlined text-[16px] text-[#7e5713]">calendar_today</span> Ditulis pada {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</span><span className="text-[#336668] font-semibold">Draf tersimpan lokal</span></div>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Beri judul kapsul..." className="w-full bg-transparent font-serif text-[26px] leading-tight outline-none placeholder:text-[#d6c2bb] border-b border-transparent focus:border-[#c48b71] pb-2" />
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs font-semibold text-[#51443e] mr-1">Suasana:</span>
                {MOODS.map((m) => (
                  <button key={m} onClick={() => setMood(m)} className={`px-3 py-1 rounded-full text-xs font-semibold border ${mood === m ? "bg-[#ffdbcc] border-[#c48b71] text-[#4d2613]" : "bg-[#f7f3f0] border-[#e6e2df] text-[#51443e]"}`}>{m}</button>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 bg-[#f7f3f0] rounded-full px-3 py-2">
                <div className="flex items-center gap-1 text-xs text-[#51443e]"><span className="px-2 py-0.5 bg-white rounded-full border border-[#e6e2df] font-serif">S</span><span className="px-2 py-0.5 italic">I</span><span className="material-symbols-outlined text-[18px]">format_quote</span><span className="material-symbols-outlined text-[18px]">sticky_note_2</span></div>
                <span className="text-xs text-[#84746d]">{wordCount} Kata • {Math.max(1, Math.ceil(wordCount / 200))} Menit Membaca</span>
              </div>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} placeholder="Tulis suratmu di sini..." className="w-full mt-4 p-4 bg-[#fdf8f6] border border-[#e6e2df] rounded-xl text-[15px] leading-7 outline-none focus:border-[#c48b71] focus:ring-2 focus:ring-[#c48b71]/20 resize-none" />
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="text-xs font-semibold text-[#51443e]">Lokasi</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-[#e6e2df] text-sm outline-none focus:border-[#c48b71]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#51443e]">Tags (koma)</label>
                  <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="harapan, rindu, keluarga" className="mt-1 w-full px-3 py-2.5 rounded-xl border border-[#e6e2df] text-sm outline-none focus:border-[#c48b71]" />
                </div>
              </div>
              {errors.length > 0 && <div className="mt-3 p-3 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 text-sm text-[#93000a] space-y-1">{errors.map((e) => (<div key={e}>• {e}</div>))}</div>}
              <label className="block mt-4 text-xs font-semibold text-[#51443e]">Draft live preview</label>
              <div className="mt-2 p-4 rounded-xl bg-[#f7f3f0] border border-dashed border-[#d6c2bb] text-sm text-[#51443e] leading-relaxed whitespace-pre-wrap">{content.slice(0, 380)}{content.length > 380 ? "…" : ""}</div>
            </div>

            {/* Media */}
            <div className="bg-white border border-[#e6e2df] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3"><h2 className="font-serif flex items-center gap-2"><span className="material-symbols-outlined text-[#83533c]">perm_media</span> Lampiran Digital</h2><span className="text-xs text-[#51443e]">{media.length} berkas</span></div>
              <input ref={fileRef} type="file" multiple accept="image/*,audio/*,.pdf,.txt" className="hidden" onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                const mapped = files.slice(0, 5 - media.length).map((f) => ({ name: f.name, size: `${(f.size / 1024 / 1024).toFixed(1)} MB`, preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined }));
                if (mapped.length) setMedia((m) => [...m, ...mapped]);
                if (fileRef.current) fileRef.current.value = "";
              }} />
              <div className="grid sm:grid-cols-2 gap-3">
                {media.map((m, i) => (
                  <div key={i} className="bg-[#fdf8f6] border border-[#e6e2df] p-3 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#e6e2df] flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-[18px] text-[#83533c]">{m.preview ? "photo_camera" : m.name.endsWith(".m4a") || m.name.endsWith(".mp3") ? "graphic_eq" : "description"}</span></div>
                      <div className="min-w-0"><p className="text-sm font-semibold truncate">{m.name}</p><p className="text-xs text-[#84746d] truncate">{m.size}</p></div>
                    </div>
                    <button onClick={() => setMedia((prev) => prev.filter((_, idx) => idx !== i))} className="p-1.5 rounded-full hover:bg-white border border-transparent hover:border-[#e6e2df]"><span className="material-symbols-outlined text-[18px]">close</span></button>
                  </div>
                ))}
                {media.length < 5 && (
                  <button onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-[#d6c2bb] rounded-xl p-4 text-sm font-semibold text-[#83533c] hover:bg-[#fdf8f6] flex items-center justify-center gap-2"><span className="material-symbols-outlined">add_photo_alternate</span> Tambah Berkas</button>
                )}
              </div>
              <p className="text-xs text-[#84746d] mt-3">Gambar disimpan sebagai preview lokal (LocalStorage). Maks 5 berkas untuk demo.</p>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(Math.max(1, step - 1))} className="px-6 py-3 rounded-full border border-[#e6e2df] bg-white text-sm font-semibold hover:bg-[#f2edeb]">Kembali</button>
              <button onClick={() => setStep(Math.min(4, step + 1))} className="px-6 py-3 rounded-full bg-[#1c1b1a] text-white text-sm font-semibold hover:bg-black">Lanjut: Kunci Waktu →</button>
            </div>
          </div>

          {/* Right lock settings */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-6">
            <div className="bg-white border border-[#e6e2df] rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between"><h2 className="font-serif flex items-center gap-2"><span className="material-symbols-outlined text-[#83533c]">lock_clock</span> Pengaturan Kunci Waktu</h2><span className="px-2.5 py-1 rounded-full bg-[#ffddb1] text-[#291800] text-xs font-bold">Kunci Keras</span></div>
              <div>
                <label className="text-xs font-semibold text-[#51443e]">Tanggal Pembukaan</label>
                <div className="mt-1 flex items-center gap-2 bg-[#f7f3f0] border border-[#e6e2df] rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-[#83533c]">event</span>
                  <input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-semibold" />
                </div>
                <p className="text-xs text-[#83533c] mt-1 font-medium">
                  {(() => {
                    const diff = new Date(unlockDate + "T" + unlockTime).getTime() - Date.now();
                    const d = Math.floor(diff / 86400000);
                    if (diff <= 0) return "Harus di masa depan";
                    if (d > 365) return `≈ ${Math.floor(d / 365)} tahun ${Math.floor((d % 365) / 30)} bulan lagi`;
                    return `${d} hari lagi`;
                  })()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-[#51443e]">Jam</label><div className="mt-1 flex items-center gap-2 bg-white border border-[#e6e2df] rounded-xl px-3 py-2.5"><span className="material-symbols-outlined text-[18px] text-[#84746d]">schedule</span><input type="time" value={unlockTime} onChange={(e) => setUnlockTime(e.target.value)} className="bg-transparent outline-none text-sm w-full" /></div></div>
                <div><label className="text-xs font-semibold text-[#51443e]">Zona</label><div className="mt-1 flex items-center gap-2 bg-white border border-[#e6e2df] rounded-xl px-3 py-2.5 text-sm"><span className="material-symbols-outlined text-[18px] text-[#84746d]">public</span><span className="truncate">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span></div></div>
              </div>
              <div className="bg-[#ffdbcc]/30 border border-[#ffdbcc] rounded-xl p-3 flex gap-2 text-xs text-[#4d2613]"><span className="material-symbols-outlined text-[18px] shrink-0">info</span><span>Setelah disegel, kapsul <b>tidak dapat dibuka atau disunting</b> sebelum tanggal buka — sesuai protokol AES-256 & jam server.</span></div>
              <div className="bg-[#f7f3f0] rounded-2xl p-6 text-center border border-[#e6e2df]">
                <div className="w-16 h-16 mx-auto rounded-full bg-white border border-[#e6e2df] flex items-center justify-center text-[#83533c]"><span className="material-symbols-outlined text-[32px]">lock</span></div>
                <h3 className="font-serif mt-3">Protokol Kunci Terenkripsi AES-256</h3>
                <p className="text-xs text-[#51443e] mt-1">Disegel tanpa celah — bahkan pemilik tak bisa intip sebelum waktunya.</p>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={handleSeal} className="w-full py-4 rounded-full bg-[#83533c] text-white font-bold shadow-md hover:bg-[#673c27] transition flex items-center justify-center gap-2"><span className="material-symbols-outlined">verified</span> Segel Kapsul Sekarang</button>
                <button onClick={() => { toast("Draf tersimpan lokal", "info"); }} className="w-full py-3 rounded-full bg-white border border-[#e6e2df] text-sm font-semibold hover:bg-[#f7f3f0]">Simpan sebagai Draf</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

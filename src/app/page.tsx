"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Countdown from "@/components/Countdown";
import { loadCapsules } from "@/lib/store";

export default function HomePage() {
  const [capsule] = useState(() => loadCapsules().find((c) => c.id === "future-35") ?? loadCapsules()[0]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="relative overflow-hidden px-6 lg:px-12 py-12 lg:py-20 bg-[#fdf8f6]">
        <div className="absolute -top-28 -left-20 w-96 h-96 rounded-full bg-[#ffdbcc]/40 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-[#ffddb1]/30 blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-[1280px] grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2.5 self-start px-3.5 py-1.5 rounded-full bg-[#ece7e5] text-[#83533c] shadow-sm text-xs font-semibold tracking-widest uppercase">
              <span className="material-symbols-outlined text-[18px]">lock_clock</span> Segel Digital Kriptografis • Kapsul Dimsum Abadi
            </div>
            <h1 className="font-serif text-[36px] lg:text-[56px] leading-[1.05] tracking-tight text-[#1c1b1a]">
              Menyimpan Rasa & Kata untuk Hari yang <span className="italic text-[#83533c]">Belum Tiba.</span>
            </h1>
            <p className="text-[17px] leading-7 text-[#51443e] max-w-[56ch]">
              Kirim surat rahasia, rekaman audio autentik, dan potret kenangan yang terkunci rapat dalam kehangatan kapsul dimsum secara kriptografis hingga detik yang kamu tentukan.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/tulis" className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#83533c] text-white text-sm font-semibold shadow-md hover:bg-[#673c27] transition">
                <span className="material-symbols-outlined text-[20px]">edit_note</span> Mulai Menulis Kapsul Dimsum
              </Link>
              <Link href="/vault" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white border border-[#e6e2df] text-[#1c1b1a] text-sm font-semibold hover:bg-[#f2edeb] transition">
                <span className="material-symbols-outlined text-[20px] text-[#83533c]">hourglass_empty</span> Jelajahi Vault
              </Link>
            </div>
            <div className="pt-6 flex items-center gap-8 max-w-lg border-t border-[#e6e2df]/60 mt-2">
              <div><div className="font-serif text-xl">42,891</div><div className="text-xs text-[#51443e]">Kapsul Dimsum Tersegel</div></div>
              <div className="h-8 w-px bg-[#e6e2df]" />
              <div><div className="font-serif text-xl">12 Tahun</div><div className="text-xs text-[#51443e]">Retensi Maksimal</div></div>
              <div className="h-8 w-px bg-[#e6e2df]" />
              <div><div className="font-serif text-xl text-[#336668]">0% Bobol</div><div className="text-xs text-[#51443e]">Integritas Kripto</div></div>
            </div>
          </div>

          {/* Artifact card */}
          <div className="lg:col-span-5">
            <div className="relative bg-white rounded-[20px] shadow-xl p-6 sm:p-7 overflow-hidden border border-[#e6e2df]">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#83533c] via-[#7e5713] to-[#c48b71]" />
              <div className="flex items-center justify-between pb-5">
                <span className="flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-[#51443e]"><span className="w-2 h-2 rounded-full bg-[#7e5713] animate-pulse" /> Arsip Tersegel #CS-2024-884</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f2edeb] text-[#51443e] font-medium">Privat & Terenkripsi</span>
              </div>
              <div className="relative rounded-xl overflow-hidden mb-5">
                <img src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=640&q=80" alt="wax seal" className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                  <div><p className="text-[11px] tracking-widest uppercase text-[#ffddb1]">Ditujukan Kepada</p><p className="font-serif text-lg">Eleanor Vance (Usia 35)</p></div>
                  <div className="w-9 h-9 rounded-full bg-[#83533c] flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">history_edu</span></div>
                </div>
              </div>
              <div className="bg-[#f7f3f0] rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold tracking-widest uppercase text-[#83533c] flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">lock</span> Terkunci hingga {new Date(capsule.unlockAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
                </div>
                {mounted && <Countdown targetIso={capsule.unlockAt} />}
              </div>
              <div className="flex items-center justify-between text-xs text-[#51443e]">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-[#336668]">mic</span> 1 Pesan Suara</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-[#7e5713]">photo_library</span> 6 Foto</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-[#83533c]">description</span> 1.840 Kata</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO */}
      <section className="w-full bg-[#f7f3f0] px-6 lg:px-12 py-16">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div><p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#83533c] mb-2">Bentuk-Bentuk Preservasi</p><h2 className="font-serif text-[28px] leading-tight">Empat Dimensi Kapsul Dimsum untuk Mengarungi Waktu</h2></div>
            <p className="text-sm text-[#51443e] md:max-w-md">Setiap perjumpaan dengan masa depan menuntut wadah yang berbeda. Rancang takdir kapsul sesuai ikatan yang kamu rawat.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: "person_pin_circle", color: "#83533c", bg: "#ffdbcc", tag: "5 Tahun Kedepan", title: "Surat untuk Diri Masa Depan", desc: "Refleksi jujur atas kegelisahan hari ini dan peta kompas moral sebelum waktu mengubahmu.", cta: "Rancang Refleksi" },
              { icon: "favorite", color: "#7e5713", bg: "#ffddb1", tag: "Ulang Tahun Ke-10", title: "Waris Kenangan & Pernikahan", desc: "Kisah janji suci awal pernikahan yang terkunci untuk satu dekade ke depan.", cta: "Simpan Janji" },
              { icon: "groups_3", color: "#336668", bg: "#b7ecee", tag: "Reuni & Wisuda", title: "Kapsul Lingkar Sahabat", desc: "Ajak sahabat kumpulkan lelucon lokal & foto konyol yang baru terbuka bersama.", cta: "Buat Arsip Bersama" },
              { icon: "celebration", color: "#1c1b1a", bg: "#e6e2df", tag: "Pencapaian Besar", title: "Kotak Waktu Kejutan", desc: "Surat dorongan moral untuk karier/wirausaha dari mentor atau dirimu sendiri.", cta: "Siapkan Kejutan" },
            ].map((c) => (
              <div key={c.title} className="bg-white rounded-2xl p-6 shadow-sm border border-[#e6e2df] flex flex-col justify-between hover:shadow-md transition">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: c.bg, color: c.color }}><span className="material-symbols-outlined">{c.icon}</span></div>
                  <span className="inline-block px-2.5 py-1 rounded-full bg-[#f2edeb] text-[11px] font-semibold tracking-wide uppercase text-[#51443e]">{c.tag}</span>
                  <h3 className="font-serif text-lg leading-tight">{c.title}</h3>
                  <p className="text-sm text-[#51443e] leading-relaxed">{c.desc}</p>
                </div>
                <Link href="/tulis" className="pt-6 flex items-center justify-between text-sm font-semibold" style={{ color: c.color }}><span>{c.cta}</span><span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section className="w-full px-6 lg:px-12 py-16 bg-white">
        <div className="mx-auto max-w-[1280px]">
          <div className="bg-[#ece7e5] rounded-[20px] p-8 lg:p-12 relative overflow-hidden">
            <div className="max-w-3xl mb-10">
              <div className="inline-flex items-center gap-2 text-[#83533c] text-xs font-semibold tracking-widest uppercase mb-3"><span className="material-symbols-outlined text-[18px]">verified_user</span> Standar Integritas Arsip</div>
              <h2 className="font-serif text-[32px] leading-tight">Jaminan Kunci Waktu Tanpa Kompromi</h2>
              <p className="text-[#51443e] mt-3">Kepercayaan adalah inti. Arsitektur segel mustahil ditembus — bahkan oleh tim pengembang sendiri.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: "schedule", color: "#336668", title: "Jam Server Terdesentralisasi", desc: "Anti-manipulasi jam lokal. Sinkron NTP multi-zona independen tanpa celah percepatan." },
                { icon: "enhanced_encryption", color: "#83533c", title: "Enkripsi Payloads AES-256", desc: "Setiap paragraf & foto dienkripsi di browser. Kunci baru dirilis saat tanggal valid." },
                { icon: "cloud_sync", color: "#7e5713", title: "Brankas Media Privat Otomatis", desc: "Storage dingin multi-region dengan signed URL 15-menit hanya untuk penerima sah." },
              ].map((s) => (
                <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm"><div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${s.color}14`, color: s.color }}><span className="material-symbols-outlined">{s.icon}</span></div><h3 className="font-serif text-lg">{s.title}</h3><p className="text-sm text-[#51443e] mt-2 leading-relaxed">{s.desc}</p><div className="mt-4 flex items-center gap-1.5 text-xs font-semibold" style={{ color: s.color }}><span className="material-symbols-outlined text-[16px]">check_circle</span> Terverifikasi</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full px-6 lg:px-12 pb-10">
        <div className="mx-auto max-w-[1100px] bg-gradient-to-br from-[#ece7e5] via-white to-[#f7f3f0] rounded-[20px] p-8 lg:p-12 shadow-xl border border-[#e6e2df] flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffdbcc] text-[#4d2613] text-xs font-semibold tracking-widest uppercase mb-3"><span className="material-symbols-outlined text-[14px]">lock</span> Mulai Hari Ini</div>
            <h2 className="font-serif text-[30px] leading-tight">Tulis Surat Pertama. Kunci Hari Ini, Temui Kelak.</h2>
            <p className="text-sm text-[#51443e] mt-3">Jangan biarkan renungan berharga menguap. Simpan kapsul dimsum pertamamu gratis.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              const email = String(fd.get("email") || "");
              if (!email.includes("@")) alert("Masukkan email valid");
              else window.location.href = "/tulis";
            }}
            className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-md"
          >
            <input name="email" placeholder="Alamat email kamu..." className="flex-1 px-4 py-3.5 rounded-full bg-white border border-[#e6e2df] outline-none text-sm focus:border-[#c48b71] focus:ring-2 focus:ring-[#c48b71]/20" />
            <button className="px-7 py-3.5 rounded-full bg-[#83533c] text-white text-sm font-semibold whitespace-nowrap hover:bg-[#673c27] transition flex items-center justify-center gap-2">Segel Kapsul Pertama <span className="material-symbols-outlined text-[18px]">verified</span></button>
          </form>
        </div>
      </section>
    </div>
  );
}

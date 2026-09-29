import Link from "next/link";
export default function Footer() {
  return (
    <footer className="w-full bg-[#f7f3f0] border-t border-[#d6c2bb]/40 mt-16">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center gap-2 text-[#83533c] justify-center md:justify-start">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span className="text-xs font-semibold tracking-wide">Kerahasiaan Terenkripsi & Segel Waktu Terjamin</span>
          </div>
          <p className="text-[13px] text-[#51443e] mt-1">© 2026 Chronicle & Seal. Menjaga surat & warisan kapsul dimsum.</p>
        </div>
        <div className="flex items-center gap-6 text-xs font-semibold text-[#51443e]">
          <Link href="/vault" className="hover:text-[#83533c]">Protokol</Link>
          <Link href="/tulis" className="hover:text-[#83533c]">Privasi Arsip</Link>
          <span className="hover:text-[#83533c] cursor-pointer">Bantuan & FAQ</span>
        </div>
      </div>
    </footer>
  );
}

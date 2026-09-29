import Link from "next/link";
export default function NotFound() {
  return <div className="mx-auto max-w-2xl px-6 py-20 text-center">
    <div className="w-16 h-16 mx-auto rounded-full bg-[#ffdbcc] flex items-center justify-center text-[#83533c]">
      <span className="material-symbols-outlined text-[32px]">search_off</span>
    </div>
    <h1 className="font-serif text-2xl mt-4">Halaman tidak ditemukan</h1>
    <p className="text-sm text-[#51443e] mt-2">Arsip yang kamu cari tidak ada di vault.</p>
    <Link href="/" className="inline-flex mt-6 px-6 py-3 rounded-full bg-[#83533c] text-white text-sm font-semibold">Kembali ke Beranda</Link>
  </div>
}

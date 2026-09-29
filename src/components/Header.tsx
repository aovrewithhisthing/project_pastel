"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Beranda" },
  { href: "/vault", label: "Vault & Arsip" },
  { href: "/timeline", label: "Timeline Kenangan" },
  { href: "/tulis", label: "Tulis Kapsul Dimsum" },
];

export default function Header() {
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-all ${
        scrolled ? "bg-[#fdf8f6]/90 backdrop-blur-xl shadow-sm border-[#e6e2df]" : "bg-[#fdf8f6] border-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8 h-[72px] flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#83533c] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">history_edu</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-[18px] font-medium tracking-tight text-[#1c1b1a]">Chronicle & Seal</span>
            <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-[#83533c]">Kapsul Dimsum Digital</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href === "/vault" && pathname.startsWith("/capsule"));
            return (
              <Link
                key={n.href}
                href={n.href === "/timeline" ? "/vault#timeline" : n.href}
                className={`px-3.5 py-2 rounded-full text-[13px] font-semibold tracking-wide transition ${
                  active ? "bg-[#c48b71]/20 text-[#4d2613]" : "text-[#51443e] hover:bg-[#f2edeb]"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 bg-white border border-[#e6e2df] rounded-full px-3 py-1.5 shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-[#84746d]">search</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && q.trim()) window.location.href = `/vault?q=${encodeURIComponent(q)}`;
              }}
              placeholder="Cari arsip..." aria-label="Cari arsip"
              className="bg-transparent outline-none text-sm w-32 placeholder:text-[#84746d]/70"
            />
          </div>
          <Link href="/vault" className="relative p-2 rounded-full hover:bg-[#f2edeb] text-[#51443e]">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#83533c] rounded-full animate-pulse" />
          </Link>
          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-[#d6c2bb]/50">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80"
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="hidden lg:block text-left leading-none">
              <div className="text-[13px] font-semibold">Eleanor Vance</div>
              <div className="text-[11px] text-[#51443e]">Archivist Dimsum</div>
            </div>
          </div>
        </div>
      </div>
      {/* mobile nav */}
      <div className="lg:hidden border-t border-[#e6e2df] bg-white/80 backdrop-blur flex items-center gap-1 px-4 py-2 overflow-x-auto">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href === "/timeline" ? "/vault#timeline" : n.href}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${
              pathname === n.href ? "bg-[#83533c] text-white" : "bg-[#f2edeb] text-[#51443e]"
            }`}
          >
            {n.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToasterProvider } from "@/components/ToastContext";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chronicle & Seal — Kapsul Dimsum Digital",
  description:
    "Simpan rasa & kata untuk hari yang belum tiba. Kapsul waktu digital terkunci hingga detik yang kamu tentukan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${newsreader.variable} ${jakarta.variable} h-full`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#fdf8f6] text-[#1c1b1a] antialiased">
        <ToasterProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToasterProvider>
      </body>
    </html>
  );
}

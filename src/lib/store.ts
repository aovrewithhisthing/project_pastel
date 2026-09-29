import { Capsule, CapsuleType, CapsuleStatus } from "./types";

export const SEED_CAPSULES: Capsule[] = [
  {
    id: "ready-2021",
    title: "Refleksi Awal Kelulusan 2021",
    description:
      "Surat refleksi untuk diriku sendiri tentang ketakutan pertama memasuki dunia kerja, ambisi tanpa batas, dan rekaman suara dari sore terakhir di taman kampus.",
    type: "FUTURE_SELF",
    status: "READY",
    createdAt: "2021-10-14T10:00:00+07:00",
    unlockAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // already unlocked today
    timezone: "Asia/Jakarta",
    content:
      "Halo diriku yang sudah menempuh lima tahun perjalanan. Apakah kamu masih gemar meminum teh melati saat fajar tiba?\n\nHari ini aku baru saja menuntaskan sidang akhir. Rasanya campur aduk—takut akan masa depan, tapi ada nyala kecil di dada bahwa kita akan baik-baik saja. Saat aku mengetik ini di laptop tuaku yang kipasnya berdengung kencang, rintik hujan baru saja reda di luar jendela kosan Cisitu.\n\nAda dua hal yang ingin kutanyakan padamu: Apakah kamu sudah memaafkan segala keraguan yang sering menahan langkah kita? Dan apakah kamu masih sering tersenyum melihat bunga tabebuya kuning di pinggir jalan?",
    mood: "Harap & Cemas",
    location: "Bandung, Jawa Barat",
    tags: ["kelulusan", "harapan", "bandung"],
    media: [
      { id: "m1", name: "taman_kampus_2021.jpg", size: "3.2 MB", kind: "photo", preview: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&q=80" },
      { id: "m2", name: "voice_memo_sore.mp3", size: "2.1 MB", kind: "audio", duration: "03:42" },
      { id: "m3", name: "jurnal_tangan.pdf", size: "1.8 MB", kind: "doc" },
    ],
    reflections: [],
    coverGradient: "from-[#fec97b] via-[#ece7e5] to-[#f7f3f0]",
    icon: "hourglass_empty",
  },
  {
    id: "future-35",
    title: "Surat untuk Usia 35 Tahun",
    description:
      "Kilas balik pencapaian dekade ini, pesan agar tetap rendah hati, dan daftar pertanyaan tentang mimpi masa kecil yang belum tuntas.",
    type: "FUTURE_SELF",
    status: "LOCKED",
    createdAt: "2024-01-12T08:00:00+07:00",
    unlockAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * (365 * 2 + 142)).toISOString(),
    timezone: "Asia/Jakarta",
    content:
      "Jika kamu membaca lembar ini, maka sepuluh tahun telah berlalu sejak hari di mana kita memutuskan untuk meninggalkan kenyamanan lama demi melangkah ke kota baru.",
    mood: "Penuh Harap",
    location: "Jakarta",
    tags: ["karir", "pertumbuhan"],
    media: [{ id: "m4", name: "curahan_harian.pdf", size: "842 KB", kind: "doc" }],
    reflections: [],
    coverGradient: "from-[#ffdbcc] to-[#f2edeb]",
    icon: "lock",
  },
  {
    id: "julian-5",
    title: "Janji Ulang Tahun Pernikahan ke-5",
    description:
      "Surat rahasia berisi janji cinta, montase video tahun pertama di pondok kayu, dan playlist lagu kenangan masa pacaran.",
    type: "TO_SOMEONE",
    status: "LOCKED",
    createdAt: "2023-11-04T09:00:00+07:00",
    unlockAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 312).toISOString(),
    timezone: "Asia/Jakarta",
    recipient: "Julian",
    content: "Untuk Julian — janji yang kutulis di malam hujan, tentang rumah kecil dan tawa yang tak pernah padam.",
    mood: "Cinta",
    location: "Ubud, Bali",
    tags: ["cinta", "keluarga"],
    media: [{ id: "m5", name: "pondok_montage.mp4", size: "48 MB", kind: "photo", preview: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80" }],
    reflections: [],
    coverGradient: "from-[#ffddb1] to-[#fce8cc]",
    icon: "favorite",
  },
  {
    id: "kyoto-trip",
    title: "Kapsul Dimsum Sahabat: Jejak Perjalanan Kyoto",
    description:
      "Kumpulan foto analog di Arashiyama, tiket kereta api yang dipindai, serta pesan rahasia yang saling ditulis saat malam musim gugur.",
    type: "SHARED",
    status: "LOCKED",
    createdAt: "2024-12-10T14:00:00+07:00",
    unlockAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 68).toISOString(),
    timezone: "Asia/Tokyo",
    contributors: ["Renata", "Theo", "Eleanor"],
    content: "Kyoto malam itu, daun momiji jatuh pelan. Kami bertiga berjanji membuka ini bersama saat reuni.",
    mood: "Nostalgia",
    location: "Kyoto, Jepang",
    tags: ["persahabatan", "kyoto"],
    media: [
      { id: "m6", name: "arashiyama_01.jpg", size: "4.1 MB", kind: "photo", preview: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600&q=80" },
      { id: "m7", name: "shinkansen_ticket.jpg", size: "1.2 MB", kind: "photo", preview: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80" },
    ],
    reflections: [],
    coverGradient: "from-[#b7ecee] to-[#e6f4f4]",
    icon: "group",
  },
  {
    id: "novel-milestone",
    title: "Ketika Novel Pertamaku Terbit",
    description:
      "Draf pertama bab pembuka, catatan kekecewaan dari penolakan penerbit, dan daftar ucapan terima kasih.",
    type: "MILESTONE",
    status: "LOCKED",
    createdAt: "2024-06-01T11:00:00+07:00",
    unlockAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 800).toISOString(),
    timezone: "Asia/Jakarta",
    content: "Bab 1 — Hujan pertama di Teuku Umar. Naskah ini kutanam seperti benih.",
    mood: "Berani",
    location: "Bandung",
    tags: ["karya", "impian"],
    media: [{ id: "m8", name: "draft_novel_ch1.pdf", size: "2.9 MB", kind: "doc" }],
    reflections: [],
    coverGradient: "from-[#e6e2df] to-[#f2edeb]",
    icon: "auto_stories",
  },
];

export const STORAGE_KEY = "chronicle-seal-capsules-v2";
export const REFLECTIONS_KEY = "chronicle-reflections-v2";

export function loadCapsules(): Capsule[] {
  if (typeof window === "undefined") return SEED_CAPSULES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CAPSULES));
      return SEED_CAPSULES;
    }
    const parsed = JSON.parse(raw) as Capsule[];
    // migrate: ensure reflections array
    return parsed.map((c) => ({ ...c, reflections: c.reflections ?? [] }));
  } catch {
    return SEED_CAPSULES;
  }
}

export function saveCapsules(capsules: Capsule[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(capsules));
}

export function addCapsule(capsule: Capsule) {
  const all = loadCapsules();
  const next = [capsule, ...all];
  saveCapsules(next);
  return next;
}

export function updateCapsule(id: string, patch: Partial<Capsule>) {
  const all = loadCapsules();
  const next = all.map((c) => (c.id === id ? { ...c, ...patch } : c));
  saveCapsules(next);
  return next;
}

export function isLocked(c: Capsule) {
  return new Date(c.unlockAt).getTime() > Date.now() && c.status !== "OPENED";
}

export function isReady(c: Capsule) {
  return new Date(c.unlockAt).getTime() <= Date.now() && c.status !== "OPENED";
}

export function formatUnlockAt(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

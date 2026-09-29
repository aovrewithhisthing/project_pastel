export function formatWIB(iso: string) {
  return new Date(iso).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "long", timeStyle: "short" }) + " WIB"
}
export function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return "baru saja"
  if (s < 3600) return `${Math.floor(s/60)} menit lalu`
  if (s < 86400) return `${Math.floor(s/3600)} jam lalu`
  return `${Math.floor(s/86400)} hari lalu`
}

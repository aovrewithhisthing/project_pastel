export default function Loading() {
  return <div className="mx-auto max-w-[1280px] px-6 py-20 flex flex-col gap-4">
    <div className="h-8 w-48 bg-[#e6e2df] rounded-full animate-pulse" />
    <div className="h-32 bg-white border border-[#e6e2df] rounded-2xl animate-pulse" />
    <div className="grid md:grid-cols-2 gap-4">
      <div className="h-40 bg-[#f7f3f0] rounded-2xl animate-pulse" />
      <div className="h-40 bg-[#f7f3f0] rounded-2xl animate-pulse" />
    </div>
  </div>
}

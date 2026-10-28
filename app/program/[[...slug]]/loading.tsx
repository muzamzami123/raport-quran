export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f8fbfe] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[#086288] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-medium">Memuat evaluasi santri...</p>
      </div>
    </div>
  );
}


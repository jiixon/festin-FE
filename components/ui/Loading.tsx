export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-neutral-800 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" />
        </div>
        <p className="text-neutral-400 text-sm">로딩 중...</p>
      </div>
    </div>
  );
}

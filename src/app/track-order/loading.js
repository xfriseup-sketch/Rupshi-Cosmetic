export default function TrackOrderLoading() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-[#fdf8f9]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-100 border-t-rose-600" />
        <p className="text-sm font-medium text-rose-600">Searching your order...</p>
      </div>
    </main>
  );
}

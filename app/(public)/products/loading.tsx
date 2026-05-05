export default function ProductsLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="h-72 animate-pulse rounded-lg border bg-gray-100" />
      ))}
    </div>
  );
}

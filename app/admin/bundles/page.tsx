import { prisma } from "@/lib/prisma";

export default async function AdminBundlesPage() {
  const bundles = await prisma.bundle.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Bundles & Promotions</h1>
      {bundles.map((bundle: { id: string; name: string; discount: number; isActive: boolean }) => (
        <div key={bundle.id} className="rounded border p-3">
          {bundle.name} - {bundle.discount}% - {bundle.isActive ? "Active" : "Inactive"}
        </div>
      ))}
    </section>
  );
}

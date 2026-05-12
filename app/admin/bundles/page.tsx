import AdminBundlesManager, { type BundleRow, type ProductOption } from "@/components/admin/AdminBundlesManager";
import { prisma } from "@/lib/prisma";

export default async function AdminBundlesPage() {
  const [bundles, products] = await Promise.all([
    prisma.bundle.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, price: true, isActive: true },
    }),
  ]);
  const bundleRows = JSON.parse(JSON.stringify(bundles)) as BundleRow[];
  const catalog = JSON.parse(JSON.stringify(products)) as ProductOption[];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-950">Bundles</h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-600">
          Tie real catalogue SKUs together with a bundle price, shopper-friendly copy, and legal terms. Existing percentage
          discounts stay visible for legacy records.
        </p>
      </div>
      <AdminBundlesManager bundles={bundleRows} catalog={catalog} />
    </section>
  );
}

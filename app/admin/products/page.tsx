import AdminProductsManager, { type AdminProduct } from "@/components/admin/AdminProductsManager";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  const serialised = JSON.parse(JSON.stringify(products)) as AdminProduct[];
  const normalised = serialised.map((p) => ({
    ...p,
    tags: Array.isArray(p.tags) ? p.tags : [],
  }));
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage products</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Add and edit the catalogue here. The shop only lists products with &quot;Show on storefront&quot; checked.
        </p>
      </div>
      <AdminProductsManager products={normalised} />
    </section>
  );
}

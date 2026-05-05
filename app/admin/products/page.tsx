import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Manage Products</h1>
      {products.map((product: { id: string; name: string; price: number; stock: number }) => (
        <div key={product.id} className="rounded border p-3">
          {product.name} - £{product.price.toFixed(2)} - Stock {product.stock}
        </div>
      ))}
    </section>
  );
}

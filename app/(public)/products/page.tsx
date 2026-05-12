import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import type { Product } from "@prisma/client";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: "low" | "high" };
}) {
  const where = searchParams.category ? { category: searchParams.category, isActive: true } : { isActive: true };
  const products = await prisma.product.findMany({
    where,
    orderBy: searchParams.sort === "high" ? { price: "desc" } : { price: "asc" },
  });
  const categories = await prisma.product.findMany({
    where: { isActive: true },
    distinct: ["category"],
    select: { category: true },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Products</h1>
      <form className="flex flex-wrap gap-2">
        <select name="category" defaultValue={searchParams.category || ""} className="rounded border p-2">
          <option value="">All categories</option>
          {categories.map((c: { category: string }) => (
            <option key={c.category} value={c.category}>
              {c.category}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={searchParams.sort || "low"} className="rounded border p-2">
          <option value="low">Price low to high</option>
          <option value="high">Price high to low</option>
        </select>
        <button className="rounded border border-[#006847] px-4 py-2 text-[#006847]" type="submit">
          Apply
        </button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

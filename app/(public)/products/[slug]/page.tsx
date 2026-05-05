import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} | Ready2Cook`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetails({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } });
  if (!product) notFound();
  const related = await prisma.product.findMany({
    where: { category: product.category, id: { not: product.id } },
    take: 3,
  });
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Image
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          width={700}
          height={550}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="rounded object-cover"
        />
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-[#C8102E] text-2xl font-semibold">£{product.price.toFixed(2)}</p>
          <p>{product.description}</p>
          <ProductCard product={product} />
        </div>
      </div>
      {related.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Related products</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((item: { id: string; name: string; slug: string; description: string; price: number; images: string[]; category: string; stock: number; isActive: boolean; createdAt: Date; updatedAt: Date }) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

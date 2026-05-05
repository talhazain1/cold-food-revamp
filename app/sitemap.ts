import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://ready2cook.co.uk";
  let products: { slug: string; updatedAt: Date }[] = [];
  try {
    products = await prisma.product.findMany({ select: { slug: true, updatedAt: true } });
  } catch {
    products = [];
  }
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/products`, lastModified: new Date() },
    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
}

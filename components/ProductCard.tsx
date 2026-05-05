"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@prisma/client";
import { useCart } from "@/components/cart-provider";

function stockBadge(stock: number) {
  if (stock <= 0) return <span className="bg-[#C8102E] text-white text-xs px-2 py-1 rounded">Out of Stock</span>;
  if (stock <= 5) return <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded">Low Stock</span>;
  return <span className="bg-[#006847] text-white text-xs px-2 py-1 rounded">In Stock</span>;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const image = product.images[0] || "/placeholder.svg";
  return (
    <div className="rounded-lg border bg-white p-3">
      <Link href={`/products/${product.slug}`}>
        <Image src={image} alt={product.name} width={400} height={300} sizes="(max-width: 768px) 100vw, 33vw" className="h-48 w-full rounded object-cover" />
      </Link>
      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="font-semibold">{product.name}</h3>
        {stockBadge(product.stock)}
      </div>
      <p className="mt-2 text-[#C8102E] font-bold">£{product.price.toFixed(2)}</p>
      <button
        type="button"
        disabled={product.stock <= 0}
        className="mt-3 w-full rounded-md bg-[#C8102E] px-3 py-2 text-white disabled:opacity-50"
        onClick={() =>
          addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            image,
            quantity: 1,
          })
        }
      >
        Add to Cart
      </button>
    </div>
  );
}

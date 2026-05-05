"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";

export default function CartPage() {
  const { items, total, removeItem } = useCart();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Cart</h1>
      {items.map((item) => (
        <article key={item.productId} className="flex gap-4 rounded border p-3">
          <Image src={item.image} alt={item.name} width={80} height={80} sizes="80px" className="rounded" />
          <div className="flex-1">
            <p className="font-semibold">{item.name}</p>
            <p>Qty: {item.quantity}</p>
          </div>
          <p>£{(item.price * item.quantity).toFixed(2)}</p>
          <button className="text-[#C8102E]" onClick={() => removeItem(item.productId)}>
            Remove
          </button>
        </article>
      ))}
      <p className="text-xl font-semibold">Total: £{total.toFixed(2)}</p>
      <Link href="/checkout" className="inline-block rounded bg-[#C8102E] px-5 py-2 text-white">
        Go to Checkout
      </Link>
    </section>
  );
}

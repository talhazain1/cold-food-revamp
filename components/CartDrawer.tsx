"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, total, removeItem } = useCart();
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white p-4 transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h2 className="text-xl font-semibold">Your Cart</h2>
        <div className="mt-4 space-y-3 overflow-y-auto max-h-[70vh]">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-3 rounded border p-2">
              <Image src={item.image} alt={item.name} width={70} height={70} sizes="70px" className="rounded object-cover" />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p>Qty: {item.quantity}</p>
                <p>£{(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <button type="button" onClick={() => removeItem(item.productId)} className="text-[#C8102E]">
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t pt-4">
          <p className="font-semibold">Total: £{total.toFixed(2)}</p>
          <Link href="/checkout" className="mt-2 inline-block w-full rounded bg-[#C8102E] px-4 py-2 text-center text-white">
            Proceed to Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}

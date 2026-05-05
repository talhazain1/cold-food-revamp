"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart-provider";

export default function Navbar({ onOpenCart }: { onOpenCart: () => void }) {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return (
    <nav className="bg-white border-b border-[#006847]/20">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-[#C8102E]">
          Ready2Cook
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/products" className="text-[#006847] font-medium">
            Products
          </Link>
          <Link href="/account" className="text-[#006847] font-medium">
            Account
          </Link>
          <button
            type="button"
            onClick={onOpenCart}
            className="relative inline-flex items-center rounded-md border border-[#006847] px-3 py-2 text-[#006847]"
          >
            <ShoppingCart size={18} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full bg-[#C8102E] px-1 text-xs text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

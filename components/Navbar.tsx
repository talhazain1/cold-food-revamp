"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, ShoppingCart, UserCircle, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";

const LANDING_IDS = [
  { label: "Why us", hash: "#why-us" },
  { label: "Experience", hash: "#experience" },
  { label: "Featured", hash: "#featured" },
  { label: "How it works", hash: "#how-it-works" },
  { label: "Reviews", hash: "#reviews" },
  { label: "FAQ", hash: "#faq" },
] as const;

export default function Navbar({ onOpenCart }: { onOpenCart: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isHome = pathname === "/";
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  function landingHref(hash: string) {
    return isHome ? hash : `/${hash}`;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#006847]/12 bg-[#fafdfb]/85 backdrop-blur-xl shadow-[0_1px_0_rgba(0,104,71,0.06)] supports-[backdrop-filter]:bg-[#fafdfb]/72">
      <nav aria-label="Primary" className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6 md:py-3.5">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 rounded-lg outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#006847]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#006847] to-[#004d34] text-white shadow-md shadow-[#006847]/25 ring-1 ring-white/20 transition group-hover:shadow-lg group-hover:shadow-[#006847]/30">
            <ShoppingBag className="h-[18px] w-[18px]" aria-hidden strokeWidth={2} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-[#0f172a]">Ready2Cook</span>
            <span className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-[#006847]/90 sm:block">
              Meal kits · UK
            </span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
          {LANDING_IDS.map(({ label, hash }) => (
            <Link
              key={hash}
              href={landingHref(hash)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#334155] transition hover:bg-[#006847]/8 hover:text-[#006847] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006847]"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            href="/products"
            className="hidden rounded-xl bg-[#006847] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#006847]/25 transition hover:bg-[#005238] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006847] sm:inline-flex sm:items-center sm:justify-center"
          >
            Shop
          </Link>
          <Link
            href="/account"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#006847]/22 bg-white text-[#006847] shadow-sm transition hover:border-[#006847]/35 hover:bg-[#006847]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006847]"
            aria-label={session?.user ? "My account" : "Account — sign in"}
            title={session?.user ? "My account" : "Sign in for your account"}
          >
            <UserCircle className="h-[20px] w-[20px]" aria-hidden strokeWidth={2} />
          </Link>
          <button
            type="button"
            onClick={onOpenCart}
            className="relative inline-flex h-10 items-center gap-2 rounded-xl border border-[#006847]/22 bg-white px-3 text-[#006847] shadow-sm transition hover:border-[#006847]/35 hover:bg-[#006847]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006847]"
          >
            <ShoppingCart className="h-[18px] w-[18px]" aria-hidden strokeWidth={2} />
            <span className="hidden text-sm font-semibold sm:inline">Basket</span>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C8102E] px-1 text-[11px] font-bold text-white ring-2 ring-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#006847]/18 text-[#006847] transition hover:bg-[#006847]/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006847] lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="border-t border-[#006847]/10 bg-[#fafdfb]/98 backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            <Link
              href="/products"
              className="flex items-center justify-center rounded-xl bg-[#006847] px-4 py-3 text-sm font-semibold text-white shadow-sm"
              onClick={() => setMobileOpen(false)}
            >
              Shop all products
            </Link>
            <div className="grid gap-0.5 pt-2">
              {LANDING_IDS.map(({ label, hash }) => (
                <Link
                  key={hash}
                  href={landingHref(hash)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#334155] hover:bg-[#006847]/10 hover:text-[#006847]"
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[#334155] hover:bg-[#006847]/10 hover:text-[#006847]"
                onClick={() => setMobileOpen(false)}
              >
                <UserCircle className="h-5 w-5 shrink-0 text-[#006847]" aria-hidden strokeWidth={2} />
                {session?.user ? "My account" : "Account / sign in"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

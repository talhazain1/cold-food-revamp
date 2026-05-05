"use client";

import { useState } from "react";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [openCart, setOpenCart] = useState(false);
  return (
    <>
      <Navbar onOpenCart={() => setOpenCart(true)} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
      <Footer />
      <CartDrawer open={openCart} onClose={() => setOpenCart(false)} />
    </>
  );
}

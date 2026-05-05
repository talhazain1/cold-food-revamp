import Link from "next/link";

export default function AdminSidebar({ pendingCount }: { pendingCount: number }) {
  return (
    <aside className="w-64 border-r p-4">
      <h2 className="text-xl font-bold text-[#C8102E]">Admin</h2>
      <nav className="mt-4 space-y-2">
        <Link className="block" href="/admin">
          Dashboard
        </Link>
        <Link className="block" href="/admin/products">
          Products
        </Link>
        <Link className="block" href="/admin/orders">
          Orders{" "}
          <span className="rounded bg-[#C8102E] px-2 py-0.5 text-xs text-white">{pendingCount}</span>
        </Link>
        <Link className="block" href="/admin/bundles">
          Bundles
        </Link>
        <Link className="block" href="/admin/delivery">
          Delivery
        </Link>
        <Link className="block" href="/admin/slider">
          Slider
        </Link>
        <Link className="block" href="/admin/customers">
          Customers
        </Link>
      </nav>
    </aside>
  );
}

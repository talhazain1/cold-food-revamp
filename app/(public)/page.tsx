import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <h1 className="text-4xl font-bold text-[#C8102E]">Fresh meal kits from Ready2Cook</h1>
      <p className="max-w-2xl text-lg text-gray-700">
        Discover premium ready-to-cook meals and pantry staples delivered across the UK.
      </p>
      <Link href="/products" className="inline-block rounded bg-[#C8102E] px-6 py-3 text-white">
        Shop Products
      </Link>
    </section>
  );
}

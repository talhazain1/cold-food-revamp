import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Clock,
  Leaf,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import type { Product } from "@prisma/client";

async function featuredProducts(): Promise<Product[]> {
  try {
    const inStock = await prisma.product.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      orderBy: { createdAt: "desc" },
      take: 4,
    });
    if (inStock.length > 0) return inStock;
    return await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    });
  } catch {
    return [];
  }
}

export default async function LandingContent() {
  const featured = await featuredProducts();

  return (
    <div className="space-y-14 pb-8 md:space-y-20 md:pb-12">
      <section
        id="hero"
        className="relative isolate min-h-[min(560px,calc(100vh-10rem))] scroll-mt-28 overflow-hidden rounded-3xl text-white shadow-xl lg:scroll-mt-32"
      >
        <div className="absolute inset-0">
          <Image
            src="/assets/hero.jpg"
            alt="Fresh pizzas and wine served outdoors on a wooden table"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#051a14]/80 via-[#061f18]/55 to-[#051a14]/88 md:bg-gradient-to-r md:from-[#051a14]/92 md:via-[#061f18]/68 md:to-[#051a14]/15"
            aria-hidden
          />
        </div>
        <div className="relative flex min-h-[min(560px,calc(100vh-10rem))] flex-col justify-end px-6 pb-12 pt-16 md:justify-center md:px-12 md:py-20 lg:px-14">
          <div className="mx-auto w-full max-w-xl text-center md:mx-0 md:text-left">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-amber-200" aria-hidden />
              UK-wide delivery · Restaurant-quality ingredients
            </p>
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-[2.75rem] lg:leading-[1.1]">
              Premium meal kits, ready when you are
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/90 md:text-lg">
              Curated recipes, pre-portioned produce, and chef-developed flavours — so you can cook something memorable
              tonight without the prep marathon.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center md:justify-start">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8102E] px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:bg-[#a50d26] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Shop the range
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-xl border border-white/45 bg-white/10 px-6 py-3.5 text-center text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Create an account
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/20 pt-8 text-center sm:flex sm:justify-center sm:gap-10 md:justify-start md:text-left">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-white/65">Prepared</dt>
                <dd className="mt-1 text-lg font-bold tabular-nums">Fresh</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-white/65">Coverage</dt>
                <dd className="mt-1 text-lg font-bold">UK delivery</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-white/65">Quality</dt>
                <dd className="mt-1 text-lg font-bold">Chef-led</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section
        id="why-us"
        className="grid scroll-mt-28 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:scroll-mt-32"
        aria-label="Why choose Ready2Cook"
      >
        {[
          {
            icon: Truck,
            title: "Reliable delivery",
            text: "Carefully packed and routed so ingredients arrive in great condition.",
          },
          {
            icon: Leaf,
            title: "Quality first",
            text: "We prioritise fresh produce and trusted suppliers for every box.",
          },
          {
            icon: Clock,
            title: "Time back",
            text: "Skip the shop and chop — most of our kits are on the table in under 40 minutes.",
          },
          {
            icon: ShieldCheck,
            title: "Straightforward",
            text: "Simple ordering, clear pricing, and support when you need it.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition hover:border-[#006847]/30 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#006847]/10 text-[#006847]">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="mt-4 text-base font-semibold text-gray-900">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
          </div>
        ))}
      </section>

      <section
        id="experience"
        className="scroll-mt-28 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200/90 md:grid md:grid-cols-2 md:items-stretch lg:scroll-mt-32"
      >
        <div className="relative aspect-[5/4] sm:aspect-[16/10] md:aspect-auto md:min-h-[22rem]">
          <Image
            src="/assets/pizza.jpg"
            alt="Fresh thin-crust pizza with melted mozzarella, tomato sauce, and basil"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col justify-center p-8 md:p-10 lg:p-14">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Restaurant moments, cooked at home
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            We obsess over sauces, toppings, and timing — the same details that make eating out memorable — then pack
            everything so you can nail the finish in your own kitchen.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8102E]" aria-hidden />
              Thin, crisp bases and generous cheese pulls without the guesswork
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#006847]" aria-hidden />
              Fresh herbs and produce picked to survive the journey to your door
            </li>
          </ul>
          <Link
            href="/products"
            className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#006847] underline-offset-4 hover:underline"
          >
            Explore the shop
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section id="featured" className="scroll-mt-28 space-y-8 lg:scroll-mt-32">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">Featured products</h2>
            <p className="mt-2 max-w-2xl text-gray-600">
              A snapshot of what&apos;s in stock now — tap through for full descriptions and allergens on each product page.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#006847] underline-offset-4 hover:underline"
          >
            View all products
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-14 text-center">
            <p className="text-gray-700">Our catalogue will appear here once products are available.</p>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#C8102E] hover:underline"
            >
              Browse the shop
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        )}
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-28 rounded-3xl bg-gradient-to-b from-gray-50 to-white px-6 py-12 ring-1 ring-gray-200/80 md:px-10 md:py-16 lg:scroll-mt-32"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">How it works</h2>
          <p className="mt-3 text-gray-600">Three steps from browse to a better dinner.</p>
        </div>
        <ol className="mx-auto mt-10 grid max-w-4xl gap-8 md:grid-cols-3">
          {[
            { step: "01", title: "Choose your meals", body: "Pick kits and pantry items that fit your week." },
            { step: "02", title: "Checkout securely", body: "Pay online and pick a delivery window that suits you." },
            { step: "03", title: "Cook & enjoy", body: "Follow the cards, plate up, and repeat next week." },
          ].map(({ step, title, body }) => (
            <li key={step} className="relative text-center md:text-left">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#C8102E] text-sm font-bold text-white">
                {step}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="reviews"
        className="scroll-mt-28 space-y-8 lg:scroll-mt-32"
        aria-labelledby="reviews-heading"
      >
        <div className="flex flex-col gap-2 text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#006847]">Loved nationwide</p>
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-end md:justify-between md:text-left">
            <div>
              <h2 id="reviews-heading" className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                What home cooks say
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-gray-600 md:mx-0">
                From busy weeknights to weekend gatherings — clarity, flavour, and less time lost to prep.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-gray-200/90 bg-white px-4 py-2 shadow-sm">
              <div className="flex text-amber-500" aria-hidden>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-current stroke-current" aria-hidden strokeWidth={0} />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-900">4.9 average</span>
              <span className="hidden text-xs text-gray-500 sm:inline">· thousands of deliveries</span>
            </div>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              quote:
                "The kit felt genuinely restaurant-grade — timings on the card were spot on and the sauce was unreal.",
              name: "Amelia R.",
              place: "Bristol",
            },
            {
              quote:
                "Finally a service that respects packaging and freshness. Arrived cold-chain solid; dinner was effortless.",
              name: "James T.",
              place: "Manchester",
            },
            {
              quote:
                "We rotate two kits a week now. Variety is strong and the allergens are upfront — huge for our family.",
              name: "Priya K.",
              place: "Edinburgh",
            },
          ].map(({ quote, name, place }) => (
            <figure
              key={name}
              className="group relative flex h-full flex-col rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition hover:border-[#006847]/25 hover:shadow-md"
            >
              <Quote
                className="absolute right-5 top-5 h-10 w-10 text-[#006847]/10 transition group-hover:text-[#006847]/18"
                aria-hidden
              />
              <blockquote className="relative z-[1] text-sm leading-relaxed text-gray-700">&ldquo;{quote}&rdquo;</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#006847]/15 to-[#C8102E]/10 text-sm font-bold text-[#006847] ring-2 ring-white">
                  {name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-gray-900">{name}</span>
                  <span className="text-xs font-medium text-gray-500">{place}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section
        id="faq"
        className="scroll-mt-28 rounded-3xl border border-gray-200/80 bg-gradient-to-b from-white via-[#fafdfb] to-white px-6 py-10 shadow-sm md:px-10 md:py-12 lg:scroll-mt-32"
        aria-labelledby="faq-heading"
      >
        <div className="mx-auto max-w-3xl text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#006847]">Questions</p>
          <h2 id="faq-heading" className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Everything you might want to know
          </h2>
          <p className="mt-3 text-gray-600">
            Clear answers upfront — order with confidence whether it&apos;s your first box or your tenth.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-gray-200/90 rounded-2xl border border-gray-200/80 bg-white px-3 py-1 shadow-inner shadow-gray-900/5">
          {[
            {
              q: "Where do you deliver in the UK?",
              a: "We ship nationwide with carriers selected for chilled handling. Checkout confirms your postcode and earliest available slots.",
            },
            {
              q: "How long do ingredients stay fresh?",
              a: "Each box lists use-by guidance. We pack to arrive cold and recommend refrigerating promptly — most kits shine within 48 hours.",
            },
            {
              q: "Can I see allergens before I buy?",
              a: "Yes. Every product page lists allergens and ingredients. If you need detail beyond the card, our support team can help before you order.",
            },
            {
              q: "What if something arrives damaged?",
              a: "Contact us with a quick photo. We replace or refund eligible issues because quality at your door is the whole point.",
            },
          ].map(({ q, a }) => (
            <details
              key={q}
              className="group border-0 px-3 py-1 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl py-4 pr-1 text-left text-sm font-semibold text-gray-900 transition hover:text-[#006847] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006847] md:text-base">
                <span>{q}</span>
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-[#006847] transition group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="pb-4 pl-0.5 text-sm leading-relaxed text-gray-600 md:pr-8">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section
        id="cta"
        className="relative scroll-mt-28 overflow-hidden rounded-3xl bg-[#C8102E] px-6 py-12 text-center text-white shadow-lg md:px-10 md:py-14 lg:scroll-mt-32"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(255,255,255,0.2),transparent_50%)]" aria-hidden />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold md:text-3xl">Ready to plan your next box?</h2>
          <p className="mt-3 text-white/90">
            Join customers across the UK who cook smarter with Ready2Cook — start with the range that&apos;s live today.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#C8102E] shadow-md transition hover:bg-gray-100 sm:w-auto"
            >
              Start shopping
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/50 bg-transparent px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

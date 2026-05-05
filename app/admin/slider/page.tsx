import { prisma } from "@/lib/prisma";

export default async function AdminSliderPage() {
  const items = await prisma.sliderItem.findMany({ orderBy: { order: "asc" } });
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Slider Management</h1>
      <div className="overflow-hidden rounded bg-[#C8102E] py-2 text-white">
        <p className="whitespace-nowrap">
          {items
            .filter((i: { isActive: boolean }) => i.isActive)
            .map((i: { text: string }) => i.text)
            .join("  •  ") || "No active slider items"}
        </p>
      </div>
      {items.map((item: { id: string; order: number; text: string; isActive: boolean }) => (
        <div key={item.id} className="rounded border p-3">
          #{item.order} {item.text} - {item.isActive ? "Active" : "Hidden"}
        </div>
      ))}
    </section>
  );
}

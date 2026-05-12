import AdminSliderManager, { type SliderRow } from "@/components/admin/AdminSliderManager";
import { prisma } from "@/lib/prisma";

export default async function AdminSliderPage() {
  const items = await prisma.sliderItem.findMany({ orderBy: { order: "asc" } });
  const serialised = JSON.parse(JSON.stringify(items)) as SliderRow[];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-950">Announcement slider</h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-600">
          The scarlet banner at the top of the public site scrolls through every active message in order. Pause a line by
          unchecking it instead of deleting seasonal copy you want later.
        </p>
      </div>
      <AdminSliderManager items={serialised} />
    </section>
  );
}

import { prisma } from "@/lib/prisma";

export default async function AnnouncementSlider() {
  const fallback = "Fresh meal kits delivered across the UK";
  let items: { text: string }[] = [];
  try {
    items = await prisma.sliderItem.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  } catch {
    /* PostgreSQL unreachable (e.g. Docker stopped) — keep the banner without crashing */
  }
  const text = items.map((i) => i.text).join("  •  ") || fallback;
  return (
    <div className="bg-[#C8102E] text-white overflow-hidden">
      <div className="whitespace-nowrap py-2 animate-[marquee_25s_linear_infinite]">
        <span className="mx-6">{text}</span>
        <span className="mx-6">{text}</span>
      </div>
    </div>
  );
}

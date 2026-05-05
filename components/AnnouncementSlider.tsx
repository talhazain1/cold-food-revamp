import { prisma } from "@/lib/prisma";

export default async function AnnouncementSlider() {
  const items = await prisma.sliderItem.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  const text = items.map((i) => i.text).join("  •  ") || "Fresh meal kits delivered across the UK";
  return (
    <div className="bg-[#C8102E] text-white overflow-hidden">
      <div className="whitespace-nowrap py-2 animate-[marquee_25s_linear_infinite]">
        <span className="mx-6">{text}</span>
        <span className="mx-6">{text}</span>
      </div>
    </div>
  );
}

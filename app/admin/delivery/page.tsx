import { prisma } from "@/lib/prisma";

export default async function AdminDeliveryPage() {
  const delivery = await prisma.deliverySettings.findFirst();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Delivery Settings</h1>
      <div className="rounded border p-3">
        <p>Express under 48h: £{(delivery?.under48h ?? 3.5).toFixed(2)}</p>
        <p>Standard 48-72h: £{(delivery?.between48and72h ?? 2.5).toFixed(2)}</p>
      </div>
    </section>
  );
}

import AdminDeliveryForm from "@/components/admin/AdminDeliveryForm";
import { prisma } from "@/lib/prisma";

export default async function AdminDeliveryPage() {
  const delivery = await prisma.deliverySettings.findFirst();
  const serialised = delivery ? JSON.parse(JSON.stringify(delivery)) : null;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-950">Delivery rates</h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-600">
          These feeds power the live checkout session. Updating a value instantly changes the next checkout; historical
          orders remain frozen with the fee they were quoted.
        </p>
      </div>
      <AdminDeliveryForm initial={serialised} />
    </section>
  );
}

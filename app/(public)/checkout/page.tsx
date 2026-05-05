import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");
  const settings =
    (await prisma.deliverySettings.findFirst()) ||
    ({
      under48h: 3.5,
      between48and72h: 2.5,
    } as const);

  return (
    <section className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <CheckoutForm under48h={settings.under48h} between48and72h={settings.between48and72h} />
    </section>
  );
}

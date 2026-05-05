"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DeliveryWindow } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useCart } from "@/components/cart-provider";

const schema = z.object({
  line1: z.string().min(3),
  city: z.string().min(2),
  postcode: z.string().min(3),
  deliveryWindow: z.nativeEnum(DeliveryWindow),
});

type FormValues = z.infer<typeof schema>;

export default function CheckoutForm({
  under48h,
  between48and72h,
}: {
  under48h: number;
  between48and72h: number;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const { items } = useCart();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { deliveryWindow: DeliveryWindow.BETWEEN_48_72H },
  });

  async function onSubmit(values: FormValues) {
    if (!session) return router.push("/auth/login");
    const res = await fetch("/api/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, items }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) return toast.error(data.error || "Checkout failed");
    window.location.href = data.url;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 rounded border p-4">
      <input placeholder="Address Line 1" className="w-full rounded border p-2" {...form.register("line1")} />
      <input placeholder="City" className="w-full rounded border p-2" {...form.register("city")} />
      <input placeholder="Postcode" className="w-full rounded border p-2" {...form.register("postcode")} />
      <select className="w-full rounded border p-2" {...form.register("deliveryWindow")}>
        <option value={DeliveryWindow.UNDER_48H}>Express (under 48h) - £{under48h.toFixed(2)}</option>
        <option value={DeliveryWindow.BETWEEN_48_72H}>Standard (48-72h) - £{between48and72h.toFixed(2)}</option>
      </select>
      <button type="submit" className="w-full rounded bg-[#C8102E] py-2 text-white">
        Pay with Stripe
      </button>
    </form>
  );
}

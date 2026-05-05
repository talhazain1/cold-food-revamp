"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z
  .object({
    name: z.string().min(2),
    phone: z.string().min(7),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((val) => val.password === val.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  async function onSubmit(values: z.infer<typeof schema>) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) return toast.error("Registration failed");
    toast.success("Account created");
    router.push("/auth/login");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-md space-y-3 rounded border p-4">
      <h1 className="text-2xl font-bold">Create account</h1>
      <input className="w-full rounded border p-2" placeholder="Full name" {...form.register("name")} />
      <input className="w-full rounded border p-2" placeholder="Contact number" {...form.register("phone")} />
      <input className="w-full rounded border p-2" placeholder="Email" {...form.register("email")} />
      <input className="w-full rounded border p-2" placeholder="Password" type="password" {...form.register("password")} />
      <input className="w-full rounded border p-2" placeholder="Confirm password" type="password" {...form.register("confirmPassword")} />
      <button className="w-full rounded bg-[#C8102E] py-2 text-white">Register</button>
    </form>
  );
}

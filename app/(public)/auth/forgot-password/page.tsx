"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export default function ForgotPasswordPage() {
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  async function onSubmit(values: z.infer<typeof schema>) {
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    toast.success("If the account exists, reset instructions were sent.");
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-md space-y-3 rounded border p-4">
      <h1 className="text-2xl font-bold">Forgot Password</h1>
      <input className="w-full rounded border p-2" placeholder="Email" {...form.register("email")} />
      <button className="w-full rounded bg-[#C8102E] py-2 text-white">Send Reset Link</button>
    </form>
  );
}

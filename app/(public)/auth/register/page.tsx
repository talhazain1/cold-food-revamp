"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      toast.error(body.error || "Sign up failed");
      return;
    }
    toast.success("Account created");
    router.push("/auth/login");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-md space-y-3 rounded border p-4">
      <h1 className="text-2xl font-bold">Sign up</h1>
      <p className="text-sm text-slate-600">Create your account with the details below.</p>
      <input className="w-full rounded border p-2" placeholder="Full name" {...form.register("name")} />
      {form.formState.errors.name && (
        <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
      )}
      <input className="w-full rounded border p-2" placeholder="Contact number" {...form.register("phone")} />
      {form.formState.errors.phone && (
        <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
      )}
      <input className="w-full rounded border p-2" placeholder="Email" type="email" autoComplete="email" {...form.register("email")} />
      {form.formState.errors.email && (
        <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
      )}
      <input
        className="w-full rounded border p-2"
        placeholder="Password"
        type="password"
        autoComplete="new-password"
        {...form.register("password")}
      />
      {form.formState.errors.password && (
        <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
      )}
      <input
        className="w-full rounded border p-2"
        placeholder="Confirm password"
        type="password"
        autoComplete="new-password"
        {...form.register("confirmPassword")}
      />
      {form.formState.errors.confirmPassword && (
        <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
      )}
      <button type="submit" className="w-full rounded bg-[#C8102E] py-2 text-white">
        Create account
      </button>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-[#006847] underline-offset-2 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

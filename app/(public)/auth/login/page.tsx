"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/** Relative in-app paths only — avoids open redirects. */
function safeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/account";
  return raw;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  async function onSubmit(values: z.infer<typeof schema>) {
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
      callbackUrl,
    });
    if (!result?.error) router.push(callbackUrl);
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-md space-y-3 rounded border p-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <input className="w-full rounded border p-2" placeholder="Email" {...form.register("email")} />
      <input className="w-full rounded border p-2" placeholder="Password" type="password" {...form.register("password")} />
      <button className="w-full rounded bg-[#C8102E] py-2 text-white">Login</button>
      <button type="button" className="w-full rounded border border-[#006847] py-2 text-[#006847]" onClick={() => signIn("google", { callbackUrl })}>
        Continue with Google
      </button>
      <button type="button" className="w-full rounded border border-[#006847] py-2 text-[#006847]" onClick={() => signIn("facebook", { callbackUrl })}>
        Continue with Facebook
      </button>
      <p className="text-center text-sm text-slate-600">
        New here?{" "}
        <Link href="/auth/signup" className="font-medium text-[#006847] underline-offset-2 hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}

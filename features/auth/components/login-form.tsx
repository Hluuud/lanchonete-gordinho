"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/features/auth/schema";
import { resolveLandingPath } from "@/lib/auth/landing-path";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** Formulário de login — email/senha via Supabase Auth, RLS decide o resto. */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setIsSubmitting(true);
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase.auth.signInWithPassword(values);
    if (error || !data.user) {
      toast.error("Email ou senha inválidos.");
      setIsSubmitting(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profile || !profile.is_active) {
      toast.error("Esta conta não tem acesso ao sistema.");
      await supabase.auth.signOut();
      setIsSubmitting(false);
      return;
    }

    const landingPath = resolveLandingPath(profile.role);
    const redirectParam = searchParams.get("redirect");
    const destination =
      redirectParam && redirectParam.startsWith(landingPath) ? redirectParam : landingPath;

    router.push(destination);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          autoFocus
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium">
          Senha
        </label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}

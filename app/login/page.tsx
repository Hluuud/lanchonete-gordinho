import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { resolveLandingPath } from "@/lib/auth/landing-path";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

/**
 * Login único para todos os papéis (loja não exige conta — só cozinha/admin).
 * Quem já está logado é redirecionado direto para seu painel.
 */
export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(resolveLandingPath(user.role));

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Entrar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesso da equipe — cozinha e painel administrativo.
        </p>

        <div className="mt-6">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

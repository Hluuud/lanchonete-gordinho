import { ChevronDown } from "lucide-react";

export function Hero({ tenantName }: { tenantName: string }) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent px-4 py-12 text-primary-foreground sm:py-16">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%)]"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-3">
        <p className="text-sm font-semibold tracking-wide uppercase opacity-90">
          Cardápio digital
        </p>
        <h1 className="text-4xl font-black tracking-tight text-balance sm:text-5xl">
          {tenantName}
        </h1>
        <p className="max-w-md text-base opacity-90 sm:text-lg">
          Peça em segundos. Sabor de verdade, entregue rápido.
        </p>
        <a
          href="#cardapio"
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-md transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          Ver cardápio
          <ChevronDown className="size-4" aria-hidden />
        </a>
      </div>
    </header>
  );
}

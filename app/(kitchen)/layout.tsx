/**
 * Identidade visual do Painel da Cozinha: alto contraste, escopada via `.dark`
 * (tokens já preparados em `styles/globals.css`) — não é modo escuro do
 * sistema, é a identidade fixa deste módulo (ver ADR 0007).
 *
 * Limitação conhecida: `Toaster` (sonner) e portais Radix montam no
 * `<body>`, fora desta subárvore — toasts/overlays da cozinha renderizam
 * com o tema claro. Registrado no BACKLOG.
 */
export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark flex min-h-dvh flex-1 flex-col bg-background text-foreground">
      {children}
    </div>
  );
}

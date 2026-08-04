/**
 * Ícones de Instagram/Facebook/WhatsApp desenhados à mão (stroke, 24x24,
 * estilo feather/lucide) — a versão instalada de `lucide-react` não exporta
 * ícones de marca (`Instagram`/`Facebook`/`Whatsapp` ausentes; confirmado via
 * `Object.keys(require('lucide-react'))`).
 */

type IconProps = {
  className?: string;
};

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/** Balão do WhatsApp com o fone dentro — substitui o `MessageCircle` genérico. */
export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-4.06-1.03L3 20l1.06-5.34A8.5 8.5 0 0 1 3 11.5 8.38 8.38 0 0 1 11.5 3 8.38 8.38 0 0 1 21 11.5z" />
      <path d="M9.2 8.6c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .6.5l.7 1.6c.1.2 0 .4-.1.6l-.4.5c-.1.2-.2.3 0 .6.2.4.7 1 1.2 1.4.6.5 1.1.7 1.4.8.2.1.4 0 .5-.1l.5-.6c.2-.2.3-.2.5-.1l1.5.7c.2.1.4.2.4.4 0 .3 0 .9-.3 1.3-.3.4-.9.7-1.5.7-1 0-2.6-.6-4-2-1.5-1.4-2.4-3.1-2.5-4-.1-.7.2-1.5.4-1.8z" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

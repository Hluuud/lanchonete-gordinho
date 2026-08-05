"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const REVEAL_DISTANCE_PX = 18;
const REVEAL_DURATION_S = 0.5;

/**
 * Entrada suave (fade + leve subida) quando a seção cruza a viewport.
 * `once: true` — a animação não repete ao rolar pra cima e voltar; sem
 * `prefers-reduced-motion`, entra direto no estado final, sem distância nem
 * duração. Wrapper genérico: quem usa decide o conteúdo, `Reveal` só decide
 * a entrada.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  role,
}: {
  children: ReactNode;
  /** Atraso em segundos, pra escalonar itens de uma lista (stagger). */
  delay?: number;
  className?: string;
  /** Passado direto ao `motion.div` — ex. `"listitem"` quando `Reveal` é o
   *  próprio item de uma lista `role="list"` (evita aninhar `<li>` dentro do
   *  `<div>` que o `Reveal` já é). */
  role?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      role={role}
      initial={{
        opacity: 0,
        y: prefersReducedMotion ? 0 : REVEAL_DISTANCE_PX,
      }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: prefersReducedMotion ? 0 : REVEAL_DURATION_S,
        delay: prefersReducedMotion ? 0 : delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

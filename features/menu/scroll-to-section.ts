/**
 * Rola suavemente até uma seção do cardápio, controlando o scroll via JS em
 * vez da navegação nativa de hash — o App Router do Next intercepta mudanças
 * de URL e cancela o smooth scroll nativo do navegador em alguns cenários
 * (reproduzido com a página no topo). `scroll-margin` das seções é respeitado.
 *
 * Mantém o hash na URL (replaceState) para deep-link/refresh sem empilhar
 * histórico a cada clique de categoria.
 */
export function scrollToSection(anchorId: string) {
  const element = document.getElementById(anchorId);
  if (!element) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  element.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
  history.replaceState(null, "", `#${anchorId}`);
}

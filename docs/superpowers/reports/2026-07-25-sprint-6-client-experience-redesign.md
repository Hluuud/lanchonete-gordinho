# Sprint Report — Sprint 6: Redesign da Experiência do Cliente

- **Data:** 2026-07-25
- **Branch:** `dev` (36 commits sobre `main`, base `6212599`, topo `fff3234`)
- **Escopo:** Frontend-only, área do cliente (storefront público). Nenhuma
  alteração em banco, Supabase, `services/`, `repositories/`, checkout,
  carrinho, realtime, painel administrativo, painel da cozinha, impressão
  ou QR Code — confirmado em todos os 5 reviews finais de fase.
- **Roadmap:** `docs/superpowers/specs/2026-07-24-client-experience-redesign-design.md`

## Resumo executivo

Objetivo da sprint: transformar a área do cliente de "cardápio digital" pra
uma experiência de hamburgueria de verdade — sidebar redesenhada, Home com
Hero, seções institucionais (Sobre Nós/Contato/Footer), cardápio com
sensação de catálogo premium, e uma faixa de Promoções. Executado em 5
fases sequenciais, cada uma com spec → plano → implementação
subagent-driven → review de task + review final de branch → documentação.
Todas as 5 fases foram aprovadas sem findings Critical ou Important nos
reviews finais.

## Mudanças de UX por fase

### Fase 1 — Sidebar + Fundamentos
- Sidebar redesenhada: cabeçalho com slogan, botão "Peça Agora" (rola até
  `#cardapio`), rodapé de contato compartilhado (`StoreContactFooter`)
  entre sidebar desktop e drawer mobile — WhatsApp/Instagram/Facebook,
  telefone, endereço ("Como chegar"), status de horário em tempo real.
- Dados reais de contato centralizados (`features/menu/contact-info.ts`) e
  horário de funcionamento corrigido (terça-domingo 13:00–00:00).

### Fase 2 — Home / Hero
- Nova seção `#home`: headline, subtítulo, CTAs "Ver Cardápio"/"Fazer
  Pedido", placeholder de mídia (gradiente + ícone) com prop `videoUrl`
  já preparada para vídeo real futuro.
- "Home" vira primeiro item de navegação (sidebar + drawer).

### Fase 3 — Sobre Nós / Contato / Footer
- `#sobre`: história, missão, qualidade dos ingredientes, especialidade da
  casa (texto aprovado como rascunho), grid de 3 itens, placeholders de
  imagem.
- `#contato`: mapa do Google embutido (iframe, sem chave de API),
  endereço/telefone/horário/redes sociais, botão "Como chegar".
- Rodapé institucional (`StoreFooter`, uma vez só): Empresa/Contato/Links
  úteis/Redes sociais/Direitos autorais (CNPJ real, ano dinâmico).
- "Sobre Nós" e "Contato" viram 2º/3º itens de navegação.

### Fase 4 — Cardápio Premium
- `ProductCard`: imagem mais alta (`aspect-4/3`), hover com leve
  "levantada" 3D.
- `MenuSection`: cabeçalho de categoria mais forte (ícone maior, título
  `font-black`, separador `border-b`).
- Novo cabeçalho de nav "Cardápio" (ícone `UtensilsCrossed`) acima da
  lista de categorias.

### Fase 5 — Promoções
- Faixa full-width `#promocoes` entre Home e Cardápio: gradiente
  laranja/preto, ícone `Sparkles`, título/subtítulo, CTA "Ver Cardápio".
- Banner único estático (sem carrossel, sem lib nova), sem item de nav
  próprio.

## Componentes novos

| Componente | Fase | Responsabilidade |
|---|---|---|
| `StoreContactFooter` | 1 | Rodapé de contato compartilhado (sidebar + drawer) |
| `StoreHero` | 2 | Seção `#home`: headline, CTAs, placeholder de mídia |
| `StoreAbout` | 3 | Seção `#sobre`: institucional |
| `StoreContactSection` | 3 | Seção `#contato`: mapa, dados, horário |
| `StoreFooter` | 3 | Rodapé institucional de página (uma vez) |
| `StorePromoBanner` | 5 | Faixa `#promocoes`: banner de destaque |
| `social-icons.tsx` (`InstagramIcon`/`FacebookIcon`) | 1 | Ícones de marca desenhados à mão (lucide-react não tem) |

Componentes existentes modificados: `store-sidebar.tsx`,
`store-mobile-nav.tsx` (nav incremental por fase), `store-experience.tsx`
(orquestração), `product-card.tsx`, `menu-section.tsx` (polimento visual).

## Impacto de performance

- **Nenhuma chamada nova ao Supabase** — todo o trabalho é renderização de
  dados já carregados no servidor; nenhum componente novo busca dado
  próprio.
- **Nenhuma dependência nova instalada** — carrossel de Promoções foi
  deliberadamente descartado por não haver lib no projeto (decisão
  registrada na Fase 5); ícones de marca faltantes foram desenhados à mão
  em vez de puxar um pacote de ícones de marca.
- Placeholders de mídia (Hero, Sobre Nós) são gradiente CSS + ícone, não
  imagens — zero peso de rede até fotos reais serem adicionadas.
- Mapa do Contato usa iframe do Google Maps sem chave de API (`?output=embed`).

## Decisões arquiteturais

- **Restrição repetida e sempre confirmada com o usuário:** dado real que
  existe no banco mas não é mapeado pelo `service`/`repository` público do
  storefront (`is_bestseller`, `promo_price_cents`, `promoBannerUrl`) foi
  tratado como fora de escopo em toda fase que tocou o assunto (Fases 1, 4,
  5) — nunca resolvido "por conta própria" tocando a camada de dados sem
  autorização explícita.
- **Nav incremental sem link morto:** cada seção nova (Home, Sobre Nós,
  Contato, cabeçalho Cardápio) só entra na sidebar/drawer quando a seção
  já existe de verdade no DOM — mesmo padrão em todas as fases.
- **YAGNI consciente:** cabeçalho "Cardápio" (Fase 4) e banner de
  Promoções (Fase 5) não ganharam lógica de estado ativo/`aria-current`
  própria — decisão explícita registrada nos specs, evitando abstração
  antecipada.
- **Hydration-safety reusado:** toda exibição de horário "agora" (Contato,
  Fase 3) reaproveitou o padrão `useSyncExternalStore` já estabelecido por
  `StoreOpenBadge`, em vez de reimplementar.
- **ADR 0007 respeitado:** paleta laranja (`:root`/módulo store) mantida
  em 100% dos componentes novos.

## Documentação atualizada

- `CHANGELOG.md` — 1 entrada "Sprint 6 (Fase N)" por fase (5 entradas).
- `BACKLOG.md` — achados de review e pendências conscientes por fase
  (dado real não mapeado, verificação visual em navegador indisponível,
  texto institucional como rascunho, ícones de marca faltantes).
- 5 specs em `docs/superpowers/specs/` + 5 planos em
  `docs/superpowers/plans/` (um par por fase).
- Nenhum ADR novo foi necessário — nenhuma decisão desta sprint alterou
  arquitetura de dados/backend (todas as decisões relevantes já cobertas
  pelo ADR 0007 existente).

## Limitação conhecida (recorrente em todas as 5 fases)

Sem ferramenta de automação de navegador disponível nesta sessão. Toda
verificação foi feita via build/typecheck/lint/testes + fetch de HTML real
do dev server (confirmando classes/textos/ordem no DOM), nunca interação
real (clique/scroll/hover). Registrado no BACKLOG desde a Fase 1;
recomenda-se conferência manual em navegador/dispositivo antes ou logo
após o merge de `dev` para `main`.

## Definition of Done — checklist

| Item | Status |
|---|---|
| Documentação (`docs/`) atualizada | ✅ 5 specs + 5 planos |
| `CHANGELOG.md` atualizado | ✅ 5 entradas |
| `BACKLOG.md` atualizado | ✅ achados + pendências por fase |
| Graphify atualizado | ⚠️ não executado nesta sessão — recomenda-se rodar `/graphify` sobre `features/menu/` antes do merge, per CLAUDE.md |
| ADR criado/atualizado quando necessário | ✅ nenhum necessário (nenhuma decisão de arquitetura de dados nesta sprint) |
| Build | ✅ verde em todas as 5 fases (última verificação: Fase 5, `npm run build` exit 0) |
| Typecheck | ✅ verde em todas as 5 fases |
| Lint | ✅ verde em todas as 5 fases |
| Testes | ✅ 99/99 (nenhum teste novo introduzido — todas as fases são JSX/CSS puro sobre lógica já coberta; testes de `contact-info.ts`/`store-info.ts` da Fase 1 seguem passando) |
| Revisão crítica | ✅ 5 reviews finais de branch (Opus), 0 findings Critical/Important em todos |
| Sprint Report | ✅ este documento |
| Commit seguindo Conventional Commits | ✅ 36 commits, todos `feat(menu):`/`fix(menu):`/`docs:` |

## Estatísticas da branch

- 36 commits (`6212599..fff3234`)
- 26 arquivos alterados, +3612/−29 linhas
- 7 componentes novos, 5 componentes existentes modificados
- 0 dependências npm novas
- 0 chamadas novas ao Supabase

## Pendências registradas no BACKLOG (não bloqueiam merge)

- Dado real não mapeado pelo storefront público: `promoBannerUrl`,
  `is_bestseller`/`promo_price_cents`, contato (telefone/redes/endereço
  ainda vêm de constante frontend, não de `tenants`).
- Texto institucional (Sobre Nós) é rascunho aprovado, não revisado pelo
  lojista.
- `useScrollSpy` sem teste unitário próprio.
- Ícone de WhatsApp genérico (`MessageCircle`), não de marca.
- Verificação visual real em navegador pendente (limitação de ambiente).
- Duplicação cosmética de `SOCIAL_LINK_CLASS` entre 2 arquivos.

## Próximo passo sugerido

Rodar `/graphify` sobre o projeto pra sincronizar o segundo cérebro com os
7 componentes novos e as decisões desta sprint (per CLAUDE.md, obrigatório
ao fim de sprint/fase relevante), depois decidir entre merge `dev` → `main`
ou nova rodada de verificação manual em navegador antes do merge.

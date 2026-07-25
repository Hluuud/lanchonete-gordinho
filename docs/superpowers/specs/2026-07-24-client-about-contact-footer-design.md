# Redesign da Experiência do Cliente — Fase 3: Sobre Nós / Contato / Footer — Design

- **Data:** 2026-07-24
- **Escopo:** Frontend-only, área do cliente. Continuação das Fases 1
  (Sidebar) e 2 (Home/Hero), já implementadas e revisadas em `dev` — ver
  `docs/superpowers/specs/2026-07-24-client-experience-redesign-design.md`
  para o roadmap completo.
- **Fora de escopo (não alterar):** banco, Supabase, `services/`,
  `repositories/`, checkout, carrinho (lógica), realtime, painel
  administrativo, painel da cozinha, impressão, QR Code.

## Objetivo

Fechar o conteúdo institucional da loja: quem é a Lanchonete do Gordinho
(Sobre Nós), como chegar até ela (Contato, com mapa embutido) e um rodapé
de página com os links/contatos essenciais — completando a navegação
Home/Cardápio/Sobre Nós/Contato da sidebar.

## Contexto levantado

- Todos os dados reais de contato já existem em
  `features/menu/contact-info.ts` (Fase 1): `ADDRESS`, `PHONE_DISPLAY`,
  `PHONE_TEL_LINK`, `WHATSAPP_LINK`, `INSTAGRAM_LINK`, `FACEBOOK_LINK`,
  `EMAIL`, `CNPJ`, `MAPS_LINK`. Horário real em `BUSINESS_HOURS`/
  `getStoreOpenState` (`features/menu/store-info.ts`).
- `StoreContactFooter` (Fase 1) é compacto, pensado pra coluna de 300px da
  sidebar — não é reaproveitado aqui; a seção Contato ganha layout próprio,
  mais rico, consumindo as mesmas constantes.
- `features/menu/social-icons.tsx` (Fase 1) já tem `InstagramIcon`/
  `FacebookIcon` desenhados à mão — reaproveitados no Footer.
- `SLOGAN` ("Sabor que aquece, feito com carinho") hoje é uma constante
  local em `store-sidebar.tsx` — o Footer também precisa dela. Move para
  `contact-info.ts` (mesmo arquivo que já centraliza identidade/contato) e
  `store-sidebar.tsx` passa a importar de lá — evita duplicar a string em
  dois arquivos.
- Mapa: sem chave de API, usando o formato de embed público do Google Maps
  (`https://www.google.com/maps?q=<endereço codificado>&output=embed`) —
  chamada externa ao Google, não ao Supabase, não viola "sem chamada nova
  ao Supabase". Novo export `MAPS_EMBED_LINK` em `contact-info.ts`, mesmo
  padrão de derivação de `MAPS_LINK`.
- Navegação incremental sem link morto (mesmo padrão da Fase 2): "Sobre
  Nós" e "Contato" só entram na sidebar/drawer porque as seções passam a
  existir de verdade nesta fase.

## Decisões

1. **Conteúdo de "Sobre Nós" é rascunho aprovado nesta sessão** (não
   placeholder cinza, texto de verdade, mas editável depois):
   - Texto: "A Lanchonete do Gordinho nasceu da paixão por lanches de
     verdade e do carinho em atender bem. Há anos servimos a comunidade de
     Analândia com ingredientes selecionados, porções generosas e aquele
     atendimento que faz todo mundo se sentir em casa. Do clássico
     X-Burger às porções pra compartilhar, cada lanche sai na hora, feito
     com capricho — porque pra gente, mais que lanches, a ideia é criar
     momentos."
   - Grid de 3 itens (ícone + título curto + descrição curta): Missão
     ("Servir com carinho" / "Cada pedido preparado pra você se sentir em
     casa"), Qualidade ("Ingredientes selecionados" / "Sempre frescos,
     escolhidos com cuidado"), Especialidade ("Feito na hora" /
     "Hambúrgueres e porções montados no pedido, sem pressa").
   - Tempo de mercado: frase sem número inventado — "Há anos servindo
     Analândia com o mesmo capricho."
2. **Fotos do ambiente/lanches:** nenhuma existe ainda — mesmo tratamento
   do placeholder do Hero (gradiente + ícone, sem foto de banco de
   imagens), pronto para substituição futura por imagem real.
3. **Mapa embutido (iframe), não só link:** `<iframe>` com
   `MAPS_EMBED_LINK`, `loading="lazy"`, `title` descritivo — mais fiel ao
   pedido original ("Mostrar: Mapa") do que só um botão.
4. **Seção Contato tem layout próprio**, não reaproveita
   `StoreContactFooter` — consome as mesmas constantes de
   `contact-info.ts`/`store-info.ts`, sem duplicar dado, só o componente
   visual é novo (cards maiores + mapa, adequados a uma seção larga de
   página em vez de uma coluna estreita).
5. **"Links úteis" do Footer são âncoras da própria página** (Home /
   Cardápio / Sobre Nós / Contato) — não inventa página inexistente
   (política de privacidade, termos de uso).
6. **Footer aparece uma única vez**, como última seção da página (depois
   de Contato) — não é repetido por seção nem duplicado na sidebar.
7. **Direitos autorais com ano dinâmico** (`new Date().getFullYear()`) +
   CNPJ real, evita ficar desatualizado.

## Arquivos (detalhe de implementação)

### Alterado: `features/menu/contact-info.ts`

- Novo export `SLOGAN` (movido de `store-sidebar.tsx`).
- Novo export `MAPS_EMBED_LINK`, derivado de `ADDRESS` (mesmo padrão de
  `MAPS_LINK`).

### Alterado: `features/menu/components/store-sidebar.tsx`

- Remove a constante local `SLOGAN`, passa a importar de `contact-info.ts`.
- Adiciona "Sobre Nós" e "Contato" como 2º/3º itens estáticos da nav
  (depois de "Home", antes da lista de categorias) — mesma mecânica da
  Fase 2 (`useScrollSpy` recebe `["home", "sobre", "contato", ...sections]`).

### Alterado: `features/menu/components/store-mobile-nav.tsx`

- Adiciona os mesmos dois botões estáticos "Sobre Nós"/"Contato" no
  Drawer, mesma mecânica de `goToHome` (novos handlers `goToSobre`/
  `goToContato`).

### Novo: `features/menu/components/store-about.tsx`

Sem `"use client"` própria (sem hooks, sem handler de evento) —
`<section id="sobre">`: texto institucional, grid de 3 itens, 2
placeholders de imagem (ambiente/lanches). Nota de arquitetura: como é
renderizado a partir de `StoreExperience` (que já é `"use client"`), roda
no client de qualquer forma — a ausência de `"use client"` aqui só
significa "este arquivo não usa nada exclusivo de client", não que ganhe
tratamento de Server Component de fato nesta árvore.

### Novo: `features/menu/components/store-contact-section.tsx`

Mesma observação do item acima — sem `"use client"` própria (links são
`<a>` normais, sem handler). `<section id="contato">`: iframe do mapa +
cards de endereço/telefone/WhatsApp/Instagram/Facebook/horário + botão
"Como chegar" (`MAPS_LINK`).

### Novo: `features/menu/components/store-footer.tsx`

Mesma observação. 4 colunas (Empresa/Contato/Links úteis/Redes sociais) +
linha de direitos autorais. Links úteis usam `<a href="#id">` simples (sem
`onClick`/`scrollToSection`) — aceita o salto direto do navegador em vez
do scroll suave; é o fim da página, a diferença importa menos aqui do que
na navegação principal, e evita depender de JS só para esses links.

### Alterado: `features/menu/components/store-experience.tsx`

Import de `StoreAbout`, `StoreContactSection`, `StoreFooter`. Renderiza,
nesta ordem, depois do conteúdo existente de `#cardapio`: `<StoreAbout
/>`, `<StoreContactSection />`, `<StoreFooter />`.

## Testes / validação

Sem lógica pura nova além dos dois novos exports derivados em
`contact-info.ts` (`SLOGAN` é só realocação, `MAPS_EMBED_LINK` é derivação
— mesmo padrão testável de `MAPS_LINK`, adiciona um teste em
`contact-info.test.ts`). Resto é composição visual — validação por
build/typecheck/lint/`npm test` + fetch de HTML real do dev server (mesmo
padrão da Fase 2), já que verificação de interação em navegador segue
indisponível nesta sessão (limitação já aceita, registrada no BACKLOG).

## Riscos / limitações conhecidas

- Texto de "Sobre Nós" é rascunho aprovado nesta sessão, baseado no tom já
  usado pelo próprio usuário nas referências visuais fornecidas — troca
  futura é só editar a constante, sem impacto estrutural.
- Iframe do Google Maps é uma chamada de rede a `google.com` no client —
  não é Supabase, mas é uma dependência externa nova (antes não existia
  nenhum iframe de terceiro na loja); `loading="lazy"` evita que ele
  bloqueie o carregamento inicial da página.
- Mesma limitação de verificação visual em navegador já registrada nas
  Fases 1-2.

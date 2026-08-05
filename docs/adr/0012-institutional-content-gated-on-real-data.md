# ADR 0012 — Conteúdo institucional condicionado a dado real

- **Status:** Aceito
- **Data:** 2026-08-05
- **Contexto da fase:** Sprint 8, Fases 3-6 (Conteúdo Visual)

## Contexto

A Sprint 8 pediu três seções institucionais novas — destaques da casa,
galeria de fotos e depoimentos de clientes — além de uma linha do tempo
dentro do "Sobre Nós". Nenhuma delas tem material real disponível hoje:
não há fotos da fachada/ambiente/equipe, não há avaliação de cliente
coletada, não há data de fundação registrada.

O projeto já tinha um princípio implícito de "honestidade da UI" nas
sprints anteriores — o cardápio nunca mostra preço promocional que o
checkout não vai honrar, nunca inventa timer de contagem regressiva sem
campanha real, nunca lista "Combos"/"Mais Vendidos" sem dado de banco por
trás (`docs/frontend.md`, seção "Seções"). Esta ADR estende o mesmo
princípio para conteúdo institucional (fotos, depoimentos, marcos
históricos) e o registra explicitamente, porque a partir daqui várias
seções da loja passam a ser condicionais, não apenas os itens de um grid.

Opções consideradas para as seções sem material:

1. **Placeholder textual explícito** ("Em breve: nossa galeria de fotos").
2. **Dado de exemplo, claramente identificado** ("depoimento ilustrativo").
3. **Estrutura pronta + constante vazia; a seção simplesmente não
   renderiza** até existir dado real.

## Decisão

Adotar **(3)** para Galeria, Depoimentos e Linha do Tempo:

- `features/menu/gallery.ts` → `GALLERY_ITEMS: GalleryItem[] = []`,
  `hasGallery()`.
- `features/menu/testimonials.ts` → `TESTIMONIALS: Testimonial[] = []`,
  `hasTestimonials()`.
- `features/menu/about-content.ts` → `ABOUT_TIMELINE: AboutTimelineEntry[] = []`,
  `hasTimeline()`.

Cada componente (`StoreGallery`, `StoreTestimonials`, o bloco de linha do
tempo em `StoreAbout`) chama a guarda correspondente e retorna `null` (ou
simplesmente não renderiza o bloco) quando vazio. **A navegação segue a
mesma regra**: `features/menu/nav.ts` passou de um array fixo
(`STORE_NAV_ITEMS`) para `buildStoreNavItems({ hasGallery,
hasTestimonials })` — "Galeria" e "Depoimentos" só aparecem no menu quando
a seção existe de fato no DOM, mesmo contrato que já valia para as
categorias reais do cardápio (`docs/frontend.md`, "Navegação da loja").

Consequências das alternativas recusadas:

- **(1)** ainda promete algo ("em breve") sem compromisso real, e o texto
  vira lixo assim que o material chegar (alguém tem que lembrar de trocar).
- **(2)** é a mais tentadora — mostra o design final — mas publica conteúdo
  fabricado (nome, foto, nota de estrela de gente que não existe) numa
  página comercial. O risco de alguém esquecer de trocar "depoimento
  ilustrativo" por um real, ou de um cliente confundir aquilo com uma
  avaliação verdadeira, supera o valor de visualização antecipada.

## Detalhes que a decisão carrega

**A galeria pode ter placeholder gráfico, a seção em si não.** O Hero e o
"Sobre Nós" já tratavam a ausência de foto com um placeholder visual
elegante (gradiente + ícone) em vez de escrever "sem foto" — esse padrão
continua valendo *dentro* de uma seção que já existe por outro motivo
(o Hero sempre existe; ele decide entre vídeo/pôster/placeholder). A
diferença aqui é a seção inteira: Galeria/Depoimentos/Linha do tempo só
existem no DOM quando há pelo menos um item real.

**Isso é reversível por design, não uma lacuna a preencher com código.**
Preencher `GALLERY_ITEMS`, `TESTIMONIALS` ou `ABOUT_TIMELINE` com dados
reais é a única ação necessária — a seção, a entrada de navegação e o
scroll spy passam a existir automaticamente, sem tocar em nenhum
componente.

**Precedente para futuras seções condicionais.** Qualquer seção nova cujo
conteúdo dependa de material que a casa ainda não tem deve seguir o mesmo
padrão: guarda pura e testável (`hasX()`), componente que não renderiza
vazio, item de navegação derivado — não uma flag manual esquecida em algum
lugar.

## Consequências

- Três seções da Sprint 8 nascem "invisíveis" em produção até o lojista
  fornecer o material — esperado, e registrado no `BACKLOG.md`.
- `STORE_NAV_ITEMS` deixou de ser um array estático; qualquer novo
  consumidor deve importar a constante (já resolvida) e não recalcular a
  lista por conta própria.
- Testes de cada guarda (`gallery.test.ts`, `testimonials.test.ts`,
  `about-content.test.ts`) fixam o comportamento "vazio → oculto" como
  contrato, não como acidente do estado atual dos dados.

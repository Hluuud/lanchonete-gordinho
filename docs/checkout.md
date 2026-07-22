# Checkout, Criação de Pedidos e Acompanhamento

Sprint 3. Fecha a Fase 1 do roadmap (o checkout era a peça que faltava desde
a Sprint 1) e conecta a loja ao Painel da Cozinha (Sprint 2) com pedidos
reais em vez de seed.

## Fluxo

```
Carrinho (features/cart, Sprint 1)
  → /checkout (tipo de pedido, nome opcional, observação)
  → POST /api/checkout
  → services/checkout.service.ts → repositories/orders.repository.ts
  → RPC create_order (Postgres, atômica — ver ADR 0005/0006)
  → redireciona para /pedido/[id]
  → Realtime atualiza o status ao vivo (mesmo mecanismo do Painel da Cozinha)
```

## Decisões

### Confirmação e acompanhamento são a mesma página

`/pedido/[id]` serve tanto de destino imediato pós-checkout (com o resumo
completo + QR Code) quanto de alvo do QR Code para acompanhamento contínuo.
Decisão minha, não pedida explicitamente no prompt da sprint (que descreve
"Página de confirmação" e "Acompanhamento do pedido" como seções
separadas) — optei por uma página só para não duplicar a renderização de
resumo/itens/total em dois lugares. Se o produto precisar de uma tela de
confirmação visualmente distinta (ex.: sem o stepper de status, focada só em
"pedido enviado com sucesso"), é uma mudança localizada nesse componente, não
uma re-arquitetura.

### `id` do pedido é a própria credencial de acesso

Não existe um "código" de acompanhamento separado — a URL usa o UUID do
pedido diretamente. Mesmo modelo de links de acompanhamento de
pedido/pagamento usado amplamente no mercado (a entropia do UUID é a
autorização). Ver `docs/security.md` para o raciocínio completo de por que
isso é seguro aqui e o que especificamente foi feito para não vazar PII.

### QR Code gerado no servidor

`lib/checkout/qr-code.ts` (pacote `qrcode`) gera um data URL PNG a partir da
própria URL da página de acompanhamento. Desacoplado da UI de propósito —
trocar `toDataURL` por `toBuffer` no futuro alimenta impressão térmica
(ESC/POS) sem tocar em nenhum componente.

### `customer_phone` não é coletado nesta sprint

O formulário de checkout só pede nome (opcional). `customer_phone`
permanece no schema (nullable), reservado para uma futura notificação via
WhatsApp — reduz a superfície de PII coletada sem fechar a porta para o
futuro.

## Máquina de estados e regra de negócio

Toda transição de status continua exclusivamente através de
`lib/kitchen/order-status.ts` (Sprint 2) — o checkout não introduz uma nova
máquina de estados, só cria pedidos sempre no status inicial `new`. A
mudança de status (aceitar, iniciar preparo, etc.) continua sendo
responsabilidade exclusiva do Painel da Cozinha.

## Segurança

- **Preço nunca vem do client.** `features/checkout/schema.ts` nem aceita um
  campo de preço — `create_order` sempre lê `products.price_cents`.
- **Validação em duas camadas:** Zod na borda (forma dos dados) + a função
  Postgres revalida tudo que importa de verdade (produto existe/publicado/
  disponível, quantidade positiva, pedido não vazio) — nunca confia que o
  Zod já bastou.
- **`create_order` é `SECURITY DEFINER`**, executável por `anon` — é assim
  que um convidado sem papel de staff consegue criar um pedido com
  segurança (a própria função é o portão de escrita confiável, não uma
  policy de RLS de insert). Ver ADR 0006 e `docs/security.md`.
- **Tracking público sem PII:** `order_tracking_status` (espelho de
  `orders`, sincronizado por trigger) e `order_items` são as únicas tabelas
  com RLS pública — nenhuma das duas carrega nome/telefone/observação do
  cliente. `orders` continua 100% staff-only.

## Lacuna crítica encontrada e corrigida nesta sprint

Ao testar o Realtime da página de acompanhamento, descobriu-se que **nenhuma
tabela estava na publicação `supabase_realtime`** (`pg_publication_tables`
vazio) — ou seja, `postgres_changes` nunca entregou um evento sequer no
projeto, nem para o Painel da Cozinha (Sprint 2). Isso só não foi detectado
antes porque a verificação da Sprint 2 usou dados mocados, sem exercitar uma
mudança real no banco. Corrigido em `0010_realtime_publication.sql`
(`orders` e `order_tracking_status` adicionadas à publicação) e verificado
manualmente ponta a ponta nesta sessão (mudança de status via SQL refletida
ao vivo na página, sem reload).

## Limitações conhecidas

- Sem endereço de entrega ou número de mesa (`dine_in`/`delivery` são
  selecionáveis, mas sem os campos complementares — "estrutura preparada"
  conforme pedido, não implementação completa).
- Sem rate limiting em `/api/checkout` — já era um risco anunciado em
  `docs/security.md` desde a Sprint 1 ("entram junto das fases que
  introduzem escrita pelo cliente"); esta é essa fase, e o rate limiting em
  si ainda não foi implementado (`BACKLOG.md`).
- Sem teste de concorrência real do `create_order` (exigiria um Postgres de
  teste dedicado, que o projeto não tem) — verificado manualmente via MCP
  (números sequenciais corretos, rejeição de itens inválidos/pedido vazio),
  não como teste automatizado repetível.
- `/pedido/[id]` inexistente cai no 404 padrão do Next.js, sem um
  `not-found.tsx` customizado para esta rota (existe um customizado só em
  `(store)`).

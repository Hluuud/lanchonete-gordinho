# ADR 0008 — Supabase Storage para imagens (produtos, logo, banners)

- **Status:** Aceito
- **Data:** 2026-07-22
- **Contexto da fase:** Sprint 5, Fase 0 (Fundação compartilhada dos CRUDs administrativos)

## Contexto

Até aqui, `products.image_url` era um campo de texto livre — quem populava dados (seed, futuramente um admin) colava a URL de uma imagem já hospedada em outro lugar. A Sprint 5 introduz upload real de imagem no admin (produto, logo da loja, banners), e é a primeira vez que o projeto precisa armazenar arquivos binários enviados pelo usuário.

Opções consideradas:

1. **Supabase Storage** (parte do próprio stack, já provisionado).
2. **Serviço externo de storage/CDN** (ex. Cloudinary, S3 direto).
3. **Continuar só com campo de URL**, sem upload de arquivo — usuário hospeda a imagem em outro lugar e cola o link.

## Decisão

Adotar **(1) Supabase Storage**: um único bucket público `store-assets`, com convenção de path `{tenant_id}/products/...` e `{tenant_id}/branding/...`, autorizado por RLS em `storage.objects` reusando os mesmos helpers de autorização já existentes (`is_tenant_manager`, `is_super_admin`).

## Justificativa

- **`CLAUDE.md` já lista Supabase Storage como parte do stack oficial** — não é uma dependência nova, é ativar uma capacidade do provider já em uso (evita (2), que introduziria uma segunda conta/serviço/chave de API só para isto).
- **RLS de Storage é o mesmo modelo mental já usado em todas as tabelas**: `storage.objects` é uma tabela normal do ponto de vista de RLS, então as policies de escrita são literalmente o mesmo formato de `categories_write`/`products_write` (`is_tenant_manager(tenant) or is_super_admin()`), só trocando a origem do `tenant_id` (de uma coluna para o primeiro segmento do path). Zero conceito novo para quem já entende o RLS do projeto.
- **(3) foi descartado por decisão explícita do usuário** ao aprovar o plano da Sprint 5 — um ERP comercial precisa de upload real, não só colar link; a opção de URL crua ficava dependente de o lojista já ter a imagem hospedada em algum lugar (atrito real de uso).
- **Bucket único em vez de um por finalidade** (produtos/logo/banners): o path (`{tenant_id}/products/...` vs. `{tenant_id}/branding/...`) já separa por finalidade sem precisar de infraestrutura (buckets) extra; um bucket a mais não traria isolamento adicional já que a policy de RLS é a real barreira de autorização, não o bucket em si.

## Consequências

- **Convenção de path é a âncora da autorização** — todo código que faz upload (`components/image-upload.tsx`) precisa necessariamente prefixar o path com o `tenant_id` correto; um path malformado (sem o `tenant_id` como primeiro segmento) é rejeitado pela policy, então o pior caso de um bug no client é "upload falha", nunca "upload vaza para outro tenant".
- **`(storage.foldername(name))[1])::uuid`**: se alguém tentasse manipular o path para não ser um UUID válido, o cast lançaria um erro de sintaxe do Postgres em vez de um "403" limpo — aceito como trade-off: a escrita continua não autorizada nesse caso (não é uma falha de segurança), só o erro reportado ao client é menos amigável. Como o único caminho de escrita hoje é o próprio `ImageUpload`, que sempre monta o path a partir do `tenant_id` real do usuário logado, esse caso não ocorre em uso normal.
- **Bucket público**: qualquer pessoa com a URL de um arquivo consegue lê-lo, sem autenticação — aceitável porque são sempre imagens de vitrine (produto/logo/banner), nunca dado sensível; mesmo nível de exposição que o cardápio público já tem hoje.
- **Sem redimensionamento/otimização de imagem no upload** — o arquivo é salvo como enviado (até 5 MB, PNG/JPEG/WebP validados no client); `next/image` já otimiza no lado da entrega (resize/formato) via `remotePatterns` configurado para `*.supabase.co`. Se o tamanho de armazenamento virar problema, registrar no BACKLOG uma etapa de compressão no upload.

## Revisão

Reavaliar se surgir necessidade de mídia privada (ex. documentos fiscais, comprovantes) — nesse caso um bucket **não-público** com policy de leitura também restrita seria o padrão a seguir, não uma extensão deste bucket público.

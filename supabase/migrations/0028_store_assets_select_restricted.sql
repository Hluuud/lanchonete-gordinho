-- =============================================================================
-- 0028 — Restringe o SELECT de storage.objects em store-assets
-- Sprint 5.5, Fase 6 (revisão de segurança).
--
-- Achado do Supabase Advisor ("Public Bucket Allows Listing"):
-- `store_assets_select_public` (0011) permitia `anon`/`authenticated`
-- listarem TODOS os arquivos do bucket via `.list()`/consulta a
-- `storage.objects` — inclusive de outros tenants (o bucket é
-- compartilhado, path-prefixado por tenant_id). Isso nunca foi necessário:
-- o bucket já é `public: true` em `storage.buckets`, o que já libera
-- busca de um objeto por URL conhecida (`getPublicUrl()`) SEM precisar de
-- nenhuma policy de RLS em `storage.objects` — essa policy só controlava
-- `list`/consultas via API, não o fetch direto do arquivo.
--
-- `components/image-upload.tsx` (único consumidor de Storage no client)
-- só usa `.upload()` e `getPublicUrl()` (string pura, sem RLS) — nenhum
-- código depende de listar o bucket publicamente.
-- =============================================================================

drop policy store_assets_select_public on storage.objects;

create policy store_assets_select_manager on storage.objects
  for select using (
    bucket_id = 'store-assets'
    and (
      public.is_tenant_manager(((storage.foldername(name))[1])::uuid)
      or public.is_super_admin()
    )
  );

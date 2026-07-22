-- =============================================================================
-- 0011 — Bucket de Storage para assets da loja (produtos, logo, banners)
-- Primeira vez que o projeto usa Supabase Storage. Ver ADR 0008.
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('store-assets', 'store-assets', true)
on conflict (id) do nothing;

-- Leitura pública: imagens de produto/logo/banner sempre foram públicas
-- (mesmo nível de confiança que `products.image_url`, que já aceitava
-- qualquer URL pública antes de existir upload).
create policy store_assets_select_public on storage.objects
  for select using (bucket_id = 'store-assets');

-- Escrita restrita à gestão do tenant dono do primeiro segmento do path
-- (convenção: "{tenant_id}/products/...", "{tenant_id}/branding/...").
-- Mesmo formato de `categories_write`/`products_write` (0002), só que o
-- tenant vem do path em vez de uma coluna.
create policy store_assets_insert on storage.objects
  for insert with check (
    bucket_id = 'store-assets'
    and (
      public.is_tenant_manager(((storage.foldername(name))[1])::uuid)
      or public.is_super_admin()
    )
  );

create policy store_assets_update on storage.objects
  for update using (
    bucket_id = 'store-assets'
    and (
      public.is_tenant_manager(((storage.foldername(name))[1])::uuid)
      or public.is_super_admin()
    )
  );

create policy store_assets_delete on storage.objects
  for delete using (
    bucket_id = 'store-assets'
    and (
      public.is_tenant_manager(((storage.foldername(name))[1])::uuid)
      or public.is_super_admin()
    )
  );

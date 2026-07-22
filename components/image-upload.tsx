"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageOff, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const STORE_ASSETS_BUCKET = "store-assets";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

/**
 * Upload de imagem para o Supabase Storage (bucket `store-assets`, migration
 * `0011_store_assets_bucket.sql`). `pathPrefix` deve começar com o
 * `tenant_id` do usuário logado — as políticas de Storage exigem isso para
 * autorizar a escrita (ver ADR 0008).
 */
export function ImageUpload({
  value,
  onChange,
  pathPrefix,
  label = "Imagem",
  aspectClassName = "aspect-square",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  pathPrefix: string;
  label?: string;
  aspectClassName?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Formato não suportado. Envie PNG, JPEG ou WebP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("Arquivo muito grande. O limite é 5 MB.");
      return;
    }

    setIsUploading(true);
    try {
      const extension = file.name.split(".").pop() ?? "jpg";
      const path = `${pathPrefix}/${crypto.randomUUID()}.${extension}`;

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.storage
        .from(STORE_ASSETS_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;

      const { data } = supabase.storage
        .from(STORE_ASSETS_BUCKET)
        .getPublicUrl(path);
      onChange(data.publicUrl);
    } catch {
      toast.error("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "relative flex w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted",
            aspectClassName,
          )}
        >
          {value ? (
            <Image src={value} alt="" fill className="object-cover" sizes="112px" />
          ) : (
            <ImageOff className="size-6 text-muted-foreground" aria-hidden />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="size-4" aria-hidden />
            )}
            {value ? "Trocar imagem" : "Enviar imagem"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUploading}
              onClick={() => onChange(null)}
            >
              <X className="size-4" aria-hidden />
              Remover
            </Button>
          )}
          <p className="text-xs text-muted-foreground">PNG, JPEG ou WebP, até 5 MB.</p>
        </div>
      </div>
    </div>
  );
}

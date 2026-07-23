"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BusinessHoursEditor } from "@/features/admin/store-settings/components/business-hours-editor";
import {
  storeSettingsInputSchema,
  type StoreSettingsInput,
} from "@/features/admin/store-settings/schema";
import { useUpdateStoreSettings } from "@/features/admin/store-settings/use-store-settings-mutation";
import type { AdminStoreSettings } from "@/types/domain";

const STORE_MODE_LABELS: Record<AdminStoreSettings["storeMode"], string> = {
  open: "Aberto",
  closed: "Fechado",
  vacation: "Férias",
  maintenance: "Manutenção",
};

function toFormValues(settings: AdminStoreSettings): StoreSettingsInput {
  return {
    name: settings.name,
    phone: settings.phone ?? "",
    whatsapp: settings.whatsapp ?? "",
    instagram: settings.instagram ?? "",
    facebook: settings.facebook ?? "",
    address: settings.address ?? "",
    logoUrl: settings.logoUrl,
    bannerUrl: settings.bannerUrl,
    promoBannerUrl: settings.promoBannerUrl,
    primaryColor: settings.primaryColor ?? "",
    secondaryColor: settings.secondaryColor ?? "",
    welcomeMessage: settings.welcomeMessage ?? "",
    closingMessage: settings.closingMessage ?? "",
    avgPrepTimeMinutes: settings.avgPrepTimeMinutes,
    storeMode: settings.storeMode,
    businessHours: (settings.businessHours as Record<string, { open: string; close: string } | null> | null) ?? {},
  };
}

export function StoreSettingsForm({ settings, tenantId }: { settings: AdminStoreSettings; tenantId: string }) {
  const mutation = useUpdateStoreSettings();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreSettingsInput>({
    resolver: zodResolver(storeSettingsInputSchema),
    defaultValues: toFormValues(settings),
  });

  function onSubmit(values: StoreSettingsInput) {
    mutation.mutate(values, {
      onSuccess: () => toast.success("Configurações salvas."),
      onError: (error: Error) => toast.error(error.message),
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-3xl flex-col gap-8 p-4 sm:p-6">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Identidade</h2>
        <div>
          <label htmlFor="settings-name" className="mb-1.5 block text-sm font-medium">
            Nome da loja
          </label>
          <Input id="settings-name" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <Controller
          control={control}
          name="logoUrl"
          render={({ field }) => (
            <ImageUpload
              value={field.value ?? null}
              onChange={field.onChange}
              pathPrefix={`${tenantId}/branding`}
              label="Logo"
            />
          )}
        />
        <Controller
          control={control}
          name="bannerUrl"
          render={({ field }) => (
            <ImageUpload
              value={field.value ?? null}
              onChange={field.onChange}
              pathPrefix={`${tenantId}/branding`}
              label="Banner principal"
              aspectClassName="aspect-video"
            />
          )}
        />
        <Controller
          control={control}
          name="promoBannerUrl"
          render={({ field }) => (
            <ImageUpload
              value={field.value ?? null}
              onChange={field.onChange}
              pathPrefix={`${tenantId}/branding`}
              label="Banner promocional"
              aspectClassName="aspect-video"
            />
          )}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Contato</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="settings-phone" className="mb-1.5 block text-sm font-medium">
              Telefone
            </label>
            <Input id="settings-phone" {...register("phone")} />
          </div>
          <div>
            <label htmlFor="settings-whatsapp" className="mb-1.5 block text-sm font-medium">
              WhatsApp
            </label>
            <Input id="settings-whatsapp" {...register("whatsapp")} />
          </div>
          <div>
            <label htmlFor="settings-instagram" className="mb-1.5 block text-sm font-medium">
              Instagram
            </label>
            <Input id="settings-instagram" placeholder="@usuario" {...register("instagram")} />
          </div>
          <div>
            <label htmlFor="settings-facebook" className="mb-1.5 block text-sm font-medium">
              Facebook
            </label>
            <Input id="settings-facebook" {...register("facebook")} />
          </div>
        </div>
        <div>
          <label htmlFor="settings-address" className="mb-1.5 block text-sm font-medium">
            Endereço
          </label>
          <Textarea id="settings-address" rows={2} {...register("address")} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Horário de funcionamento</h2>
        <Controller
          control={control}
          name="businessHours"
          render={({ field }) => (
            <BusinessHoursEditor value={field.value} onChange={field.onChange} />
          )}
        />
        <div className="max-w-xs">
          <label htmlFor="settings-prep-time" className="mb-1.5 block text-sm font-medium">
            Tempo médio de preparo (min)
          </label>
          <Controller
            control={control}
            name="avgPrepTimeMinutes"
            render={({ field }) => (
              <Input
                id="settings-prep-time"
                type="number"
                min={0}
                placeholder="Calculado automaticamente se vazio"
                value={field.value ?? ""}
                onChange={(event) =>
                  field.onChange(event.target.value === "" ? null : Number(event.target.value))
                }
              />
            )}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Aparência</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="settings-primary-color" className="mb-1.5 block text-sm font-medium">
              Cor principal
            </label>
            <Input id="settings-primary-color" placeholder="#f97316" {...register("primaryColor")} />
            {errors.primaryColor && (
              <p className="mt-1 text-xs text-destructive">{errors.primaryColor.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="settings-secondary-color" className="mb-1.5 block text-sm font-medium">
              Cor secundária
            </label>
            <Input id="settings-secondary-color" placeholder="#111111" {...register("secondaryColor")} />
            {errors.secondaryColor && (
              <p className="mt-1 text-xs text-destructive">{errors.secondaryColor.message}</p>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="settings-welcome" className="mb-1.5 block text-sm font-medium">
            Mensagem inicial
          </label>
          <Textarea id="settings-welcome" rows={2} {...register("welcomeMessage")} />
        </div>
        <div>
          <label htmlFor="settings-closing" className="mb-1.5 block text-sm font-medium">
            Mensagem final (confirmação de pedido)
          </label>
          <Textarea id="settings-closing" rows={2} {...register("closingMessage")} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Modo da loja</h2>
        <div className="max-w-xs">
          <Controller
            control={control}
            name="storeMode"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STORE_MODE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Fora de &ldquo;Aberto&rdquo;, a loja aparece fechada no cardápio, independente do horário.
          </p>
        </div>
      </section>

      <Button type="submit" size="lg" className="self-start" disabled={mutation.isPending}>
        {mutation.isPending ? "Salvando..." : "Salvar configurações"}
      </Button>
    </form>
  );
}

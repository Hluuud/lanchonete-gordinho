"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  PRINTER_CONNECTION_LABELS,
  PRINTER_ROLE_LABELS,
} from "@/features/admin/printers/labels";
import {
  PRINTER_CONNECTION_TYPES,
  PRINTER_PAPER_WIDTHS,
  PRINTER_ROLES,
  printerInputSchema,
  type PrinterFormValues,
  type PrinterInput,
} from "@/features/admin/printers/schema";
import {
  useCreatePrinter,
  useUpdatePrinter,
} from "@/features/admin/printers/use-printer-mutations";
import type { AdminPrinter } from "@/types/domain";

const EMPTY_VALUES: PrinterFormValues = {
  name: "",
  role: "kitchen",
  connectionType: "usb",
  paperWidth: "80mm",
  protocol: "escpos",
  ipAddress: "",
  port: null,
  model: "",
  autoPrint: false,
  allowReprint: true,
  isActive: true,
};

function toFormValues(printer: AdminPrinter): PrinterFormValues {
  return {
    name: printer.name,
    role: printer.role,
    connectionType: printer.connectionType,
    paperWidth: printer.paperWidth,
    protocol: printer.protocol,
    ipAddress: printer.ipAddress ?? "",
    port: printer.port,
    model: printer.model ?? "",
    autoPrint: printer.autoPrint,
    allowReprint: printer.allowReprint,
    isActive: printer.isActive,
  };
}

/** Um único dialog para criar/editar — `printer: null` = modo criação. */
export function PrinterFormDialog({
  open,
  onOpenChange,
  printer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printer: AdminPrinter | null;
}) {
  const router = useRouter();
  const isEditing = printer !== null;
  const createMutation = useCreatePrinter();
  const updateMutation = useUpdatePrinter();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrinterFormValues, unknown, PrinterInput>({
    resolver: zodResolver(printerInputSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) reset(printer ? toFormValues(printer) : EMPTY_VALUES);
  }, [open, printer, reset]);

  const connectionType = useWatch({ control, name: "connectionType" });
  const isNetwork = connectionType === "network";

  function onSubmit(values: PrinterInput) {
    const promise = isEditing
      ? updateMutation.mutateAsync({ id: printer.id, input: values })
      : createMutation.mutateAsync(values);

    promise
      .then(() => {
        toast.success(isEditing ? "Impressora atualizada." : "Impressora criada.");
        onOpenChange(false);
        router.refresh();
      })
      .catch((error: Error) => toast.error(error.message));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar impressora" : "Nova impressora"}</DialogTitle>
          <DialogDescription>
            Só persiste a configuração — a impressão real (ESC/POS) é uma evolução futura.
          </DialogDescription>
        </DialogHeader>

        <form
          id="printer-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1"
        >
          <div>
            <label htmlFor="printer-name" className="mb-1.5 block text-sm font-medium">
              Nome
            </label>
            <Input id="printer-name" placeholder="Impressora da cozinha" {...register("name")} autoFocus />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="printer-role" className="mb-1.5 block text-sm font-medium">
                Setor
              </label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="printer-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRINTER_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {PRINTER_ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <label htmlFor="printer-connection" className="mb-1.5 block text-sm font-medium">
                Conexão
              </label>
              <Controller
                control={control}
                name="connectionType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="printer-connection" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRINTER_CONNECTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {PRINTER_CONNECTION_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {isNetwork && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="printer-ip" className="mb-1.5 block text-sm font-medium">
                  Endereço IP
                </label>
                <Input id="printer-ip" placeholder="192.168.0.50" {...register("ipAddress")} />
                {errors.ipAddress && (
                  <p className="mt-1 text-xs text-destructive">{errors.ipAddress.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="printer-port" className="mb-1.5 block text-sm font-medium">
                  Porta
                </label>
                <Input
                  id="printer-port"
                  type="number"
                  min={1}
                  max={65535}
                  placeholder="9100"
                  {...register("port", {
                    setValueAs: (value) => (value === "" ? null : Number(value)),
                  })}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="printer-paper-width" className="mb-1.5 block text-sm font-medium">
                Largura do papel
              </label>
              <Controller
                control={control}
                name="paperWidth"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="printer-paper-width" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRINTER_PAPER_WIDTHS.map((width) => (
                        <SelectItem key={width} value={width}>
                          {width}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <label htmlFor="printer-model" className="mb-1.5 block text-sm font-medium">
                Modelo
              </label>
              <Input id="printer-model" placeholder="Epson TM-T20" {...register("model")} />
            </div>
          </div>

          <div>
            <label htmlFor="printer-protocol" className="mb-1.5 block text-sm font-medium">
              Protocolo
            </label>
            <Input id="printer-protocol" {...register("protocol")} />
            {errors.protocol && (
              <p className="mt-1 text-xs text-destructive">{errors.protocol.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Impressão automática</p>
              <p className="text-xs text-muted-foreground">
                Imprime assim que um pedido novo chegar (quando a impressão real existir).
              </p>
            </div>
            <Controller
              control={control}
              name="autoPrint"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Permite reimpressão</p>
            </div>
            <Controller
              control={control}
              name="allowReprint"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Ativa</p>
              <p className="text-xs text-muted-foreground">
                Desative para remover temporariamente do uso sem excluir.
              </p>
            </div>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" form="printer-form" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

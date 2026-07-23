"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import { ADMIN_ROLE_LABELS } from "@/features/admin/role-labels";
import {
  ASSIGNABLE_ROLES,
  userInviteSchema,
  type UserInviteInput,
} from "@/features/admin/users/schema";
import { useInviteUser } from "@/features/admin/users/use-user-mutations";

const EMPTY_VALUES: UserInviteInput = {
  email: "",
  fullName: "",
  role: "waiter",
};

/** Convida um novo usuário do tenant — dispara o email de definição de senha (ver ADR 0009). */
export function UserInviteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const inviteMutation = useInviteUser();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserInviteInput>({
    resolver: zodResolver(userInviteSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) reset(EMPTY_VALUES);
  }, [open, reset]);

  function onSubmit(values: UserInviteInput) {
    const payload: UserInviteInput = {
      ...values,
      fullName: values.fullName?.trim() || null,
    };

    inviteMutation
      .mutateAsync(payload)
      .then(() => {
        toast.success("Convite enviado — o usuário recebe um email para definir a senha.");
        onOpenChange(false);
        router.refresh();
      })
      .catch((error: Error) => toast.error(error.message));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar usuário</DialogTitle>
          <DialogDescription>
            O usuário recebe um email para definir a senha e acessar com o papel escolhido.
          </DialogDescription>
        </DialogHeader>

        <form
          id="user-invite-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div>
            <label htmlFor="user-email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <Input id="user-email" type="email" {...register("email")} autoFocus />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="user-full-name" className="mb-1.5 block text-sm font-medium">
              Nome
            </label>
            <Input id="user-full-name" {...register("fullName")} />
          </div>

          <div>
            <label htmlFor="user-role" className="mb-1.5 block text-sm font-medium">
              Papel
            </label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="user-role" className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNABLE_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ADMIN_ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="mt-1 text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={inviteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" form="user-invite-form" disabled={inviteMutation.isPending}>
            {inviteMutation.isPending ? "Enviando..." : "Enviar convite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

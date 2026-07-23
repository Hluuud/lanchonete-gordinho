"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCog } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminListPagination } from "@/features/admin/components/admin-list-pagination";
import { AdminListToolbar } from "@/features/admin/components/admin-list-toolbar";
import type { Paginated } from "@/features/admin/pagination";
import { ADMIN_ROLE_LABELS } from "@/features/admin/role-labels";
import { UserInviteDialog } from "@/features/admin/users/components/user-invite-dialog";
import { ASSIGNABLE_ROLES } from "@/features/admin/users/schema";
import { useUpdateUser } from "@/features/admin/users/use-user-mutations";
import type { AdminUser } from "@/types/domain";
import type { UserRole } from "@/types/database.types";

/**
 * Papel/ativação são editados inline (Select/Switch), sem um segundo dialog
 * de edição — são os únicos campos editáveis depois do convite, um dialog
 * a mais seria complexidade sem ganho de UX.
 */
export function UsersManager({
  result,
  currentUserId,
}: {
  result: Paginated<AdminUser>;
  currentUserId: string;
}) {
  const router = useRouter();
  const updateMutation = useUpdateUser();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  function handleRoleChange(user: AdminUser, role: UserRole) {
    setPendingId(user.id);
    updateMutation.mutate(
      { id: user.id, input: { role: role as (typeof ASSIGNABLE_ROLES)[number] } },
      {
        onSuccess: () => {
          toast.success("Papel atualizado.");
          setPendingId(null);
          router.refresh();
        },
        onError: (error: Error) => {
          toast.error(error.message);
          setPendingId(null);
        },
      },
    );
  }

  function handleActiveChange(user: AdminUser, isActive: boolean) {
    setPendingId(user.id);
    updateMutation.mutate(
      { id: user.id, input: { isActive } },
      {
        onSuccess: () => {
          toast.success(isActive ? "Usuário reativado." : "Usuário desativado.");
          setPendingId(null);
          router.refresh();
        },
        onError: (error: Error) => {
          toast.error(error.message);
          setPendingId(null);
        },
      },
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <AdminListToolbar
        searchPlaceholder="Buscar por nome ou email..."
        createLabel="Convidar usuário"
        onCreate={() => setInviteOpen(true)}
      />

      {result.items.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Nenhum usuário encontrado"
          description="Convide o primeiro membro da equipe."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ativo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((user) => {
                const isSelf = user.id === currentUserId;
                const isRowPending = pendingId === user.id && updateMutation.isPending;

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.fullName ?? "Sem nome cadastrado"}
                        </span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        disabled={isSelf || isRowPending}
                        onValueChange={(value) => handleRoleChange(user, value as UserRole)}
                      >
                        <SelectTrigger size="sm" aria-label={`Papel de ${user.fullName ?? user.email}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSIGNABLE_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {ADMIN_ROLE_LABELS[role]}
                            </SelectItem>
                          ))}
                          {user.role === "super_admin" && (
                            <SelectItem value="super_admin">
                              {ADMIN_ROLE_LABELS.super_admin}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "success" : "outline"}>
                        {user.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                      {isSelf && (
                        <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={user.isActive}
                        disabled={isSelf || isRowPending}
                        aria-label={`Ativar/desativar ${user.fullName ?? user.email}`}
                        onCheckedChange={(checked) => handleActiveChange(user, checked)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AdminListPagination page={result.page} totalPages={result.totalPages} />

      <UserInviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}

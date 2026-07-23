import {
  BarChart3,
  ClipboardList,
  Layers,
  Layers3,
  LayoutDashboard,
  Printer,
  Settings,
  Tags,
  TicketPercent,
  UserCog,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Tem página funcional além do placeholder "Em breve". */
  ready: boolean;
};

/**
 * Menu do Painel Administrativo. `ready` reflete o estado real de cada
 * página nesta sprint — atualizar junto ao entregar a implementação (não
 * antes), para o menu nunca prometer algo que ainda não existe.
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, ready: true },
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    icon: ClipboardList,
    ready: true,
  },
  {
    href: "/admin/produtos",
    label: "Produtos",
    icon: UtensilsCrossed,
    ready: true,
  },
  { href: "/admin/categorias", label: "Categorias", icon: Tags, ready: true },
  {
    href: "/admin/adicionais",
    label: "Adicionais",
    icon: Layers,
    ready: true,
  },
  { href: "/admin/combos", label: "Combos", icon: Layers3, ready: true },
  { href: "/admin/clientes", label: "Clientes", icon: Users, ready: false },
  {
    href: "/admin/cupons",
    label: "Cupons",
    icon: TicketPercent,
    ready: false,
  },
  {
    href: "/admin/relatorios",
    label: "Relatórios",
    icon: BarChart3,
    ready: false,
  },
  {
    href: "/admin/configuracoes",
    label: "Configurações",
    icon: Settings,
    ready: true,
  },
  {
    href: "/admin/impressoras",
    label: "Impressoras",
    icon: Printer,
    ready: false,
  },
  {
    href: "/admin/funcionarios",
    label: "Funcionários",
    icon: UserCog,
    ready: false,
  },
];

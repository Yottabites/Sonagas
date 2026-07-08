import {
  LayoutDashboard,
  FileBadge,
  Boxes,
  Truck,
  BarChart3,
  ShieldCheck,
  Store,
  type LucideIcon,
  User,
} from 'lucide-react'
import { PerfilUtilizador } from '../core/services/auth.service'

export interface ItemMenu {
  label: string
  href: string
  icon: LucideIcon
  perfis: PerfilUtilizador[] // perfis que podem ver este item
}

export const ITENS_MENU_DASHBOARD: ItemMenu[] = [
  {
    label: 'Visão geral',
    href: '/dashboard',
    icon: LayoutDashboard,
    perfis: [
      'ADMIN',
      'GESTOR_LICENCAS',
      'GESTOR_ESTOQUE',
      'FISCAL',
      'ANALISTA',
    ],
  },
  {
    label: 'Licenças',
    href: '/dashboard/licencas',
    icon: FileBadge,
    perfis: ['ADMIN', 'GESTOR_LICENCAS'],
  },
  {
    label: 'Fiscalização',
    href: '/dashboard/fiscalizacao',
    icon: ShieldCheck,
    perfis: ['ADMIN', 'FISCAL'],
  },
  {
    label: 'Estoque',
    href: '/dashboard/estoque',
    icon: Boxes,
    perfis: ['ADMIN', 'GESTOR_ESTOQUE'],
  },
  {
    label: 'Distribuição',
    href: '/dashboard/distribuicao',
    icon: Truck,
    perfis: ['ADMIN', 'GESTOR_ESTOQUE'],
  },
  {
    label: 'Revendedores',
    href: '/dashboard/revendedores',
    icon: Store,
    perfis: ['ADMIN'],
  },
  {
    label: 'Relatórios',
    href: '/dashboard/relatorios',
    icon: BarChart3,
    perfis: ['ADMIN', 'ANALISTA'],
  },
  {
    label: 'Perfil',
    href: '/dashboard/perfil',
    icon: User,
    perfis: [
      'ADMIN',
      'REVENDEDOR',
      'ANALISTA',
      'FISCAL',
      'GESTOR_ESTOQUE',
      'GESTOR_LICENCAS',
      'GROSSISTA',
      'ANALISTA',
    ],
  },
]

export function obterItensMenu(perfil: PerfilUtilizador): ItemMenu[] {
  return ITENS_MENU_DASHBOARD.filter((item) => item.perfis.includes(perfil))
}

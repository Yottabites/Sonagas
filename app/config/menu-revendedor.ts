import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  History,
  Store,
  LifeBuoy,
  type LucideIcon,
  User,
} from 'lucide-react'

export type PerfilVendedor = 'REVENDEDOR' | 'GROSSISTA'

export interface ItemMenuRevendedor {
  label: string
  href: string
  icon: LucideIcon
  perfis: PerfilVendedor[] // quem vê este item
  target?: string
}

export const ITENS_MENU_REVENDEDOR: ItemMenuRevendedor[] = [
  {
    label: 'Visão geral',
    href: '/revendedor',
    icon: LayoutDashboard,
    perfis: ['REVENDEDOR', 'GROSSISTA'],
  },
  {
    label: 'Fazer pedido',
    href: '/revendedor/pedidos/novo',
    icon: ShoppingCart,
    perfis: ['REVENDEDOR', 'GROSSISTA'],
  },
  {
    label: 'Distribuições',
    href: '/revendedor/distribuicoes',
    icon: Truck,
    perfis: ['REVENDEDOR', 'GROSSISTA'],
  },
  {
    label: 'Pontos de venda',
    href: '/revendedor/pontos-venda',
    icon: Store,
    // Só o grossista costuma gerir múltiplos pontos de venda
    perfis: ['GROSSISTA'],
  },
  {
    label: 'Histórico',
    href: '/revendedor/historico',
    icon: History,
    perfis: ['REVENDEDOR', 'GROSSISTA'],
  },
  {
    label: 'Suporte',
    href: '/suporte',
    icon: LifeBuoy,
    target: '_blank',
    perfis: ['REVENDEDOR', 'GROSSISTA'],
  },
  {
    label: 'Perfil',
    href: '/revendedor/perfil',
    icon: User,
    perfis: ['REVENDEDOR', 'GROSSISTA'],
  },
]

export function obterItensMenuRevendedor(
  perfil: PerfilVendedor,
): ItemMenuRevendedor[] {
  return ITENS_MENU_REVENDEDOR.filter((item) => item.perfis.includes(perfil))
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LogOut, Menu, X, Loader2 } from 'lucide-react'
import { useUtilizadorAtual } from '../../app/core/hooks/useUtilizadorAtual'
import { useLogout } from '../../app/core/hooks/useLogout'
import { obterItensMenuRevendedor } from '../../app/config/menu-revendedor'
import { obterItensMenu } from '../../app/config/menu'

interface PainelLayoutProps {
  children: React.ReactNode
  area: 'dashboard' | 'revendedor'
}

const LABEL_PERFIL: Record<string, string> = {
  ADMIN: 'Administrador',
  GESTOR_LICENCAS: 'Gestor de Licenças',
  GESTOR_ESTOQUE: 'Gestor de Estoque',
  FISCAL: 'Fiscal',
  ANALISTA: 'Analista',
  REVENDEDOR: 'Revendedor',
  GROSSISTA: 'Grossista',
}

export function PainelLayout({ children, area }: PainelLayoutProps) {
  const pathname = usePathname()
  const [menuMobileAberto, setMenuMobileAberto] = useState(false)

  const { data, isLoading } = useUtilizadorAtual()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()

  const utilizador = data?.utilizador

  const itensMenu =
    area === 'dashboard'
      ? utilizador
        ? obterItensMenu(utilizador.perfil)
        : []
      : utilizador &&
          (utilizador.perfil === 'REVENDEDOR' ||
            utilizador.perfil === 'GROSSISTA')
        ? obterItensMenuRevendedor(utilizador.perfil)
        : []

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FAFAF8]">
        <Loader2 className="h-6 w-6 animate-spin text-[#E2231A]" />
      </div>
    )
  }

  return (
    // h-screen + overflow-hidden no container raiz: a página NUNCA rola como um todo.
    // Só o <main> (conteúdo) tem overflow-y-auto — sidebar e header ficam sempre fixos.
    <div className="flex h-screen w-full overflow-hidden bg-[#FAFAF8] font-[Inter]">
      {/* ---------------------------------------------------- */}
      {/* SIDEBAR — desktop (fixa, com scroll interno próprio) */}
      {/* ---------------------------------------------------- */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-[#1A1A1A]/10 bg-white lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-[#1A1A1A]/10 px-6">
          <Image
            src="/sonagas.png"
            alt="Sonagás Energias Renováveis"
            width={120}
            height={40}
            className="h-7 w-auto object-contain"
          />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {itensMenu.map((item) => {
            const Icon = item.icon
            const ativo =
              pathname === item.href ||
              (item.href !== '/dashboard' &&
                item.href !== '/revendedor' &&
                pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                target={(item as any).target}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  ativo
                    ? 'bg-[#E2231A]/10 text-[#E2231A]'
                    : 'text-[#1A1A1A]/65 hover:bg-[#1A1A1A]/[0.04] hover:text-[#1A1A1A]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="shrink-0 border-t border-[#1A1A1A]/10 p-4">
          <div className="mb-3 px-1">
            <p className="truncate font-[Roboto] text-sm font-semibold text-[#1A1A1A]">
              {utilizador?.nome}
            </p>
            <p className="text-xs text-[#1A1A1A]/50">
              {utilizador ? LABEL_PERFIL[utilizador.perfil] : ''}
            </p>
          </div>
          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#1A1A1A]/60 transition hover:bg-[#E2231A]/[0.06] hover:text-[#E2231A] disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? 'A terminar...' : 'Terminar sessão'}
          </button>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* SIDEBAR — mobile (drawer sobreposto, sempre fixo) */}
      {/* ---------------------------------------------------- */}
      {menuMobileAberto && (
        <div
          className="fixed inset-0 z-50 bg-[#1A1A1A]/40 lg:hidden"
          onClick={() => setMenuMobileAberto(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-64 flex-col bg-white"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#1A1A1A]/10 px-6">
              <Image
                src="/sonagas.png"
                alt="Sonagás Energias Renováveis"
                width={120}
                height={40}
                className="h-7 w-auto object-contain"
              />
              <button onClick={() => setMenuMobileAberto(false)}>
                <X className="h-5 w-5 text-[#1A1A1A]/60" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {itensMenu.map((item) => {
                const Icon = item.icon
                const ativo = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={(item as any).target}
                    onClick={() => setMenuMobileAberto(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                      ativo
                        ? 'bg-[#E2231A]/10 text-[#E2231A]'
                        : 'text-[#1A1A1A]/65 hover:bg-[#1A1A1A]/[0.04]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="shrink-0 border-t border-[#1A1A1A]/10 p-4">
              <button
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#E2231A]"
              >
                <LogOut className="h-4 w-4" />
                Terminar sessão
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CONTEÚDO — única área com scroll */}
      {/* ---------------------------------------------------- */}
      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#1A1A1A]/10 bg-white px-4 lg:px-8">
          <button
            onClick={() => setMenuMobileAberto(true)}
            className="text-[#1A1A1A]/70 lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block">
            <p className="font-[Roboto] text-sm font-semibold text-[#1A1A1A]">
              {area === 'dashboard' ? 'Painel Sonagás' : 'Portal do Revendedor'}
            </p>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Image
              src="/sonagas.png"
              alt="Sonagás"
              width={100}
              height={32}
              className="h-6 w-auto object-contain"
            />
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <span className="h-2 w-2 rounded-full bg-[#FFC20E]" />
            <span className="h-2 w-2 rounded-full bg-[#E2231A]" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

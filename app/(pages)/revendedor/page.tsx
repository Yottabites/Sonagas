'use client'

import Link from 'next/link'
import {
  ShoppingCart,
  Clock,
  Loader2,
  Truck,
  Store,
  PackagePlus,
  ArrowRight,
} from 'lucide-react'
import { useUtilizadorAtual } from '../../core/hooks/useUtilizadorAtual'
import { useResumoRevendedor } from '../../core/hooks/useResumoRevendedor'
import { StatusPedido } from '../../core/services/revendedor.service'

const LABEL_STATUS: Record<StatusPedido, string> = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  EM_PROCESSAMENTO: 'Em processamento',
  CONCLUIDO: 'Concluído',
  REJEITADO: 'Rejeitado',
}

const COR_STATUS: Record<StatusPedido, string> = {
  PENDENTE: 'bg-[#FFC20E]/15 text-[#8a6500]',
  APROVADO: 'bg-[#1A8F4C]/10 text-[#1A8F4C]',
  EM_PROCESSAMENTO: 'bg-[#1A1A1A]/10 text-[#1A1A1A]/70',
  CONCLUIDO: 'bg-[#1A8F4C]/10 text-[#1A8F4C]',
  REJEITADO: 'bg-[#E2231A]/10 text-[#E2231A]',
}

export default function RevendedorPage() {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const { data, isLoading } = useResumoRevendedor()

  const utilizador = dadosUtilizador?.utilizador
  const ehGrossista = utilizador?.perfil === 'GROSSISTA'

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#E2231A]" />
      </div>
    )
  }

  const resumo = data?.resumo
  const revendedor = data?.revendedor
  const ultimosPedidos = data?.ultimosPedidos ?? []

  return (
    <div className="space-y-8">
      {/* ---------------------------------------------------- */}
      {/* CABEÇALHO */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-[Roboto] text-xs font-bold uppercase tracking-[0.2em] text-[#E2231A]">
            {ehGrossista ? 'Portal do Grossista' : 'Portal do Revendedor'}
          </p>
          <h1 className="font-[Roboto] text-2xl font-bold text-[#1A1A1A]">
            Olá, {revendedor?.nome ?? 'bem-vindo'}
          </h1>
        </div>

        <Link
          href="/revendedor/pedidos/novo"
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#E2231A] px-5 font-[Roboto] text-sm font-semibold text-white transition hover:bg-[#C01D16]"
        >
          <PackagePlus className="h-4 w-4" />
          Fazer novo pedido
        </Link>
      </div>

      {/* ---------------------------------------------------- */}
      {/* CARTÕES DE RESUMO */}
      {/* ---------------------------------------------------- */}
      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
          ehGrossista ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        }`}
      >
        <CartaoResumo
          icon={Clock}
          label="Pedidos pendentes"
          valor={resumo?.pedidosPendentes ?? 0}
          cor="text-[#8a6500]"
          bg="bg-[#FFC20E]/10"
        />
        <CartaoResumo
          icon={ShoppingCart}
          label="Em processamento"
          valor={resumo?.pedidosEmProcessamento ?? 0}
          cor="text-[#1A1A1A]/70"
          bg="bg-[#1A1A1A]/[0.04]"
        />
        <CartaoResumo
          icon={Truck}
          label="Distribuições em trânsito"
          valor={resumo?.distribuicoesEmTransito ?? 0}
          cor="text-[#E2231A]"
          bg="bg-[#E2231A]/10"
        />
        {ehGrossista && (
          <CartaoResumo
            icon={Store}
            label="Pontos de venda"
            valor={resumo?.totalPontosVenda ?? 0}
            cor="text-[#1A8F4C]"
            bg="bg-[#1A8F4C]/10"
          />
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* ÚLTIMOS PEDIDOS */}
      {/* ---------------------------------------------------- */}
      <div className="rounded-md border border-[#1A1A1A]/10 bg-white">
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 px-6 py-4">
          <h2 className="font-[Roboto] text-base font-bold text-[#1A1A1A]">
            Últimos pedidos
          </h2>
          <Link
            href="/revendedor/historico"
            className="flex items-center gap-1 text-sm font-medium text-[#E2231A] hover:underline"
          >
            Ver histórico
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {ultimosPedidos.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[#1A1A1A]/50">
            Ainda não fizeste nenhum pedido.
          </div>
        ) : (
          <ul className="divide-y divide-[#1A1A1A]/10">
            {ultimosPedidos.map((pedido) => (
              <li
                key={pedido.id}
                className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {pedido.itens
                      .map((item) => `${item.quantidade}x ${item.produto}`)
                      .join(', ')}
                  </p>
                  <p className="text-xs text-[#1A1A1A]/50">
                    {new Date(pedido.criadoEm).toLocaleDateString('pt-PT', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${COR_STATUS[pedido.status]}`}
                >
                  {LABEL_STATUS[pedido.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

interface CartaoResumoProps {
  icon: React.ElementType
  label: string
  valor: number
  cor: string
  bg: string
}

function CartaoResumo({
  icon: Icon,
  label,
  valor,
  cor,
  bg,
}: CartaoResumoProps) {
  return (
    <div className="rounded-md border border-[#1A1A1A]/10 bg-white p-5">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${bg}`}
      >
        <Icon className={`h-5 w-5 ${cor}`} />
      </div>
      <p className="font-[Roboto] text-2xl font-bold text-[#1A1A1A]">{valor}</p>
      <p className="text-xs text-[#1A1A1A]/55">{label}</p>
    </div>
  )
}

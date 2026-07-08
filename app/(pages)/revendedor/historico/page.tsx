'use client'

import { useState } from 'react'
import { Loader2, History, ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { StatusPedido } from '../../../core/services/revendedor.service'
import { usePedidos } from '../../../core/hooks/usePedidos'
// import { usePedidos } from '@/hooks/usePedidos'
// import { StatusPedido } from '@/services/revendedor.service'

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

const FILTROS: { label: string; valor: StatusPedido | undefined }[] = [
  { label: 'Todos', valor: undefined },
  { label: 'Pendentes', valor: 'PENDENTE' },
  { label: 'Em processamento', valor: 'EM_PROCESSAMENTO' },
  { label: 'Concluídos', valor: 'CONCLUIDO' },
  { label: 'Rejeitados', valor: 'REJEITADO' },
]

export default function HistoricoPage() {
  const [filtro, setFiltro] = useState<StatusPedido | undefined>(undefined)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePedidos(filtro)

  const pedidos = data?.pages.flatMap((pagina) => pagina.pedidos) ?? []

  return (
    <div className="space-y-6">
      <div>
        <p className="font-[Roboto] text-xs font-bold uppercase tracking-[0.2em] text-[#E2231A]">
          Histórico
        </p>
        <h1 className="font-[Roboto] text-2xl font-bold text-[#1A1A1A]">
          Histórico de pedidos
        </h1>
        <p className="mt-1 text-sm text-[#1A1A1A]/60">
          Consulta todos os pedidos que já fizeste, com o respetivo estado.
        </p>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FILTROS */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.label}
            onClick={() => setFiltro(f.valor)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              filtro === f.valor
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-white text-[#1A1A1A]/60 hover:bg-[#1A1A1A]/[0.04]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------- */}
      {/* LISTA */}
      {/* ---------------------------------------------------- */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#E2231A]" />
        </div>
      ) : pedidos.length === 0 ? (
        <div className="rounded-md border border-[#1A1A1A]/10 bg-white px-6 py-16 text-center">
          <History className="mx-auto mb-3 h-8 w-8 text-[#1A1A1A]/20" />
          <p className="text-sm text-[#1A1A1A]/50">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-md border border-[#1A1A1A]/10 bg-white">
            <ul className="divide-y divide-[#1A1A1A]/10">
              {pedidos.map((pedido) => (
                <li
                  key={pedido.id}
                  className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1A1A1A]">
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
                      {pedido.observacoes && ` · ${pedido.observacoes}`}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${COR_STATUS[pedido.status]}`}
                  >
                    {LABEL_STATUS[pedido.status]}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="gap-2 border-[#1A1A1A]/15"
              >
                {isFetchingNextPage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                Carregar mais
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

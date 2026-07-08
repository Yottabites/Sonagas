'use client'

import { useState } from 'react'
import { Loader2, Truck, MapPin, User, Package } from 'lucide-react'

import { StatusDistribuicao } from '../../../core/services/revendedor.service'
import { useUtilizadorAtual } from '../../../core/hooks/useUtilizadorAtual'
import { useDistribuicoes } from '../../../core/hooks/useDistribuicoes'

const LABEL_STATUS: Record<StatusDistribuicao, string> = {
  PLANEADA: 'Planeada',
  EM_TRANSITO: 'Em trânsito',
  ENTREGUE: 'Entregue',
  CANCELADA: 'Cancelada',
}

const COR_STATUS: Record<StatusDistribuicao, string> = {
  PLANEADA: 'bg-[#1A1A1A]/10 text-[#1A1A1A]/70',
  EM_TRANSITO: 'bg-[#FFC20E]/15 text-[#8a6500]',
  ENTREGUE: 'bg-[#1A8F4C]/10 text-[#1A8F4C]',
  CANCELADA: 'bg-[#E2231A]/10 text-[#E2231A]',
}

const FILTROS: { label: string; valor: StatusDistribuicao | 'TODAS' }[] = [
  { label: 'Todas', valor: 'TODAS' },
  { label: 'Planeadas', valor: 'PLANEADA' },
  { label: 'Em trânsito', valor: 'EM_TRANSITO' },
  { label: 'Entregues', valor: 'ENTREGUE' },
]

export default function DistribuicoesPage() {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const { data, isLoading } = useDistribuicoes()

  const [filtro, setFiltro] = useState<StatusDistribuicao | 'TODAS'>('TODAS')

  const ehGrossista = dadosUtilizador?.utilizador?.perfil === 'GROSSISTA'
  const distribuicoes = data?.distribuicoes ?? []

  const distribuicoesFiltradas =
    filtro === 'TODAS'
      ? distribuicoes
      : distribuicoes.filter((d) => d.status === filtro)

  return (
    <div className="space-y-6">
      <div>
        <p className="font-[Roboto] text-xs font-bold uppercase tracking-[0.2em] text-[#E2231A]">
          Acompanhamento
        </p>
        <h1 className="font-[Roboto] text-2xl font-bold text-[#1A1A1A]">
          Distribuições
        </h1>
        <p className="mt-1 text-sm text-[#1A1A1A]/60">
          {ehGrossista
            ? 'Acompanha as entregas dos teus agentes em todos os pontos de venda.'
            : 'Acompanha as entregas dos teus pedidos até ao teu ponto de venda.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
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

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#E2231A]" />
        </div>
      ) : distribuicoesFiltradas.length === 0 ? (
        <div className="rounded-md border border-[#1A1A1A]/10 bg-white px-6 py-16 text-center">
          <Truck className="mx-auto mb-3 h-8 w-8 text-[#1A1A1A]/20" />
          <p className="text-sm text-[#1A1A1A]/50">
            Nenhuma distribuição encontrada.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {distribuicoesFiltradas.map((d) => (
            <div
              key={d.id}
              className="rounded-md border border-[#1A1A1A]/10 bg-white p-5"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${COR_STATUS[d.status]}`}
                >
                  {LABEL_STATUS[d.status]}
                </span>
                <p className="text-xs text-[#1A1A1A]/45">
                  {d.dataEntrega
                    ? `Entregue em ${new Date(d.dataEntrega).toLocaleDateString('pt-PT')}`
                    : d.dataPrevista
                      ? `Prevista para ${new Date(d.dataPrevista).toLocaleDateString('pt-PT')}`
                      : 'Sem data definida'}
                </p>
              </div>

              <div className="mb-3 flex items-start gap-2">
                <Package className="mt-0.5 h-4 w-4 shrink-0 text-[#1A1A1A]/35" />
                <p className="text-sm text-[#1A1A1A]">
                  {d.itens
                    .map((item) => `${item.quantidade}x ${item.produto}`)
                    .join(', ')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#1A1A1A]/50">
                {d.agente && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {d.agente.nome}
                  </span>
                )}
                {ehGrossista && d.pontoVenda && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {d.pontoVenda.nome}
                  </span>
                )}
              </div>

              {d.observacoes && (
                <p className="mt-3 rounded-lg bg-[#1A1A1A]/[0.03] px-3 py-2 text-xs text-[#1A1A1A]/60">
                  {d.observacoes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Store, MapPin, Truck } from 'lucide-react'

// import { useUtilizadorAtual } from '@/hooks/useUtilizadorAtual'
import { useUtilizadorAtual } from '../../../core/hooks/useUtilizadorAtual'
import { StatusPontoVenda } from '../../../core/services/revendedor.service'
import { usePontosVenda } from '../../../core/hooks/usePontosVenda'

const LABEL_STATUS: Record<StatusPontoVenda, string> = {
  ATIVO: 'Ativo',
  PENDENTE_CADASTRO: 'Pendente de cadastro',
  INATIVO: 'Inativo',
}

const COR_STATUS: Record<StatusPontoVenda, string> = {
  ATIVO: 'bg-[#1A8F4C]/10 text-[#1A8F4C]',
  PENDENTE_CADASTRO: 'bg-[#FFC20E]/15 text-[#8a6500]',
  INATIVO: 'bg-[#1A1A1A]/10 text-[#1A1A1A]/60',
}

export default function PontosVendaPage() {
  const router = useRouter()
  const { data: dadosUtilizador, isLoading: carregandoUtilizador } =
    useUtilizadorAtual()
  const { data, isLoading } = usePontosVenda()

  const utilizador = dadosUtilizador?.utilizador
  const ehGrossista = utilizador?.perfil === 'GROSSISTA'

  // Esta secção é exclusiva do Grossista — protege também a página,
  // não só o item de menu, contra acesso direto via URL.
  useEffect(() => {
    if (!carregandoUtilizador && utilizador && !ehGrossista) {
      router.replace('/revendedor')
    }
  }, [carregandoUtilizador, utilizador, ehGrossista, router])

  if (carregandoUtilizador || (!ehGrossista && !carregandoUtilizador)) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#E2231A]" />
      </div>
    )
  }

  const pontosVenda = data?.pontosVenda ?? []

  return (
    <div className="space-y-6">
      <div>
        <p className="font-[Roboto] text-xs font-bold uppercase tracking-[0.2em] text-[#E2231A]">
          Gestão de pontos de venda
        </p>
        <h1 className="font-[Roboto] text-2xl font-bold text-[#1A1A1A]">
          Pontos de venda
        </h1>
        <p className="mt-1 text-sm text-[#1A1A1A]/60">
          Todos os pontos de venda registados sob a tua conta de grossista.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#E2231A]" />
        </div>
      ) : pontosVenda.length === 0 ? (
        <div className="rounded-md border border-[#1A1A1A]/10 bg-white px-6 py-16 text-center">
          <Store className="mx-auto mb-3 h-8 w-8 text-[#1A1A1A]/20" />
          <p className="text-sm text-[#1A1A1A]/50">
            Ainda não tens pontos de venda registados. Contacta o suporte para
            adicionar um novo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {pontosVenda.map((pv) => (
            <div
              key={pv.id}
              className="rounded-md border border-[#1A1A1A]/10 bg-white p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-[Roboto] text-base font-bold text-[#1A1A1A]">
                    {pv.nome}
                  </p>
                  <p className="text-xs text-[#1A1A1A]/45">
                    Código: {pv.codigo}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${COR_STATUS[pv.status]}`}
                >
                  {LABEL_STATUS[pv.status]}
                </span>
              </div>

              {pv.endereco && (
                <div className="mb-2 flex items-start gap-2 text-sm text-[#1A1A1A]/65">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1A1A1A]/35" />
                  <span>
                    {pv.endereco}
                    {pv.zona && ` · ${pv.zona.nome}, ${pv.zona.provincia}`}
                  </span>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 border-t border-[#1A1A1A]/10 pt-3 text-xs text-[#1A1A1A]/50">
                <Truck className="h-3.5 w-3.5" />
                {pv.totalDistribuicoes} distribuiç
                {pv.totalDistribuicoes === 1 ? 'ão recebida' : 'ões recebidas'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

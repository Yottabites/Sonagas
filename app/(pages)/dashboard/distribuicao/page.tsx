'use client'

import { useState } from 'react'
import {
  Loader2,
  Truck,
  Plus,
  ChevronDown,
  Trash2,
  MapPin,
  User,
  Store,
  Package,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { NativeAutocomplete } from '@/components/ui/native-autocomplete'

import { useDistribuicoesDashboard } from '../../../core/hooks/useDistribuicoesDashboard'
import { useCriarDistribuicao } from '../../../core/hooks/useCriarDistribuicao'
import { useAtualizarStatusDistribuicao } from '../../../core/hooks/useAtualizarStatusDistribuicao'
import { usePontosVendaDashboard } from '../../../core/hooks/usePontosVendaDashboard'
import { useAgentes } from '../../../core/hooks/useAgentes'
import { useEstoqueProdutos } from '../../../core/hooks/useEstoqueProdutos'
import {
  DistribuicaoDashboard,
  StatusDistribuicaoDashboard,
} from '../../../core/services/distribuicao-dashboard.service'

const LABEL_STATUS: Record<StatusDistribuicaoDashboard, string> = {
  PLANEADA: 'Planeada',
  EM_TRANSITO: 'Em trânsito',
  ENTREGUE: 'Entregue',
  CANCELADA: 'Cancelada',
}

const COR_STATUS: Record<StatusDistribuicaoDashboard, string> = {
  PLANEADA: 'bg-[#1A1A1A]/10 text-[#1A1A1A]/70',
  EM_TRANSITO: 'bg-[#FFC20E]/15 text-[#8a6500]',
  ENTREGUE: 'bg-[#1A8F4C]/10 text-[#1A8F4C]',
  CANCELADA: 'bg-[#E2231A]/10 text-[#E2231A]',
}

const FILTROS: { label: string; valor: string | undefined }[] = [
  { label: 'Todas', valor: undefined },
  { label: 'Planeadas', valor: 'PLANEADA' },
  { label: 'Em trânsito', valor: 'EM_TRANSITO' },
  { label: 'Entregues', valor: 'ENTREGUE' },
]

export default function DashboardDistribuicaoPage() {
  const [filtro, setFiltro] = useState<string | undefined>(undefined)
  const [sheetNovaAberto, setSheetNovaAberto] = useState(false)
  const [distribuicaoDetalhe, setDistribuicaoDetalhe] =
    useState<DistribuicaoDashboard | null>(null)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useDistribuicoesDashboard(filtro)

  const { mutate: atualizarStatus, isPending: atualizando } =
    useAtualizarStatusDistribuicao()

  const distribuicoes = data?.pages.flatMap((p) => p.distribuicoes) ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-[Roboto] text-xs font-bold uppercase tracking-[0.2em] text-[#E2231A]">
            Logística
          </p>
          <h1 className="font-[Roboto] text-2xl font-bold text-[#1A1A1A]">
            Distribuição
          </h1>
        </div>

        <Sheet open={sheetNovaAberto} onOpenChange={setSheetNovaAberto}>
          <SheetTrigger asChild>
            <Button className="h-11 gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16]">
              <Plus className="h-4 w-4" />
              Nova distribuição
            </Button>
          </SheetTrigger>
          <FormularioNovaDistribuicao
            onSuccess={() => setSheetNovaAberto(false)}
          />
        </Sheet>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FILTROS */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.label}
            onClick={() => setFiltro(f.valor)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
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
      ) : distribuicoes.length === 0 ? (
        <div className="rounded-2xl border border-[#1A1A1A]/10 bg-white px-6 py-16 text-center">
          <Truck className="mx-auto mb-3 h-8 w-8 text-[#1A1A1A]/20" />
          <p className="text-sm text-[#1A1A1A]/50">
            Nenhuma distribuição encontrada.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {distribuicoes.map((d) => (
              <div
                key={d.id}
                onClick={() => setDistribuicaoDetalhe(d)}
                className="cursor-pointer rounded-2xl border border-[#1A1A1A]/10 bg-white p-5 transition hover:border-[#1A1A1A]/20"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${COR_STATUS[d.status]}`}
                  >
                    {LABEL_STATUS[d.status]}
                  </span>
                  <p className="text-xs text-[#1A1A1A]/40">
                    {d.dataEntrega
                      ? `Entregue em ${new Date(d.dataEntrega).toLocaleDateString('pt-PT')}`
                      : d.dataPrevista
                        ? `Prevista para ${new Date(d.dataPrevista).toLocaleDateString('pt-PT')}`
                        : 'Sem data definida'}
                  </p>
                </div>

                <div className="grid gap-1.5 sm:grid-cols-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5 shrink-0 text-[#1A1A1A]/35" />
                    <span className="truncate text-[#1A1A1A]/70">
                      {d.agente.nome}
                    </span>
                  </div>
                  {d.pontoVenda && (
                    <div className="flex items-center gap-2 text-sm">
                      <Store className="h-3.5 w-3.5 shrink-0 text-[#1A1A1A]/35" />
                      <span className="truncate text-[#1A1A1A]/70">
                        {d.pontoVenda.nome}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-3.5 w-3.5 shrink-0 text-[#1A1A1A]/35" />
                    <span className="truncate text-[#1A1A1A]/70">
                      {d.itens
                        .map((i) => `${i.quantidade}x ${i.produto}`)
                        .join(', ')}
                    </span>
                  </div>
                </div>

                {/* Acções inline (sem precisar abrir detalhe) */}
                {(d.status === 'PLANEADA' || d.status === 'EM_TRANSITO') && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 flex flex-wrap gap-2 border-t border-[#1A1A1A]/10 pt-4"
                  >
                    {d.status === 'PLANEADA' && (
                      <>
                        <button
                          onClick={() =>
                            atualizarStatus({ id: d.id, status: 'EM_TRANSITO' })
                          }
                          disabled={atualizando}
                          className="rounded-lg bg-[#FFC20E]/15 px-3 py-1.5 text-xs font-semibold text-[#8a6500] hover:bg-[#FFC20E]/30 disabled:opacity-50"
                        >
                          Iniciar trânsito
                        </button>
                        <button
                          onClick={() =>
                            atualizarStatus({ id: d.id, status: 'CANCELADA' })
                          }
                          disabled={atualizando}
                          className="rounded-lg bg-[#E2231A]/10 px-3 py-1.5 text-xs font-semibold text-[#E2231A] hover:bg-[#E2231A]/20 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </>
                    )}

                    {d.status === 'EM_TRANSITO' && (
                      <button
                        onClick={() =>
                          atualizarStatus({ id: d.id, status: 'ENTREGUE' })
                        }
                        disabled={atualizando}
                        className="rounded-lg bg-[#1A8F4C]/10 px-3 py-1.5 text-xs font-semibold text-[#1A8F4C] hover:bg-[#1A8F4C]/20 disabled:opacity-50"
                      >
                        Marcar como entregue
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
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

      {/* ---------------------------------------------------- */}
      {/* SHEET — Detalhe da distribuição */}
      {/* ---------------------------------------------------- */}
      <Sheet
        open={!!distribuicaoDetalhe}
        onOpenChange={(open) => !open && setDistribuicaoDetalhe(null)}
      >
        {distribuicaoDetalhe && (
          <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
            <SheetHeader>
              <SheetTitle className="font-[Roboto]">
                Detalhe da distribuição
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-5 px-4 pb-6">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${COR_STATUS[distribuicaoDetalhe.status]}`}
              >
                {LABEL_STATUS[distribuicaoDetalhe.status]}
              </span>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
                  <dt className="text-[#1A1A1A]/50">Agente</dt>
                  <dd className="font-medium text-[#1A1A1A]">
                    {distribuicaoDetalhe.agente.nome}
                    {distribuicaoDetalhe.agente.contacto && (
                      <span className="ml-2 text-xs font-normal text-[#1A1A1A]/40">
                        {distribuicaoDetalhe.agente.contacto}
                      </span>
                    )}
                  </dd>
                </div>

                {distribuicaoDetalhe.pontoVenda && (
                  <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
                    <dt className="text-[#1A1A1A]/50">Ponto de venda</dt>
                    <dd className="text-right font-medium text-[#1A1A1A]">
                      {distribuicaoDetalhe.pontoVenda.nome}
                      <p className="text-xs font-normal text-[#1A1A1A]/40">
                        {distribuicaoDetalhe.pontoVenda.revendedor.nome}
                      </p>
                    </dd>
                  </div>
                )}

                <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
                  <dt className="text-[#1A1A1A]/50">Data prevista</dt>
                  <dd className="font-medium text-[#1A1A1A]">
                    {distribuicaoDetalhe.dataPrevista
                      ? new Date(
                          distribuicaoDetalhe.dataPrevista,
                        ).toLocaleDateString('pt-PT')
                      : '—'}
                  </dd>
                </div>

                {distribuicaoDetalhe.dataEntrega && (
                  <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
                    <dt className="text-[#1A1A1A]/50">Data de entrega</dt>
                    <dd className="font-medium text-[#1A1A1A]">
                      {new Date(
                        distribuicaoDetalhe.dataEntrega,
                      ).toLocaleDateString('pt-PT')}
                    </dd>
                  </div>
                )}
              </dl>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#1A1A1A]/40">
                  Produtos
                </p>
                <ul className="space-y-1.5">
                  {distribuicaoDetalhe.itens.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-[#1A1A1A]/[0.03] px-3 py-2 text-sm"
                    >
                      <span className="text-[#1A1A1A]/70">{item.produto}</span>
                      <span className="font-semibold text-[#1A1A1A]">
                        {item.quantidade} un.
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {distribuicaoDetalhe.observacoes && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#1A1A1A]/40">
                    Observações
                  </p>
                  <p className="rounded-lg bg-[#1A1A1A]/[0.03] px-3 py-2 text-sm text-[#1A1A1A]/70">
                    {distribuicaoDetalhe.observacoes}
                  </p>
                </div>
              )}
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  )
}

// ------------------------------------------------------------
// FORMULÁRIO — Sheet de criação de nova distribuição
// ------------------------------------------------------------
interface LinhaItem {
  id: string
  produtoId: string
  quantidade: string
}

function FormularioNovaDistribuicao({ onSuccess }: { onSuccess: () => void }) {
  const { data: dadosAgentes, isLoading: carregandoAgentes } = useAgentes()
  const { data: dadosPontosVenda } = usePontosVendaDashboard()
  const { data: dadosProdutos } = useEstoqueProdutos()
  const { mutate: criar, isPending, error } = useCriarDistribuicao()

  const [agenteId, setAgenteId] = useState('')
  const [pontoVendaId, setPontoVendaId] = useState('')
  const [dataPrevista, setDataPrevista] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [linhas, setLinhas] = useState<LinhaItem[]>([
    { id: crypto.randomUUID(), produtoId: '', quantidade: '' },
  ])

  const opcoesAgentes = (dadosAgentes?.agentes ?? []).map((a) => ({
    id: a.id,
    label: `${a.nome} · ${a.nif}`,
  }))

  const opcoesPontosVenda = (dadosPontosVenda?.pontosVenda ?? []).map((pv) => ({
    id: pv.id,
    label: `${pv.nome} — ${pv.revendedor.nome}`,
  }))

  const opcoesProdutos = (dadosProdutos?.produtos ?? []).map((p) => ({
    id: p.id,
    label: `${p.nome} (${p.quantidadeTotal.toLocaleString('pt-PT')} un. disponíveis)`,
  }))

  function adicionarLinha() {
    setLinhas((prev) => [
      ...prev,
      { id: crypto.randomUUID(), produtoId: '', quantidade: '' },
    ])
  }

  function removerLinha(id: string) {
    setLinhas((prev) => prev.filter((l) => l.id !== id))
  }

  function atualizarLinha(id: string, campo: keyof LinhaItem, valor: string) {
    setLinhas((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [campo]: valor } : l)),
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const itensValidos = linhas
      .filter((l) => l.produtoId && l.quantidade)
      .map((l) => ({
        produtoId: l.produtoId,
        quantidade: Number(l.quantidade),
      }))

    criar(
      {
        agenteId,
        pontoVendaId,
        dataPrevista: dataPrevista || undefined,
        observacoes: observacoes.trim() || undefined,
        itens: itensValidos,
      },
      { onSuccess },
    )
  }

  return (
    <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
      <SheetHeader>
        <SheetTitle className="font-[Roboto]">Nova distribuição</SheetTitle>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-6">
        <NativeAutocomplete
          label="Agente"
          placeholder="Escreve o nome do agente..."
          opcoes={opcoesAgentes}
          valorId={agenteId}
          onChange={setAgenteId}
          disabled={carregandoAgentes}
        />

        <NativeAutocomplete
          label="Ponto de venda"
          placeholder="Escreve o nome do PDV ou revendedor..."
          opcoes={opcoesPontosVenda}
          valorId={pontoVendaId}
          onChange={setPontoVendaId}
        />

        <div className="space-y-2">
          <Label htmlFor="dataPrevista" className="text-[#1A1A1A]">
            Data prevista (opcional)
          </Label>
          <Input
            id="dataPrevista"
            type="date"
            value={dataPrevista}
            onChange={(e) => setDataPrevista(e.target.value)}
            className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[#1A1A1A]">Produtos</Label>
            <button
              type="button"
              onClick={adicionarLinha}
              className="flex items-center gap-1 text-xs font-medium text-[#E2231A] hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar produto
            </button>
          </div>

          <div className="space-y-2">
            {linhas.map((linha) => (
              <div key={linha.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <NativeAutocomplete
                    label=""
                    placeholder="Produto..."
                    opcoes={opcoesProdutos}
                    valorId={linha.produtoId}
                    onChange={(val) =>
                      atualizarLinha(linha.id, 'produtoId', val)
                    }
                  />
                </div>
                <Input
                  type="number"
                  min={1}
                  placeholder="Qtd."
                  value={linha.quantidade}
                  onChange={(e) =>
                    atualizarLinha(linha.id, 'quantidade', e.target.value)
                  }
                  className="mt-0 h-11 w-20 shrink-0 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
                />
                <button
                  type="button"
                  onClick={() => removerLinha(linha.id)}
                  disabled={linhas.length === 1}
                  className="mt-0 flex h-11 w-10 shrink-0 items-center justify-center rounded-lg text-[#1A1A1A]/35 hover:bg-[#E2231A]/10 hover:text-[#E2231A] disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes" className="text-[#1A1A1A]">
            Observações (opcional)
          </Label>
          <Textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Instruções especiais para o agente..."
            className="min-h-20 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
          />
        </div>

        {error && (
          <p className="rounded-md bg-[#E2231A]/10 px-3 py-2 text-sm text-[#E2231A]">
            {error.message}
          </p>
        )}

        <SheetFooter className="px-0">
          <Button
            type="submit"
            disabled={isPending || !agenteId || !pontoVendaId}
            className="h-11 w-full gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16] disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Criar distribuição'
            )}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  )
}

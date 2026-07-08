'use client'

import { useState } from 'react'
import {
  Loader2,
  Boxes,
  Plus,
  ChevronDown,
  X,
  Check,
  XCircle,
  PackageCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { NativeAutocomplete } from '@/components/ui/native-autocomplete'
import { StatusPedidoEstoque } from '../../../core/services/pedido-estoque.service'
import { useEstoqueProdutos } from '../../../core/hooks/useEstoqueProdutos'
import { useRegistarEntrada } from '../../../core/hooks/useRegistarEntrada'
import { useArmazens } from '../../../core/hooks/useArmazens'
import { useAtualizarStatusPedido } from '../../../core/hooks/useAtualizarStatusPedido'
import { usePedidosEstoque } from '../../../core/hooks/usePedidosEstoque'

type Aba = 'ESTOQUE' | 'PEDIDOS'

const LABEL_STATUS_PEDIDO: Record<StatusPedidoEstoque, string> = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  EM_PROCESSAMENTO: 'Em processamento',
  CONCLUIDO: 'Concluído',
  REJEITADO: 'Rejeitado',
}

const COR_STATUS_PEDIDO: Record<StatusPedidoEstoque, string> = {
  PENDENTE: 'bg-[#FFC20E]/15 text-[#8a6500]',
  APROVADO: 'bg-[#1A8F4C]/10 text-[#1A8F4C]',
  EM_PROCESSAMENTO: 'bg-[#1A1A1A]/10 text-[#1A1A1A]/70',
  CONCLUIDO: 'bg-[#1A8F4C]/10 text-[#1A8F4C]',
  REJEITADO: 'bg-[#E2231A]/10 text-[#E2231A]',
}

export default function DashboardEstoquePage() {
  const [aba, setAba] = useState<Aba>('ESTOQUE')

  return (
    <div className="space-y-6">
      <div>
        <p className="font-[Roboto] text-xs font-bold uppercase tracking-[0.2em] text-[#E2231A]">
          Gestão de estoque
        </p>
        <h1 className="font-[Roboto] text-2xl font-bold text-[#1A1A1A]">
          Estoque
        </h1>
      </div>

      {/* ---------------------------------------------------- */}
      {/* ABAS */}
      {/* ---------------------------------------------------- */}
      <div className="flex gap-2 border-b border-[#1A1A1A]/10">
        {[
          { id: 'ESTOQUE' as Aba, label: 'Inventário' },
          { id: 'PEDIDOS' as Aba, label: 'Pedidos pendentes' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setAba(item.id)}
            className={`border-b-2 px-1 pb-3 text-sm font-medium transition ${
              aba === item.id
                ? 'border-[#E2231A] text-[#E2231A]'
                : 'border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {aba === 'ESTOQUE' ? <AbaInventario /> : <AbaPedidos />}
    </div>
  )
}

// ------------------------------------------------------------
// ABA — Inventário
// ------------------------------------------------------------
function AbaInventario() {
  const { data, isLoading } = useEstoqueProdutos()
  const [sheetAberto, setSheetAberto] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Sheet open={sheetAberto} onOpenChange={setSheetAberto}>
          <SheetTrigger asChild>
            <Button className="h-10 gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16]">
              <Plus className="h-4 w-4" />
              Registar entrada
            </Button>
          </SheetTrigger>
          <FormularioEntradaEstoque onSuccess={() => setSheetAberto(false)} />
        </Sheet>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#E2231A]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data?.produtos.map((produto) => (
            <div
              key={produto.id}
              className="rounded-md border border-[#1A1A1A]/10 bg-white p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-[#E2231A]" />
                  <p className="font-[Roboto] text-sm font-bold text-[#1A1A1A]">
                    {produto.nome}
                  </p>
                </div>
                <p className="font-[Roboto] text-lg font-bold text-[#1A1A1A]">
                  {produto.quantidadeTotal.toLocaleString('pt-PT')}
                  <span className="ml-1 text-xs font-normal text-[#1A1A1A]/40">
                    un.
                  </span>
                </p>
              </div>

              {produto.lotes.length === 0 ? (
                <p className="text-xs text-[#1A1A1A]/40">
                  Sem lotes registados.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {produto.lotes.map((lote) => (
                    <li
                      key={lote.id}
                      className="flex items-center justify-between text-xs text-[#1A1A1A]/60"
                    >
                      <span>
                        {lote.armazem.nome} · {lote.codigoLote}
                      </span>
                      <span className="font-medium text-[#1A1A1A]">
                        {lote.quantidade.toLocaleString('pt-PT')} un.
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FormularioEntradaEstoque({ onSuccess }: { onSuccess: () => void }) {
  const { data: dadosProdutos } = useEstoqueProdutos()
  const { data: dadosArmazens, isLoading: carregandoArmazens } = useArmazens()
  const { mutate: registar, isPending, error } = useRegistarEntrada()

  const [produtoId, setProdutoId] = useState('')
  const [armazemId, setArmazemId] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [referenciaDoc, setReferenciaDoc] = useState('')

  const opcoesProdutos = (dadosProdutos?.produtos ?? []).map((p) => ({
    id: p.id,
    label: p.nome,
  }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    registar(
      {
        produtoId,
        armazemId,
        quantidade: Number(quantidade),
        referenciaDoc: referenciaDoc || undefined,
      },
      { onSuccess },
    )
  }

  return (
    <SheetContent className="w-full overflow-y-auto sm:max-w-md">
      <SheetHeader>
        <SheetTitle className="font-[Roboto]">
          Registar entrada em estoque
        </SheetTitle>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-6">
        <NativeAutocomplete
          label="Produto"
          placeholder="Escreve o nome do produto..."
          opcoes={opcoesProdutos}
          valorId={produtoId}
          onChange={setProdutoId}
        />

        {/* Select nativo do browser */}
        <div className="space-y-2">
          <Label htmlFor="armazem" className="text-[#1A1A1A]">
            Armazém
          </Label>
          <select
            id="armazem"
            value={armazemId}
            onChange={(e) => setArmazemId(e.target.value)}
            disabled={carregandoArmazens}
            className="h-11 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#E2231A] focus:ring-1 focus:ring-[#E2231A]"
          >
            <option value="">Escolhe o armazém</option>
            {dadosArmazens?.armazens.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantidade" className="text-[#1A1A1A]">
            Quantidade
          </Label>
          <Input
            id="quantidade"
            type="number"
            min={1}
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            required
            className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="referenciaDoc" className="text-[#1A1A1A]">
            Referência do documento (opcional)
          </Label>
          <Input
            id="referenciaDoc"
            value={referenciaDoc}
            onChange={(e) => setReferenciaDoc(e.target.value)}
            placeholder="GR-2026-0003"
            className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
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
            disabled={isPending || !produtoId || !armazemId}
            className="h-11 w-full gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16] disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Registar entrada'
            )}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  )
}

// ------------------------------------------------------------
// ABA — Pedidos pendentes (fila de aprovação)
// ------------------------------------------------------------
function AbaPedidos() {
  const [filtro, setFiltro] = useState<string | undefined>('PENDENTE')

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePedidosEstoque(filtro)

  const { mutate: atualizarStatus, isPending } = useAtualizarStatusPedido()

  const pedidos = data?.pages.flatMap((p) => p.pedidos) ?? []

  const FILTROS: { label: string; valor: string | undefined }[] = [
    { label: 'Pendentes', valor: 'PENDENTE' },
    { label: 'Aprovados', valor: 'APROVADO' },
    { label: 'Em processamento', valor: 'EM_PROCESSAMENTO' },
    { label: 'Todos', valor: undefined },
  ]

  return (
    <div className="space-y-4">
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

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#E2231A]" />
        </div>
      ) : pedidos.length === 0 ? (
        <div className="rounded-md border border-[#1A1A1A]/10 bg-white px-6 py-16 text-center">
          <PackageCheck className="mx-auto mb-3 h-8 w-8 text-[#1A1A1A]/20" />
          <p className="text-sm text-[#1A1A1A]/50">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-md border border-[#1A1A1A]/10 bg-white">
            <ul className="divide-y divide-[#1A1A1A]/10">
              {pedidos.map((pedido) => (
                <li key={pedido.id} className="px-6 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {pedido.revendedor.nome}{' '}
                        <span className="text-xs font-normal text-[#1A1A1A]/40">
                          (
                          {pedido.revendedor.tipo === 'GROSSISTA'
                            ? 'Grossista'
                            : 'Revendedor'}
                          )
                        </span>
                      </p>
                      <p className="truncate text-xs text-[#1A1A1A]/55">
                        {pedido.itens
                          .map((i) => `${i.quantidade}x ${i.produto}`)
                          .join(', ')}
                      </p>
                      <p className="text-xs text-[#1A1A1A]/40">
                        {new Date(pedido.criadoEm).toLocaleDateString('pt-PT')}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold ${COR_STATUS_PEDIDO[pedido.status]}`}
                      >
                        {LABEL_STATUS_PEDIDO[pedido.status]}
                      </span>

                      {pedido.status === 'PENDENTE' && (
                        <>
                          <button
                            onClick={() =>
                              atualizarStatus({
                                id: pedido.id,
                                status: 'APROVADO',
                              })
                            }
                            disabled={isPending}
                            className="flex items-center gap-1 rounded-lg bg-[#1A8F4C]/10 px-3 py-1.5 text-xs font-semibold text-[#1A8F4C] hover:bg-[#1A8F4C]/20 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Aprovar
                          </button>
                          <button
                            onClick={() =>
                              atualizarStatus({
                                id: pedido.id,
                                status: 'REJEITADO',
                              })
                            }
                            disabled={isPending}
                            className="flex items-center gap-1 rounded-lg bg-[#E2231A]/10 px-3 py-1.5 text-xs font-semibold text-[#E2231A] hover:bg-[#E2231A]/20 disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Rejeitar
                          </button>
                        </>
                      )}

                      {pedido.status === 'APROVADO' && (
                        <button
                          onClick={() =>
                            atualizarStatus({
                              id: pedido.id,
                              status: 'EM_PROCESSAMENTO',
                            })
                          }
                          disabled={isPending}
                          className="rounded-lg bg-[#1A1A1A]/10 px-3 py-1.5 text-xs font-semibold text-[#1A1A1A]/70 hover:bg-[#1A1A1A]/20 disabled:opacity-50"
                        >
                          Iniciar processamento
                        </button>
                      )}

                      {pedido.status === 'EM_PROCESSAMENTO' && (
                        <button
                          onClick={() =>
                            atualizarStatus({
                              id: pedido.id,
                              status: 'CONCLUIDO',
                            })
                          }
                          disabled={isPending}
                          className="rounded-lg bg-[#1A8F4C]/10 px-3 py-1.5 text-xs font-semibold text-[#1A8F4C] hover:bg-[#1A8F4C]/20 disabled:opacity-50"
                        >
                          Marcar concluído
                        </button>
                      )}
                    </div>
                  </div>
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

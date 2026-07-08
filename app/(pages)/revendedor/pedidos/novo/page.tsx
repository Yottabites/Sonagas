'use client'

import { useState } from 'react'
import { Plus, Trash2, Loader2, PackagePlus, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { useUtilizadorAtual } from '../../../../core/hooks/useUtilizadorAtual'
import { useProdutos } from '../../../../core/hooks/useProdutos'
import { useCriarPedido } from '../../../../core/hooks/useCriarPedido'

import { ComboboxProduto } from '@/components/ui/combobox-produto'

interface LinhaPedido {
  id: string
  produtoId: string
  quantidade: string
}

function novaLinhaVazia(): LinhaPedido {
  return { id: crypto.randomUUID(), produtoId: '', quantidade: '' }
}

const QUANTIDADE_MINIMA_POR_PERFIL: Record<string, number> = {
  GROSSISTA: 50,
  REVENDEDOR: 1,
}

export default function PedidosNovoPage() {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const { data: dadosProdutos, isLoading: carregandoProdutos } = useProdutos()
  const { mutate: criarPedido, isPending, error } = useCriarPedido()

  const [linhas, setLinhas] = useState<LinhaPedido[]>([novaLinhaVazia()])
  const [observacoes, setObservacoes] = useState('')
  const [erroValidacao, setErroValidacao] = useState<string | null>(null)

  const utilizador = dadosUtilizador?.utilizador
  const ehGrossista = utilizador?.perfil === 'GROSSISTA'
  const quantidadeMinima = utilizador
    ? (QUANTIDADE_MINIMA_POR_PERFIL[utilizador.perfil] ?? 1)
    : 1

  const produtos = dadosProdutos?.produtos ?? []

  function adicionarLinha() {
    setLinhas((prev) => [...prev, novaLinhaVazia()])
  }

  function removerLinha(id: string) {
    setLinhas((prev) => prev.filter((linha) => linha.id !== id))
  }

  function atualizarLinha(id: string, campo: keyof LinhaPedido, valor: string) {
    setLinhas((prev) =>
      prev.map((linha) =>
        linha.id === id ? { ...linha, [campo]: valor } : linha,
      ),
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErroValidacao(null)

    const itensValidos = linhas.filter(
      (linha) => linha.produtoId && linha.quantidade,
    )

    if (itensValidos.length === 0) {
      setErroValidacao('Adiciona pelo menos um produto ao pedido.')
      return
    }

    for (const linha of itensValidos) {
      const quantidade = Number(linha.quantidade)
      if (Number.isNaN(quantidade) || quantidade < quantidadeMinima) {
        setErroValidacao(
          ehGrossista
            ? `Como grossista, a quantidade mínima por produto é ${quantidadeMinima} unidades.`
            : `A quantidade mínima por produto é ${quantidadeMinima} unidade.`,
        )
        return
      }
    }

    criarPedido({
      itens: itensValidos.map((linha) => ({
        produtoId: linha.produtoId,
        quantidade: Number(linha.quantidade),
      })),
      observacoes: observacoes.trim() || undefined,
    })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="font-[Roboto] text-xs font-bold uppercase tracking-[0.2em] text-[#E2231A]">
          {ehGrossista ? 'Pedido por grosso' : 'Novo pedido'}
        </p>
        <h1 className="font-[Roboto] text-2xl font-bold text-[#1A1A1A]">
          Fazer pedido
        </h1>
        <p className="mt-1 text-sm text-[#1A1A1A]/60">
          Escolhe os produtos e as quantidades. O pedido fica pendente até ser
          aprovado pela Sonagás.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-[#FFC20E]/40 bg-[#FFC20E]/10 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8a6500]" />
        <p className="text-sm text-[#8a6500]">
          {ehGrossista
            ? `Como grossista, a quantidade mínima por produto é de ${quantidadeMinima} unidades.`
            : `A quantidade mínima por produto é de ${quantidadeMinima} unidade.`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-md border border-[#1A1A1A]/10 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <Label className="text-[#1A1A1A]">Produtos</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={adicionarLinha}
              className="h-8 gap-1.5 border-[#1A1A1A]/15 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar produto
            </Button>
          </div>

          <div className="space-y-3">
            {linhas.map((linha) => (
              <div key={linha.id} className="flex items-start gap-2">
                <ComboboxProduto
                  options={produtos}
                  value={linha.produtoId}
                  onValueChange={(valor) =>
                    atualizarLinha(linha.id, 'produtoId', valor)
                  }
                  disabled={carregandoProdutos}
                  placeholder="Escolhe o produto"
                />

                <Input
                  type="number"
                  min={quantidadeMinima}
                  placeholder="Qtd."
                  value={linha.quantidade}
                  onChange={(e) =>
                    atualizarLinha(linha.id, 'quantidade', e.target.value)
                  }
                  className="h-11 w-24 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
                />

                <button
                  type="button"
                  onClick={() => removerLinha(linha.id)}
                  disabled={linhas.length === 1}
                  aria-label="Remover produto"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#1A1A1A]/35 transition hover:bg-[#E2231A]/10 hover:text-[#E2231A] disabled:opacity-30"
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
            placeholder="Ex.: entregar preferencialmente na parte da manhã."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="min-h-24 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A] bg-white"
          />
        </div>

        {(erroValidacao || error) && (
          <p className="rounded-md bg-[#E2231A]/10 px-3 py-2 text-sm text-[#E2231A]">
            {erroValidacao ?? error?.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16] disabled:opacity-60 sm:w-auto"
        >
          {isPending ? (
            <>
              Carregando...
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              <PackagePlus className="h-4 w-4" />
              Submeter pedido
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import {
  Loader2,
  Store,
  Plus,
  ChevronDown,
  CheckCircle2,
  XCircle,
  MapPin,
  ShoppingBag,
  ToggleLeft,
  ToggleRight,
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

import { useRevendedoresDashboard } from '../../../core/hooks/useRevendedoresDashboard'
import { useRevendedorDetalhe } from '../../../core/hooks/useRevendedorDetalhe'
import { useCriarRevendedor } from '../../../core/hooks/useCriarRevendedor'
import { useAlterarEstadoRevendedor } from '../../../core/hooks/useAlterarEstadoRevendedor'
import { useCriarPontoVenda } from '../../../core/hooks/useCriarPontoVenda'
import {
  TipoRevendedor,
  RevendedorListagem,
} from '../../../core/services/revendedores-dashboard.service'

const FILTROS_TIPO: { label: string; valor: string | undefined }[] = [
  { label: 'Todos', valor: undefined },
  { label: 'Revendedores', valor: 'REVENDEDOR' },
  { label: 'Grossistas', valor: 'GROSSISTA' },
]

const LABEL_TIPO: Record<TipoRevendedor, string> = {
  REVENDEDOR: 'Revendedor',
  GROSSISTA: 'Grossista',
}

const COR_TIPO: Record<TipoRevendedor, string> = {
  REVENDEDOR: 'bg-[#1A1A1A]/10 text-[#1A1A1A]/70',
  GROSSISTA: 'bg-[#FFC20E]/15 text-[#8a6500]',
}

export default function DashboardRevendedoresPage() {
  const [filtroTipo, setFiltroTipo] = useState<string | undefined>(undefined)
  const [busca, setBusca] = useState('')
  const [sheetNovoAberto, setSheetNovoAberto] = useState(false)
  const [revendedorSelecionadoId, setRevendedorSelecionadoId] = useState<
    string | null
  >(null)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRevendedoresDashboard(filtroTipo, busca || undefined)

  const { mutate: alterarEstado, isPending: alterando } =
    useAlterarEstadoRevendedor()

  const revendedores = data?.pages.flatMap((p) => p.revendedores) ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-[Roboto] text-xs font-bold uppercase tracking-[0.2em] text-[#E2231A]">
            Gestão de parceiros
          </p>
          <h1 className="font-[Roboto] text-2xl font-bold text-[#1A1A1A]">
            Revendedores e Grossistas
          </h1>
        </div>

        <Sheet open={sheetNovoAberto} onOpenChange={setSheetNovoAberto}>
          <SheetTrigger asChild>
            <Button className="h-11 gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16]">
              <Plus className="h-4 w-4" />
              Novo revendedor
            </Button>
          </SheetTrigger>
          <FormularioNovoRevendedor
            onSuccess={() => setSheetNovoAberto(false)}
          />
        </Sheet>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FILTROS */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          {FILTROS_TIPO.map((f) => (
            <button
              key={f.label}
              onClick={() => setFiltroTipo(f.valor)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filtroTipo === f.valor
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-white text-[#1A1A1A]/60 hover:bg-[#1A1A1A]/[0.04]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Input
          placeholder="Buscar por nome ou NIF..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="h-9 max-w-xs border-[#1A1A1A]/15 text-sm focus-visible:ring-[#E2231A]"
        />
      </div>

      {/* ---------------------------------------------------- */}
      {/* LISTA */}
      {/* ---------------------------------------------------- */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#E2231A]" />
        </div>
      ) : revendedores.length === 0 ? (
        <div className="rounded-2xl border border-[#1A1A1A]/10 bg-white px-6 py-16 text-center">
          <Store className="mx-auto mb-3 h-8 w-8 text-[#1A1A1A]/20" />
          <p className="text-sm text-[#1A1A1A]/50">
            Nenhum revendedor encontrado.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-[#1A1A1A]/10 bg-white">
            <ul className="divide-y divide-[#1A1A1A]/10">
              {revendedores.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center"
                >
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => setRevendedorSelecionadoId(r.id)}
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {r.nome}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${COR_TIPO[r.tipo]}`}
                      >
                        {LABEL_TIPO[r.tipo]}
                      </span>
                      {!r.ativo && (
                        <span className="rounded-full bg-[#E2231A]/10 px-2 py-0.5 text-[11px] font-semibold text-[#E2231A]">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#1A1A1A]/50">
                      NIF {r.nif} · {r.email}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-[#1A1A1A]/40">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {r.totalPontosVenda} PDV
                        {r.totalPontosVenda !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3" />
                        {r.totalPedidos} pedido{r.totalPedidos !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => alterarEstado({ id: r.id, ativo: !r.ativo })}
                    disabled={alterando}
                    aria-label={r.ativo ? 'Desativar' : 'Ativar'}
                    className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#1A1A1A]/50 hover:text-[#1A1A1A] disabled:opacity-40"
                  >
                    {r.ativo ? (
                      <ToggleRight className="h-5 w-5 text-[#1A8F4C]" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                    {r.ativo ? 'Ativo' : 'Inativo'}
                  </button>
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

      {/* ---------------------------------------------------- */}
      {/* SHEET — Detalhe do revendedor */}
      {/* ---------------------------------------------------- */}
      <Sheet
        open={!!revendedorSelecionadoId}
        onOpenChange={(open) => !open && setRevendedorSelecionadoId(null)}
      >
        {revendedorSelecionadoId && (
          <DetalheRevendedor
            id={revendedorSelecionadoId}
            onClose={() => setRevendedorSelecionadoId(null)}
          />
        )}
      </Sheet>
    </div>
  )
}

// ------------------------------------------------------------
// SHEET — Detalhe + PDVs + adicionar PDV
// ------------------------------------------------------------
function DetalheRevendedor({
  id,
  onClose,
}: {
  id: string
  onClose: () => void
}) {
  const { data, isLoading } = useRevendedorDetalhe(id)
  const [sheetPdvAberto, setSheetPdvAberto] = useState(false)

  const revendedor = data?.revendedor

  return (
    <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
      <SheetHeader>
        <SheetTitle className="font-[Roboto]">
          {isLoading ? 'A carregar...' : revendedor?.nome}
        </SheetTitle>
      </SheetHeader>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#E2231A]" />
        </div>
      ) : revendedor ? (
        <div className="space-y-6 px-4 pb-6">
          {/* Informações gerais */}
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
              <dt className="text-[#1A1A1A]/50">Tipo</dt>
              <dd className="font-medium text-[#1A1A1A]">
                {LABEL_TIPO[revendedor.tipo]}
              </dd>
            </div>
            <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
              <dt className="text-[#1A1A1A]/50">NIF</dt>
              <dd className="font-medium text-[#1A1A1A]">{revendedor.nif}</dd>
            </div>
            <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
              <dt className="text-[#1A1A1A]/50">Email</dt>
              <dd className="font-medium text-[#1A1A1A]">{revendedor.email}</dd>
            </div>
            {revendedor.contacto && (
              <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
                <dt className="text-[#1A1A1A]/50">Contacto</dt>
                <dd className="font-medium text-[#1A1A1A]">
                  {revendedor.contacto}
                </dd>
              </div>
            )}
            <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
              <dt className="text-[#1A1A1A]/50">Estado</dt>
              <dd className="flex items-center gap-1 font-medium">
                {revendedor.ativo ? (
                  <span className="flex items-center gap-1 text-[#1A8F4C]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Ativo
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[#E2231A]">
                    <XCircle className="h-3.5 w-3.5" /> Inativo
                  </span>
                )}
              </dd>
            </div>
            <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
              <dt className="text-[#1A1A1A]/50">Total de pedidos</dt>
              <dd className="font-medium text-[#1A1A1A]">
                {revendedor.totalPedidos}
              </dd>
            </div>
          </dl>

          {/* Pontos de venda */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-[#1A1A1A]">
                Pontos de venda ({revendedor.pontosVenda.length})
              </p>
              <button
                onClick={() => setSheetPdvAberto(true)}
                className="flex items-center gap-1 text-xs font-medium text-[#E2231A] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar PDV
              </button>
            </div>

            {revendedor.pontosVenda.length === 0 ? (
              <p className="text-xs text-[#1A1A1A]/40">
                Nenhum ponto de venda.
              </p>
            ) : (
              <ul className="space-y-2">
                {revendedor.pontosVenda.map((pv) => (
                  <li
                    key={pv.id}
                    className="rounded-xl border border-[#1A1A1A]/10 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#1A1A1A]">
                        {pv.nome}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          pv.status === 'ATIVO'
                            ? 'bg-[#1A8F4C]/10 text-[#1A8F4C]'
                            : 'bg-[#1A1A1A]/10 text-[#1A1A1A]/50'
                        }`}
                      >
                        {pv.status === 'ATIVO'
                          ? 'Ativo'
                          : pv.status === 'PENDENTE_CADASTRO'
                            ? 'Pendente'
                            : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-xs text-[#1A1A1A]/45">
                      {pv.codigo}
                      {pv.zona && ` · ${pv.zona.nome}, ${pv.zona.provincia}`}
                    </p>
                    <p className="text-xs text-[#1A1A1A]/35">
                      {pv._count.distribuicoes} distribuiç
                      {pv._count.distribuicoes === 1 ? 'ão' : 'ões'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      {/* Sheet aninhado — Novo PDV */}
      <Sheet open={sheetPdvAberto} onOpenChange={setSheetPdvAberto}>
        <FormularioNovoPdv
          revendedorId={id}
          onSuccess={() => setSheetPdvAberto(false)}
        />
      </Sheet>
    </SheetContent>
  )
}

// ------------------------------------------------------------
// FORMULÁRIO — Novo Revendedor
// ------------------------------------------------------------
function FormularioNovoRevendedor({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: criar, isPending, error } = useCriarRevendedor()

  const [nome, setNome] = useState('')
  const [nif, setNif] = useState('')
  const [tipo, setTipo] = useState<TipoRevendedor>('REVENDEDOR')
  const [contacto, setContacto] = useState('')
  const [email, setEmail] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    criar(
      { nome, nif, tipo, contacto: contacto || undefined, email },
      { onSuccess },
    )
  }

  return (
    <SheetContent className="w-full overflow-y-auto sm:max-w-md">
      <SheetHeader>
        <SheetTitle className="font-[Roboto]">Novo revendedor</SheetTitle>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-6">
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-[#1A1A1A]">
            Nome
          </Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nif" className="text-[#1A1A1A]">
            NIF
          </Label>
          <Input
            id="nif"
            value={nif}
            onChange={(e) => setNif(e.target.value)}
            required
            placeholder="AO0099887705"
            className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
          />
          <p className="text-xs text-[#1A1A1A]/40">
            A senha inicial de acesso à plataforma será o NIF.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo" className="text-[#1A1A1A]">
            Tipo
          </Label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoRevendedor)}
            className="h-11 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#E2231A] focus:ring-1 focus:ring-[#E2231A]"
          >
            <option value="REVENDEDOR">Revendedor</option>
            <option value="GROSSISTA">Grossista</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#1A1A1A]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contacto" className="text-[#1A1A1A]">
            Contacto (opcional)
          </Label>
          <Input
            id="contacto"
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
            placeholder="+244 9XX XXX XXX"
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
            disabled={isPending}
            className="h-11 w-full gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16] disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Criar revendedor'
            )}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  )
}

// ------------------------------------------------------------
// FORMULÁRIO — Novo Ponto de Venda (PDV / Pingpoint)
// ------------------------------------------------------------
function FormularioNovoPdv({
  revendedorId,
  onSuccess,
}: {
  revendedorId: string
  onSuccess: () => void
}) {
  const { mutate: criar, isPending, error } = useCriarPontoVenda()

  const [nome, setNome] = useState('')
  const [codigo, setCodigo] = useState('')
  const [endereco, setEndereco] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    criar(
      {
        revendedorId,
        payload: { nome, codigo, endereco: endereco || undefined },
      },
      { onSuccess },
    )
  }

  return (
    <SheetContent className="w-full overflow-y-auto sm:max-w-md">
      <SheetHeader>
        <SheetTitle className="font-[Roboto]">Novo ponto de venda</SheetTitle>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-6">
        <div className="space-y-2">
          <Label htmlFor="nomePdv" className="text-[#1A1A1A]">
            Nome do PDV
          </Label>
          <Input
            id="nomePdv"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="PDV Bairro Rangel"
            className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="codigo" className="text-[#1A1A1A]">
            Código (Pingpoint)
          </Label>
          <Input
            id="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
            placeholder="PDV-0005"
            className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="enderecoPdv" className="text-[#1A1A1A]">
            Endereço (opcional)
          </Label>
          <Input
            id="enderecoPdv"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Rua X, Bairro Y, Luanda"
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
            disabled={isPending}
            className="h-11 w-full gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16] disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Criar PDV'
            )}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  )
}

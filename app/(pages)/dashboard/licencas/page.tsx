'use client'

import { useState } from 'react'
import {
  Loader2,
  FileBadge,
  Plus,
  ChevronDown,
  RefreshCw,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusLicenca } from '../../../../generated/prisma/enums'
import { useLicencas } from '../../../core/hooks/useLicencas'
import { useAgentes } from '../../../core/hooks/useAgentes'
import { useCriarLicenca } from '../../../core/hooks/useCriarLicenca'
import { useRenovarLicenca } from '../../../core/hooks/useRenovarLicenca'

const LABEL_STATUS: Record<StatusLicenca, string> = {
  ATIVA: 'Ativa',
  PENDENTE_RENOVACAO: 'Pendente de renovação',
  EXPIRADA: 'Expirada',
  SUSPENSA: 'Suspensa',
  CANCELADA: 'Cancelada',
}

const COR_STATUS: Record<StatusLicenca, string> = {
  ATIVA: 'bg-[#1A8F4C]/10 text-[#1A8F4C]',
  PENDENTE_RENOVACAO: 'bg-[#FFC20E]/15 text-[#8a6500]',
  EXPIRADA: 'bg-[#E2231A]/10 text-[#E2231A]',
  SUSPENSA: 'bg-[#1A1A1A]/10 text-[#1A1A1A]/60',
  CANCELADA: 'bg-[#1A1A1A]/10 text-[#1A1A1A]/40',
}

const FILTROS: { label: string; valor: StatusLicenca | undefined }[] = [
  { label: 'Todas', valor: undefined },
  { label: 'Ativas', valor: 'ATIVA' },
  { label: 'Pendentes', valor: 'PENDENTE_RENOVACAO' },
  { label: 'Expiradas', valor: 'EXPIRADA' },
]

export default function DashboardLicencasPage() {
  const [filtro, setFiltro] = useState<StatusLicenca | undefined>(undefined)
  const [busca, setBusca] = useState('')
  const [modalNovaAberto, setModalNovaAberto] = useState(false)
  const [licencaParaRenovar, setLicencaParaRenovar] = useState<string | null>(
    null,
  )

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useLicencas(filtro, busca || undefined)

  const licencas = data?.pages.flatMap((p) => p.licencas) ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-[Roboto] text-xs font-bold uppercase tracking-[0.2em] text-[#E2231A]">
            Gestão de licenças
          </p>
          <h1 className="font-[Roboto] text-2xl font-bold text-[#1A1A1A]">
            Licenças
          </h1>
        </div>

        <Button
          onClick={() => setModalNovaAberto(true)}
          className="h-11 gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16]"
        >
          <Plus className="h-4 w-4" />
          Nova licença
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
        <Input
          placeholder="Buscar por número ou agente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="h-9 max-w-xs border-[#1A1A1A]/15 text-sm focus-visible:ring-[#E2231A]"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#E2231A]" />
        </div>
      ) : licencas.length === 0 ? (
        <div className="rounded-md border border-[#1A1A1A]/10 bg-white px-6 py-16 text-center">
          <FileBadge className="mx-auto mb-3 h-8 w-8 text-[#1A1A1A]/20" />
          <p className="text-sm text-[#1A1A1A]/50">
            Nenhuma licença encontrada.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-md border border-[#1A1A1A]/10 bg-white">
            <ul className="divide-y divide-[#1A1A1A]/10">
              {licencas.map((licenca) => (
                <li
                  key={licenca.id}
                  className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      {licenca.numero}
                    </p>
                    <p className="truncate text-xs text-[#1A1A1A]/55">
                      {licenca.agente.nome} · NIF {licenca.agente.nif}
                    </p>
                    <p className="text-xs text-[#1A1A1A]/40">
                      Válida até{' '}
                      {new Date(licenca.dataValidade).toLocaleDateString(
                        'pt-PT',
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold ${COR_STATUS[licenca.status]}`}
                    >
                      {LABEL_STATUS[licenca.status]}
                    </span>

                    {licenca.status === 'PENDENTE_RENOVACAO' && (
                      <button
                        onClick={() => setLicencaParaRenovar(licenca.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-[#1A1A1A]/15 px-3 py-1.5 text-xs font-medium text-[#1A1A1A]/70 transition hover:border-[#E2231A]/30 hover:bg-[#E2231A]/[0.04] hover:text-[#E2231A]"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Renovar
                      </button>
                    )}
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

      {modalNovaAberto && (
        <ModalNovaLicenca onClose={() => setModalNovaAberto(false)} />
      )}

      {licencaParaRenovar && (
        <ModalRenovarLicenca
          licencaId={licencaParaRenovar}
          onClose={() => setLicencaParaRenovar(null)}
        />
      )}
    </div>
  )
}

function ModalNovaLicenca({ onClose }: { onClose: () => void }) {
  const { data: dadosAgentes, isLoading: carregandoAgentes } = useAgentes()
  const { mutate: criar, isPending, error } = useCriarLicenca()

  const [agenteId, setAgenteId] = useState('')
  const [numero, setNumero] = useState('')
  const [dataEmissao, setDataEmissao] = useState('')
  const [dataValidade, setDataValidade] = useState('')
  const [sapReferencia, setSapReferencia] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    criar(
      {
        agenteId,
        numero,
        dataEmissao,
        dataValidade,
        sapReferencia: sapReferencia || undefined,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-md bg-white p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-[Roboto] text-lg font-bold text-[#1A1A1A]">
            Nova licença
          </h2>
          <button
            onClick={onClose}
            className="text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#1A1A1A]">Agente</Label>
            <Select
              value={agenteId}
              onValueChange={setAgenteId}
              disabled={carregandoAgentes}
            >
              <SelectTrigger className="h-11 border-[#1A1A1A]/15">
                <SelectValue placeholder="Escolhe o agente" />
              </SelectTrigger>
              <SelectContent>
                {dadosAgentes?.agentes.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome} · {a.nif}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero" className="text-[#1A1A1A]">
              Número da licença
            </Label>
            <Input
              id="numero"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              required
              placeholder="LIC-2026-0003"
              className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="dataEmissao" className="text-[#1A1A1A]">
                Emissão
              </Label>
              <Input
                id="dataEmissao"
                type="date"
                value={dataEmissao}
                onChange={(e) => setDataEmissao(e.target.value)}
                required
                className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataValidade" className="text-[#1A1A1A]">
                Validade
              </Label>
              <Input
                id="dataValidade"
                type="date"
                value={dataValidade}
                onChange={(e) => setDataValidade(e.target.value)}
                required
                className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sapReferencia" className="text-[#1A1A1A]">
              Referência SAP (opcional)
            </Label>
            <Input
              id="sapReferencia"
              value={sapReferencia}
              onChange={(e) => setSapReferencia(e.target.value)}
              className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
            />
          </div>

          {error && (
            <p className="rounded-md bg-[#E2231A]/10 px-3 py-2 text-sm text-[#E2231A]">
              {error.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending || !agenteId}
            className="h-11 w-full gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16] disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Criar licença'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

function ModalRenovarLicenca({
  licencaId,
  onClose,
}: {
  licencaId: string
  onClose: () => void
}) {
  const { mutate: renovar, isPending, error } = useRenovarLicenca()
  const [novaValidade, setNovaValidade] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    renovar(
      { id: licencaId, payload: { novaValidade } },
      { onSuccess: onClose },
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-md bg-white p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-[Roboto] text-lg font-bold text-[#1A1A1A]">
            Aprovar renovação
          </h2>
          <button
            onClick={onClose}
            className="text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="novaValidade" className="text-[#1A1A1A]">
              Nova data de validade
            </Label>
            <Input
              id="novaValidade"
              type="date"
              value={novaValidade}
              onChange={(e) => setNovaValidade(e.target.value)}
              required
              className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
            />
          </div>

          {error && (
            <p className="rounded-md bg-[#E2231A]/10 px-3 py-2 text-sm text-[#E2231A]">
              {error.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="h-11 w-full gap-2 bg-[#1A8F4C] font-[Roboto] font-semibold text-white hover:bg-[#157a3f] disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Aprovar renovação'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

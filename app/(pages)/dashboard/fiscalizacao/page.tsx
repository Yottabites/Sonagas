'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Loader2,
  ShieldCheck,
  Plus,
  ChevronDown,
  CheckCircle2,
  XCircle,
  MapPin,
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
  SheetClose,
} from '@/components/ui/sheet'
import { NativeAutocomplete } from '@/components/ui/native-autocomplete'
import { FiscalizacaoResumo } from '../../../core/services/fiscalizacao.service'
import { useFiscalizacoes } from '../../../core/hooks/useFiscalizacoes'
import { useCriarFiscalizacao } from '../../../core/hooks/useCriarFiscalizacao'
import { useLicencas } from '../../../core/hooks/useLicencas'

// Leaflet usa `window` — precisa ser carregado só no browser, nunca no SSR.
const MapaFiscalizacoes = dynamic(
  () =>
    import('@/components/dashboard/MapaFiscalizacoes').then(
      (mod) => mod.MapaFiscalizacoes,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] animate-pulse rounded-md bg-[#1A1A1A]/5" />
    ),
  },
)

const FILTROS: { label: string; valor: 'true' | 'false' | undefined }[] = [
  { label: 'Todas', valor: undefined },
  { label: 'Conformes', valor: 'true' },
  { label: 'Não conformes', valor: 'false' },
]

export default function DashboardFiscalizacaoPage() {
  const [filtro, setFiltro] = useState<'true' | 'false' | undefined>(undefined)
  const [sheetNovaAberto, setSheetNovaAberto] = useState(false)
  const [pingSelecionado, setPingSelecionado] =
    useState<FiscalizacaoResumo | null>(null)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFiscalizacoes(filtro)

  const fiscalizacoes = data?.pages.flatMap((p) => p.fiscalizacoes) ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-[Roboto] text-xs font-bold uppercase tracking-[0.2em] text-[#E2231A]">
            Fiscalização
          </p>
          <h1 className="font-[Roboto] text-2xl font-bold text-[#1A1A1A]">
            Fiscalizações
          </h1>
        </div>

        <Sheet open={sheetNovaAberto} onOpenChange={setSheetNovaAberto}>
          <SheetTrigger asChild>
            <Button className="h-11 gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16]">
              <Plus className="h-4 w-4" />
              Registar fiscalização
            </Button>
          </SheetTrigger>
          <FormularioNovaFiscalizacao
            onSuccess={() => setSheetNovaAberto(false)}
          />
        </Sheet>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MAPA — todos os pings (pontos fiscalizados) */}
      {/* ---------------------------------------------------- */}
      <MapaFiscalizacoes pings={fiscalizacoes} />

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
      ) : fiscalizacoes.length === 0 ? (
        <div className="rounded-md border border-[#1A1A1A]/10 bg-white px-6 py-16 text-center">
          <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-[#1A1A1A]/20" />
          <p className="text-sm text-[#1A1A1A]/50">
            Nenhuma fiscalização registada.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-md border border-[#1A1A1A]/10 bg-white">
            <ul className="divide-y divide-[#1A1A1A]/10">
              {fiscalizacoes.map((f) => (
                <li
                  key={f.id}
                  onClick={() => setPingSelecionado(f)}
                  className="cursor-pointer px-6 py-4 transition hover:bg-[#1A1A1A]/[0.02]"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {f.agente.nome}
                      </p>
                      <p className="text-xs text-[#1A1A1A]/55">
                        Licença {f.licenca.numero} · Fiscal: {f.fiscal.nome}
                      </p>
                      <p className="text-xs text-[#1A1A1A]/40">
                        {new Date(f.dataFiscalizacao).toLocaleDateString(
                          'pt-PT',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      </p>
                    </div>

                    {f.conforme ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-md bg-[#1A8F4C]/10 px-3 py-1 text-xs font-semibold text-[#1A8F4C]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Conforme
                      </span>
                    ) : (
                      <span className="flex shrink-0 items-center gap-1 rounded-md bg-[#E2231A]/10 px-3 py-1 text-xs font-semibold text-[#E2231A]">
                        <XCircle className="h-3.5 w-3.5" />
                        Não conforme
                      </span>
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

      {/* ---------------------------------------------------- */}
      {/* SHEET — Ver detalhes de um ping */}
      {/* ---------------------------------------------------- */}
      <Sheet
        open={!!pingSelecionado}
        onOpenChange={(open) => !open && setPingSelecionado(null)}
      >
        {pingSelecionado && (
          <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
            <SheetHeader>
              <SheetTitle className="font-[Roboto]">
                {pingSelecionado.agente.nome}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-5 px-4 pb-6">
              <div className="flex items-center gap-2">
                {pingSelecionado.conforme ? (
                  <span className="flex items-center gap-1 rounded-md bg-[#1A8F4C]/10 px-3 py-1 text-xs font-semibold text-[#1A8F4C]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Conforme
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-md bg-[#E2231A]/10 px-3 py-1 text-xs font-semibold text-[#E2231A]">
                    <XCircle className="h-3.5 w-3.5" />
                    Não conforme
                  </span>
                )}
              </div>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
                  <dt className="text-[#1A1A1A]/50">Licença</dt>
                  <dd className="font-medium text-[#1A1A1A]">
                    {pingSelecionado.licenca.numero}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
                  <dt className="text-[#1A1A1A]/50">Fiscal responsável</dt>
                  <dd className="font-medium text-[#1A1A1A]">
                    {pingSelecionado.fiscal.nome}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-[#1A1A1A]/10 pb-2">
                  <dt className="text-[#1A1A1A]/50">Data</dt>
                  <dd className="font-medium text-[#1A1A1A]">
                    {new Date(pingSelecionado.dataFiscalizacao).toLocaleString(
                      'pt-PT',
                    )}
                  </dd>
                </div>
              </dl>

              {pingSelecionado.observacoes && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#1A1A1A]/40">
                    Observações
                  </p>
                  <p className="rounded-lg bg-[#1A1A1A]/[0.03] px-3 py-2 text-sm text-[#1A1A1A]/70">
                    {pingSelecionado.observacoes}
                  </p>
                </div>
              )}

              {pingSelecionado.latitude && pingSelecionado.longitude && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#1A1A1A]/40">
                    <MapPin className="h-3.5 w-3.5" />
                    Localização do ping
                  </p>
                  <MapaFiscalizacoes pings={[pingSelecionado]} altura="220px" />
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
// FORMULÁRIO — dentro do Sheet de criação
// ------------------------------------------------------------
function FormularioNovaFiscalizacao({ onSuccess }: { onSuccess: () => void }) {
  const { data: dadosLicencas, isLoading: carregandoLicencas } = useLicencas(
    'ATIVA',
    undefined,
  )
  const { mutate: criar, isPending, error } = useCriarFiscalizacao()

  const [licencaId, setLicencaId] = useState('')
  const [conforme, setConforme] = useState<'true' | 'false'>('true')
  const [observacoes, setObservacoes] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [obtendoLocalizacao, setObtendoLocalizacao] = useState(false)

  const licencas = dadosLicencas?.pages.flatMap((p) => p.licencas) ?? []
  const opcoesLicencas = licencas.map((l) => ({
    id: l.id,
    label: `${l.numero} · ${l.agente.nome}`,
  }))

  function obterLocalizacaoAtual() {
    if (!navigator.geolocation) return
    setObtendoLocalizacao(true)
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        setLatitude(posicao.coords.latitude.toString())
        setLongitude(posicao.coords.longitude.toString())
        setObtendoLocalizacao(false)
      },
      () => setObtendoLocalizacao(false),
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    criar(
      {
        licencaId,
        conforme: conforme === 'true',
        observacoes: observacoes.trim() || undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
      },
      { onSuccess },
    )
  }

  return (
    <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
      <SheetHeader>
        <SheetTitle className="font-[Roboto]">Registar fiscalização</SheetTitle>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-6">
        <NativeAutocomplete
          label="Licença / Agente"
          placeholder="Escreve o número da licença ou nome do agente..."
          opcoes={opcoesLicencas}
          valorId={licencaId}
          onChange={setLicencaId}
          disabled={carregandoLicencas}
        />

        {/* Select nativo do browser — sem componente custom */}
        <div className="space-y-2">
          <Label htmlFor="conforme" className="text-[#1A1A1A]">
            Conformidade
          </Label>
          <select
            id="conforme"
            value={conforme}
            onChange={(e) => setConforme(e.target.value as 'true' | 'false')}
            className="h-11 w-full rounded-md border border-[#1A1A1A]/15 bg-white px-3 text-sm text-[#1A1A1A] outline-none focus:border-[#E2231A] focus:ring-1 focus:ring-[#E2231A]"
          >
            <option value="true">Conforme</option>
            <option value="false">Não conforme</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes" className="text-[#1A1A1A]">
            Observações
          </Label>
          <Textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Detalhes da fiscalização realizada no local..."
            className="min-h-20 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[#1A1A1A]">Localização (ping)</Label>
            <button
              type="button"
              onClick={obterLocalizacaoAtual}
              disabled={obtendoLocalizacao}
              className="flex items-center gap-1 text-xs font-medium text-[#E2231A] hover:underline disabled:opacity-50"
            >
              <MapPin className="h-3.5 w-3.5" />
              {obtendoLocalizacao ? 'A obter...' : 'Usar localização atual'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
            />
            <Input
              placeholder="Longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-[#E2231A]/10 px-3 py-2 text-sm text-[#E2231A]">
            {error.message}
          </p>
        )}

        <SheetFooter className="px-0">
          <Button
            type="submit"
            disabled={isPending || !licencaId}
            className="h-11 w-full gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16] disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Registar fiscalização'
            )}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  )
}

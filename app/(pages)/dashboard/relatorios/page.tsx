'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import {
  Loader2,
  FileDown,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileBadge,
  Users,
  Truck,
  ShoppingBag,
  Boxes,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDadosRelatorio } from '../../../core/hooks/useDadosRelatorio'

// Wrapper que isola o @react-pdf/renderer do SSR num único componente.
// Importar assim resolve o erro "su is not a function" do Next.js.
const BotaoExportarPDF = dynamic(
  () =>
    import('../../../../components/dashboard/BotaoExportarPDF').then(
      (mod) => mod.BotaoExportarPDF,
    ),
  {
    ssr: false,
    loading: () => (
      <Button
        disabled
        className="h-9 gap-1.5 bg-[#E2231A] text-white opacity-60"
      >
        <FileDown className="h-3.5 w-3.5" />
        Exportar PDF
      </Button>
    ),
  },
)

const VERMELHO = '#E2231A'
const AMARELO = '#FFC20E'
const VERDE = '#1A8F4C'
const GRAFITE = '#1A1A1A'

const COR_STATUS_PEDIDO: Record<string, string> = {
  PENDENTE: AMARELO,
  APROVADO: '#3B82F6',
  EM_PROCESSAMENTO: '#8B5CF6',
  CONCLUIDO: VERDE,
  REJEITADO: VERMELHO,
}

const COR_STATUS_DIST: Record<string, string> = {
  PLANEADA: '#94A3B8',
  EM_TRANSITO: AMARELO,
  ENTREGUE: VERDE,
  CANCELADA: VERMELHO,
}

const LABEL_STATUS_PEDIDO: Record<string, string> = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  EM_PROCESSAMENTO: 'Em proc.',
  CONCLUIDO: 'Concluído',
  REJEITADO: 'Rejeitado',
}

const LABEL_STATUS_DIST: Record<string, string> = {
  PLANEADA: 'Planeada',
  EM_TRANSITO: 'Em trânsito',
  ENTREGUE: 'Entregue',
  CANCELADA: 'Cancelada',
}

export default function DashboardRelatoriosPage() {
  const { data, isLoading, refetch, isFetching } = useDadosRelatorio()
  const [exportando, setExportando] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#E2231A]" />
      </div>
    )
  }

  if (!data) return null

  const {
    kpis,
    licencasPorStatus,
    pedidosPorStatus,
    distribuicoesPorStatus,
    estoqueProdutos,
    fiscalizacoes,
    distribuicoesMes,
    pedidosMes,
    topAgentes,
    topZonas,
    geradoEm,
  } = data

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* TOPO */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-[Roboto] text-xs font-bold uppercase tracking-[0.2em] text-[#E2231A]">
            Analytics
          </p>
          <h1 className="font-[Roboto] text-2xl font-bold text-[#1A1A1A]">
            Relatórios
          </h1>
          <p className="mt-0.5 text-xs text-[#1A1A1A]/40">
            Dados de {new Date(geradoEm).toLocaleString('pt-PT')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1.5 border-[#1A1A1A]/15"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>

          {/* Botão de exportar PDF */}
          <BotaoExportarPDF dados={data} />
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* KPIs */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          {
            icon: Users,
            label: 'Agentes',
            valor: kpis.totalAgentes,
            cor: 'text-[#1A1A1A]/70',
            bg: 'bg-[#1A1A1A]/[0.04]',
          },
          {
            icon: ShoppingBag,
            label: 'Revendedores',
            valor: kpis.totalRevendedores,
            cor: 'text-[#1A8F4C]',
            bg: 'bg-[#1A8F4C]/10',
          },
          {
            icon: Boxes,
            label: 'Grossistas',
            valor: kpis.totalGrossistas,
            cor: 'text-[#8a6500]',
            bg: 'bg-[#FFC20E]/10',
          },
          {
            icon: FileBadge,
            label: 'Licenças ativas',
            valor: kpis.totalLicencasAtivas,
            cor: 'text-[#1A8F4C]',
            bg: 'bg-[#1A8F4C]/10',
          },
          {
            icon: ShoppingBag,
            label: 'Total pedidos',
            valor: kpis.totalPedidos,
            cor: 'text-[#E2231A]',
            bg: 'bg-[#E2231A]/10',
          },
          {
            icon: Truck,
            label: 'Distribuições',
            valor: kpis.totalDistribuicoes,
            cor: 'text-[#1A1A1A]/70',
            bg: 'bg-[#1A1A1A]/[0.04]',
          },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="rounded-2xl border border-[#1A1A1A]/10 bg-white p-4"
            >
              <div
                className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full ${kpi.bg}`}
              >
                <Icon className={`h-4 w-4 ${kpi.cor}`} />
              </div>
              <p className="font-[Roboto] text-xl font-bold text-[#1A1A1A]">
                {kpi.valor}
              </p>
              <p className="text-[11px] text-[#1A1A1A]/50">{kpi.label}</p>
            </div>
          )
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* LINHA 1: Licenças (pizza) + Fiscalização (anel) */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Cartao titulo="Licenças por estado" icone={FileBadge}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={licencasPorStatus}
                dataKey="valor"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(props: any) => `${props.status}: ${props.valor}`}
                labelLine={false}
              >
                {licencasPorStatus.map((entry, i) => (
                  <Cell key={i} fill={entry.cor ?? VERMELHO} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Cartao>

        <Cartao titulo="Conformidade das fiscalizações" icone={ShieldCheck}>
          <div className="flex items-center justify-center gap-8 pb-4">
            <div className="text-center">
              <p
                className={`font-[Roboto] text-4xl font-bold ${fiscalizacoes.taxaConformidade >= 80 ? 'text-[#1A8F4C]' : 'text-[#E2231A]'}`}
              >
                {fiscalizacoes.taxaConformidade}%
              </p>
              <p className="text-xs text-[#1A1A1A]/50">Taxa de conformidade</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#1A8F4C]" />
                <p className="text-sm text-[#1A1A1A]">
                  <span className="font-bold">{fiscalizacoes.conformes}</span>{' '}
                  conformes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-[#E2231A]" />
                <p className="text-sm text-[#1A1A1A]">
                  <span className="font-bold">
                    {fiscalizacoes.naoConformes}
                  </span>{' '}
                  não conformes
                </p>
              </div>
              <p className="text-xs text-[#1A1A1A]/40">
                {fiscalizacoes.total} total
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Conformes', value: fiscalizacoes.conformes },
                  { name: 'Não conformes', value: fiscalizacoes.naoConformes },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={45}
                dataKey="value"
              >
                <Cell fill={VERDE} />
                <Cell fill={VERMELHO} />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Cartao>
      </div>

      {/* ---------------------------------------------------- */}
      {/* LINHA 2: Distribuições por mês + Pedidos por mês */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Cartao titulo="Distribuições — Últimos 6 meses" icone={Truck}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={distribuicoesMes}
              margin={{ top: 4, right: 8, bottom: 0, left: -20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="total"
                name="Total"
                fill={GRAFITE}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="entregues"
                name="Entregues"
                fill={VERDE}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Cartao>

        <Cartao titulo="Pedidos — Últimos 6 meses" icone={ShoppingBag}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={pedidosMes}
              margin={{ top: 4, right: 8, bottom: 0, left: -20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke={GRAFITE}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="aprovados"
                name="Aprovados"
                stroke={VERDE}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Cartao>
      </div>

      {/* ---------------------------------------------------- */}
      {/* LINHA 3: Pedidos por status + Distribuições por status */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Cartao titulo="Pedidos por estado" icone={ShoppingBag}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={pedidosPorStatus.map((p) => ({
                ...p,
                label: LABEL_STATUS_PEDIDO[p.status ?? ''] ?? p.status,
                cor: COR_STATUS_PEDIDO[p.status ?? ''] ?? VERMELHO,
              }))}
              layout="vertical"
              margin={{ top: 4, right: 20, bottom: 0, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <YAxis dataKey="label" type="category" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {pedidosPorStatus.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={COR_STATUS_PEDIDO[entry.status ?? ''] ?? VERMELHO}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Cartao>

        <Cartao titulo="Distribuições por estado" icone={Truck}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={distribuicoesPorStatus.map((d) => ({
                ...d,
                label: LABEL_STATUS_DIST[d.status ?? ''] ?? d.status,
              }))}
              layout="vertical"
              margin={{ top: 4, right: 20, bottom: 0, left: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <YAxis dataKey="label" type="category" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {distribuicoesPorStatus.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={COR_STATUS_DIST[entry.status ?? ''] ?? GRAFITE}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Cartao>
      </div>

      {/* ---------------------------------------------------- */}
      {/* LINHA 4: Estoque + Top Agentes + Top Zonas */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Cartao titulo="Estoque por produto" icone={Boxes}>
          <div className="space-y-3">
            {estoqueProdutos.map((produto) => {
              const max = Math.max(
                ...estoqueProdutos.map((p) => p.quantidade ?? 0),
                1,
              )
              const pct = ((produto.quantidade ?? 0) / max) * 100
              return (
                <div key={produto.nome}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-[#1A1A1A]/70">{produto.nome}</span>
                    <span className="font-bold text-[#1A1A1A]">
                      {(produto.quantidade ?? 0).toLocaleString('pt-PT')} un.
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#1A1A1A]/10">
                    <div
                      className="h-2 rounded-full bg-[#1A1A1A]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Cartao>

        <Cartao titulo="Top 5 agentes" icone={Users}>
          <div className="space-y-3">
            {topAgentes.map((agente, i) => {
              const max = Math.max(
                ...topAgentes.map((a) => a.fiscalizacoes ?? 0),
                1,
              )
              const pct = ((agente.fiscalizacoes ?? 0) / max) * 100
              return (
                <div key={agente.nome}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-[#1A1A1A]/70">
                      <span className="font-bold text-[#E2231A]">#{i + 1}</span>
                      {agente.nome}
                    </span>
                    <span className="font-bold text-[#1A1A1A]">
                      {agente.fiscalizacoes}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#1A1A1A]/10">
                    <div
                      className="h-2 rounded-full bg-[#E2231A]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Cartao>

        <Cartao titulo="Zonas geográficas" icone={Users}>
          <div className="space-y-2">
            {topZonas.map((zona, i) => (
              <div
                key={zona.nome}
                className="flex items-center justify-between rounded-lg bg-[#1A1A1A]/[0.03] px-3 py-2"
              >
                <div>
                  <p className="text-xs font-semibold text-[#1A1A1A]">
                    {zona.nome}
                  </p>
                  <p className="text-[11px] text-[#1A1A1A]/45">
                    {zona.provincia}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-[Roboto] text-base font-bold text-[#1A1A1A]">
                    {zona.agentes}
                  </p>
                  <p className="text-[11px] text-[#1A1A1A]/45">agentes</p>
                </div>
              </div>
            ))}
          </div>
        </Cartao>
      </div>
    </div>
  )
}

function Cartao({
  titulo,
  icone: Icone,
  children,
}: {
  titulo: string
  icone: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-[#1A1A1A]/10 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icone className="h-4 w-4 text-[#E2231A]" />
        <p className="font-[Roboto] text-sm font-bold text-[#1A1A1A]">
          {titulo}
        </p>
      </div>
      {children}
    </div>
  )
}

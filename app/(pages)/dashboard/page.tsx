'use client'

import {
  Loader2,
  FileBadge,
  Boxes,
  Truck,
  ShieldCheck,
  BarChart3,
  Users,
  Store,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useUtilizadorAtual } from '../../core/hooks/useUtilizadorAtual'
import { useResumoDashboard } from '../../core/hooks/useResumoDashboard'

export default function DashboardHomePage() {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const { data, isLoading } = useResumoDashboard()

  const utilizador = dadosUtilizador?.utilizador
  const resumo = data?.resumo

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#E2231A]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-[Roboto] text-xs font-bold uppercase tracking-[0.2em] text-[#E2231A]">
          Painel Sonagás
        </p>
        <h1 className="font-[Roboto] text-2xl font-bold text-[#1A1A1A]">
          Olá, {utilizador?.nome ?? 'bem-vindo'}
        </h1>
      </div>

      {/* ---------------------------------------------------- */}
      {/* VISÃO GERAL — só Admin */}
      {/* ---------------------------------------------------- */}
      {resumo?.visaoGeral && (
        <Secao titulo="Visão geral">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CartaoResumo
              icon={Store}
              label="Revendedores/Grossistas ativos"
              valor={resumo.visaoGeral.totalRevendedores}
              cor="text-[#1A8F4C]"
              bg="bg-[#1A8F4C]/10"
            />
            <CartaoResumo
              icon={Users}
              label="Utilizadores ativos"
              valor={resumo.visaoGeral.totalUtilizadores}
              cor="text-[#1A1A1A]/70"
              bg="bg-[#1A1A1A]/[0.04]"
            />
          </div>
        </Secao>
      )}

      {/* ---------------------------------------------------- */}
      {/* LICENÇAS — Admin e Gestor de Licenças */}
      {/* ---------------------------------------------------- */}
      {resumo?.licencas && (
        <Secao titulo="Licenças">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <CartaoResumo
              icon={FileBadge}
              label="Licenças ativas"
              valor={resumo.licencas.ativas}
              cor="text-[#1A8F4C]"
              bg="bg-[#1A8F4C]/10"
            />
            <CartaoResumo
              icon={FileBadge}
              label="Pendentes de renovação"
              valor={resumo.licencas.pendentesRenovacao}
              cor="text-[#8a6500]"
              bg="bg-[#FFC20E]/10"
            />
            <CartaoResumo
              icon={FileBadge}
              label="Expiradas"
              valor={resumo.licencas.expiradas}
              cor="text-[#E2231A]"
              bg="bg-[#E2231A]/10"
            />
          </div>
        </Secao>
      )}

      {/* ---------------------------------------------------- */}
      {/* ESTOQUE — Admin e Gestor de Estoque */}
      {/* ---------------------------------------------------- */}
      {resumo?.estoque && (
        <Secao titulo="Estoque e distribuição">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CartaoResumo
              icon={Boxes}
              label="Pedidos pendentes de aprovação"
              valor={resumo.estoque.pedidosPendentes}
              cor="text-[#8a6500]"
              bg="bg-[#FFC20E]/10"
            />
            <CartaoResumo
              icon={Truck}
              label="Distribuições planeadas"
              valor={resumo.estoque.distribuicoesPlaneadas}
              cor="text-[#1A1A1A]/70"
              bg="bg-[#1A1A1A]/[0.04]"
            />
          </div>

          <div className="mt-4 rounded-md border border-[#1A1A1A]/10 bg-white p-5">
            <p className="mb-3 text-sm font-semibold text-[#1A1A1A]">
              Quantidade em estoque por produto
            </p>
            <ul className="space-y-2">
              {resumo.estoque.produtos.map((produto: any) => (
                <li
                  key={produto.nome}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-[#1A1A1A]/70">{produto.nome}</span>
                  <span className="font-semibold text-[#1A1A1A]">
                    {produto.quantidadeTotal.toLocaleString('pt-PT')} un.
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Secao>
      )}

      {/* ---------------------------------------------------- */}
      {/* FISCALIZAÇÃO — Admin e Fiscal */}
      {/* ---------------------------------------------------- */}
      {resumo?.fiscalizacao && (
        <Secao titulo="Fiscalização">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CartaoResumo
              icon={ShieldCheck}
              label="Licenças a aguardar fiscalização"
              valor={resumo.fiscalizacao.licencasParaFiscalizar}
              cor="text-[#8a6500]"
              bg="bg-[#FFC20E]/10"
            />
          </div>

          <div className="mt-4 rounded-md border border-[#1A1A1A]/10 bg-white">
            <p className="border-b border-[#1A1A1A]/10 px-5 py-3 text-sm font-semibold text-[#1A1A1A]">
              Últimas fiscalizações
            </p>
            {resumo.fiscalizacao.ultimasFiscalizacoes.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-[#1A1A1A]/50">
                Nenhuma fiscalização registada ainda.
              </p>
            ) : (
              <ul className="divide-y divide-[#1A1A1A]/10">
                {resumo.fiscalizacao.ultimasFiscalizacoes.map((f: any) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">
                        {f.agente}
                      </p>
                      <p className="text-xs text-[#1A1A1A]/45">
                        {new Date(f.data).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    {f.conforme ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-[#1A8F4C]">
                        <CheckCircle2 className="h-4 w-4" />
                        Conforme
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-[#E2231A]">
                        <XCircle className="h-4 w-4" />
                        Não conforme
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Secao>
      )}

      {/* ---------------------------------------------------- */}
      {/* RELATÓRIOS — Admin e Analista */}
      {/* ---------------------------------------------------- */}
      {resumo?.relatorios && (
        <Secao titulo="Relatórios e análise">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CartaoResumo
              icon={Users}
              label="Agentes ativos"
              valor={resumo.relatorios.totalAgentes}
              cor="text-[#1A1A1A]/70"
              bg="bg-[#1A1A1A]/[0.04]"
            />
            <CartaoResumo
              icon={Truck}
              label="Distribuições entregues"
              valor={resumo.relatorios.totalDistribuicoesEntregues}
              cor="text-[#1A8F4C]"
              bg="bg-[#1A8F4C]/10"
            />
          </div>

          <div className="mt-4 rounded-md border border-[#1A1A1A]/10 bg-white">
            <p className="border-b border-[#1A1A1A]/10 px-5 py-3 text-sm font-semibold text-[#1A1A1A]">
              Últimos relatórios gerados
            </p>
            {resumo.relatorios.ultimosRelatorios.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-[#1A1A1A]/50">
                Nenhum relatório gerado ainda.
              </p>
            ) : (
              <ul className="divide-y divide-[#1A1A1A]/10">
                {resumo.relatorios.ultimosRelatorios.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <BarChart3 className="h-4 w-4 shrink-0 text-[#E2231A]" />
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">
                        {r.titulo}
                      </p>
                      <p className="text-xs text-[#1A1A1A]/45">
                        {new Date(r.criadoEm).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Secao>
      )}
    </div>
  )
}

function Secao({
  titulo,
  children,
}: {
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className="mb-3 font-[Roboto] text-base font-bold text-[#1A1A1A]">
        {titulo}
      </h2>
      {children}
    </div>
  )
}

interface CartaoResumoProps {
  icon: React.ElementType
  label: string
  valor: number
  cor: string
  bg: string
}

function CartaoResumo({
  icon: Icon,
  label,
  valor,
  cor,
  bg,
}: CartaoResumoProps) {
  return (
    <div className="rounded-md border border-[#1A1A1A]/10 bg-white p-5">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${bg}`}
      >
        <Icon className={`h-5 w-5 ${cor}`} />
      </div>
      <p className="font-[Roboto] text-2xl font-bold text-[#1A1A1A]">{valor}</p>
      <p className="text-xs text-[#1A1A1A]/55">{label}</p>
    </div>
  )
}

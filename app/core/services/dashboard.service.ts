import { apiClient } from '@/lib/api-client'

export interface ResumoLicencas {
  ativas: number
  pendentesRenovacao: number
  expiradas: number
}

export interface ResumoEstoqueProduto {
  nome: string
  quantidadeTotal: number
}

export interface ResumoEstoque {
  produtos: ResumoEstoqueProduto[]
  pedidosPendentes: number
  distribuicoesPlaneadas: number
}

export interface UltimaFiscalizacao {
  id: string
  agente: string
  conforme: boolean
  data: string
}

export interface ResumoFiscalizacao {
  licencasParaFiscalizar: number
  ultimasFiscalizacoes: UltimaFiscalizacao[]
}

export interface RelatorioResumo {
  id: string
  titulo: string
  tipo: string
  criadoEm: string
}

export interface ResumoRelatorios {
  totalAgentes: number
  totalDistribuicoesEntregues: number
  ultimosRelatorios: RelatorioResumo[]
}

export interface ResumoVisaoGeral {
  totalRevendedores: number
  totalUtilizadores: number
}

export interface ResumoDashboard {
  licencas?: ResumoLicencas
  estoque?: ResumoEstoque
  fiscalizacao?: ResumoFiscalizacao
  relatorios?: ResumoRelatorios
  visaoGeral?: ResumoVisaoGeral
}

export interface ResumoDashboardResponse {
  perfil: string
  resumo: ResumoDashboard
}

export const dashboardService = {
  obterResumo: () =>
    apiClient.get<ResumoDashboardResponse>('/api/dashboard/resumo'),
}

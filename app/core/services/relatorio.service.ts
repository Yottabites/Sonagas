import { apiClient } from '@/lib/api-client'

export interface KPIsRelatorio {
  totalAgentes: number
  totalRevendedores: number
  totalGrossistas: number
  totalLicencasAtivas: number
  totalLicencasPendentes: number
  totalLicencasExpiradas: number
  totalPedidos: number
  totalDistribuicoes: number
}

export interface DadoGrafico {
  status?: string
  mes?: string
  nome?: string
  total?: number
  valor?: number
  cor?: string
  entregues?: number
  aprovados?: number
  quantidade?: number
  fiscalizacoes?: number
  agentes?: number
  provincia?: string
}

export interface DadosFiscalizacoes {
  conformes: number
  naoConformes: number
  total: number
  taxaConformidade: number
}

export interface DadosRelatorio {
  kpis: KPIsRelatorio
  licencasPorStatus: DadoGrafico[]
  pedidosPorStatus: DadoGrafico[]
  distribuicoesPorStatus: DadoGrafico[]
  estoqueProdutos: DadoGrafico[]
  fiscalizacoes: DadosFiscalizacoes
  distribuicoesMes: DadoGrafico[]
  pedidosMes: DadoGrafico[]
  topAgentes: DadoGrafico[]
  topZonas: DadoGrafico[]
  geradoEm: string
}

export const relatorioService = {
  obterDados: () =>
    apiClient.get<DadosRelatorio>('/api/dashboard/relatorios/dados'),
}

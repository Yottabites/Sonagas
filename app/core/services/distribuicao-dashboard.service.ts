import { apiClient } from '@/lib/api-client'

export type StatusDistribuicaoDashboard =
  | 'PLANEADA'
  | 'EM_TRANSITO'
  | 'ENTREGUE'
  | 'CANCELADA'

export interface ItemDistribuicaoDashboard {
  produto: string
  quantidade: number
}

export interface DistribuicaoDashboard {
  id: string
  status: StatusDistribuicaoDashboard
  dataPrevista: string | null
  dataEntrega: string | null
  observacoes: string | null
  agente: { id: string; nome: string; contacto: string | null }
  pontoVenda: {
    id: string
    nome: string
    codigo: string
    revendedor: { nome: string }
  } | null
  itens: ItemDistribuicaoDashboard[]
}

export interface ListarDistribuicoesResponse {
  distribuicoes: DistribuicaoDashboard[]
  proximoCursor: string | null
}

export interface CriarDistribuicaoPayload {
  agenteId: string
  pontoVendaId: string
  dataPrevista?: string
  observacoes?: string
  itens: { produtoId: string; quantidade: number }[]
}

export interface PontoVendaDashboard {
  id: string
  nome: string
  codigo: string
  revendedor: { nome: string }
}

export const distribuicaoService = {
  listar: (params?: { status?: string; cursor?: string }) => {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.cursor) query.set('cursor', params.cursor)
    const queryString = query.toString()

    return apiClient.get<ListarDistribuicoesResponse>(
      `/api/dashboard/distribuicoes${queryString ? `?${queryString}` : ''}`,
    )
  },

  criar: (payload: CriarDistribuicaoPayload) =>
    apiClient.post<{ message: string; distribuicao: DistribuicaoDashboard }>(
      '/api/dashboard/distribuicoes',
      payload,
    ),

  atualizarStatus: (id: string, status: StatusDistribuicaoDashboard) =>
    apiClient.patch<{ message: string }>(`/api/dashboard/distribuicoes/${id}`, {
      status,
    }),

  listarPontosVenda: () =>
    apiClient.get<{ pontosVenda: PontoVendaDashboard[] }>(
      '/api/dashboard/pontos-venda',
    ),
}

import { apiClient } from '@/lib/api-client'

export interface FiscalizacaoResumo {
  id: string
  conforme: boolean
  observacoes: string | null
  dataFiscalizacao: string
  latitude: number | null
  longitude: number | null
  agente: { nome: string; nif: string }
  licenca: { numero: string }
  fiscal: { nome: string }
}

export interface ListarFiscalizacoesResponse {
  fiscalizacoes: FiscalizacaoResumo[]
  proximoCursor: string | null
}

export interface CriarFiscalizacaoPayload {
  licencaId: string
  conforme: boolean
  observacoes?: string
  latitude?: number
  longitude?: number
}

export const fiscalizacaoService = {
  listar: (params?: { conforme?: 'true' | 'false'; cursor?: string }) => {
    const query = new URLSearchParams()
    if (params?.conforme) query.set('conforme', params.conforme)
    if (params?.cursor) query.set('cursor', params.cursor)
    const queryString = query.toString()

    return apiClient.get<ListarFiscalizacoesResponse>(
      `/api/dashboard/fiscalizacoes${queryString ? `?${queryString}` : ''}`,
    )
  },

  criar: (payload: CriarFiscalizacaoPayload) =>
    apiClient.post<{ message: string; fiscalizacao: FiscalizacaoResumo }>(
      '/api/dashboard/fiscalizacoes',
      payload,
    ),
}

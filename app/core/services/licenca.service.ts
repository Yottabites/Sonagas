import { apiClient } from '@/lib/api-client'

export type StatusLicenca =
  | 'ATIVA'
  | 'PENDENTE_RENOVACAO'
  | 'EXPIRADA'
  | 'SUSPENSA'
  | 'CANCELADA'

export interface LicencaResumo {
  id: string
  numero: string
  status: StatusLicenca
  dataEmissao: string
  dataValidade: string
  sapReferencia: string | null
  agente: { id: string; nome: string; nif: string }
}

export interface ListarLicencasResponse {
  licencas: LicencaResumo[]
  proximoCursor: string | null
}

export interface CriarLicencaPayload {
  agenteId: string
  numero: string
  dataEmissao: string
  dataValidade: string
  sapReferencia?: string
}

export interface RenovarLicencaPayload {
  novaValidade: string
}

export const licencaService = {
  listar: (params?: { status?: string; busca?: string; cursor?: string }) => {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.busca) query.set('busca', params.busca)
    if (params?.cursor) query.set('cursor', params.cursor)
    const queryString = query.toString()

    return apiClient.get<ListarLicencasResponse>(
      `/api/dashboard/licencas${queryString ? `?${queryString}` : ''}`,
    )
  },

  criar: (payload: CriarLicencaPayload) =>
    apiClient.post<{ message: string; licenca: LicencaResumo }>(
      '/api/dashboard/licencas',
      payload,
    ),

  renovar: (id: string, payload: RenovarLicencaPayload) =>
    apiClient.patch<{ message: string; licenca: LicencaResumo }>(
      `/api/dashboard/licencas/${id}/renovar`,
      payload,
    ),
}

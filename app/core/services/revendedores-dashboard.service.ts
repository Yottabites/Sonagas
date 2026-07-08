import { apiClient } from '@/lib/api-client'

export type TipoRevendedor = 'REVENDEDOR' | 'GROSSISTA'

export interface RevendedorListagem {
  id: string
  nome: string
  nif: string
  tipo: TipoRevendedor
  contacto: string | null
  email: string | null
  ativo: boolean
  totalPontosVenda: number
  totalPedidos: number
  utilizador: { id: string; email: string; ativo: boolean } | null
}

export interface PontoVendaDetalhe {
  id: string
  nome: string
  codigo: string
  status: string
  zona: { nome: string; provincia: string } | null
  _count: { distribuicoes: number }
}

export interface RevendedorDetalhe extends RevendedorListagem {
  pontosVenda: PontoVendaDetalhe[]
}

export interface CriarRevendedorPayload {
  nome: string
  nif: string
  tipo: TipoRevendedor
  contacto?: string
  email: string
}

export interface CriarPontoVendaPayload {
  nome: string
  codigo: string
  endereco?: string
  zonaId?: string
}

export const revendedoresDashboardService = {
  listar: (params?: { tipo?: string; busca?: string; cursor?: string }) => {
    const query = new URLSearchParams()
    if (params?.tipo) query.set('tipo', params.tipo)
    if (params?.busca) query.set('busca', params.busca)
    if (params?.cursor) query.set('cursor', params.cursor)
    const queryString = query.toString()

    return apiClient.get<{
      revendedores: RevendedorListagem[]
      proximoCursor: string | null
    }>(`/api/dashboard/revendedores${queryString ? `?${queryString}` : ''}`)
  },

  criar: (payload: CriarRevendedorPayload) =>
    apiClient.post<{ message: string }>('/api/dashboard/revendedores', payload),

  obterDetalhe: (id: string) =>
    apiClient.get<{ revendedor: RevendedorDetalhe }>(
      `/api/dashboard/revendedores/${id}`,
    ),

  alterarEstado: (id: string, ativo: boolean) =>
    apiClient.patch<{ message: string }>(`/api/dashboard/revendedores/${id}`, {
      ativo,
    }),

  criarPontoVenda: (revendedorId: string, payload: CriarPontoVendaPayload) =>
    apiClient.post<{ message: string }>(
      `/api/dashboard/revendedores/${revendedorId}/pontos-venda`,
      payload,
    ),
}

import { apiClient } from '@/lib/api-client'

export type StatusPedido =
  | 'PENDENTE'
  | 'APROVADO'
  | 'EM_PROCESSAMENTO'
  | 'CONCLUIDO'
  | 'REJEITADO'

export interface ItemPedidoResumo {
  produto: string
  quantidade: number
}

export interface PedidoResumo {
  id: string
  status: StatusPedido
  criadoEm: string
  observacoes: string | null
  itens: ItemPedidoResumo[]
}

export interface ResumoRevendedorResponse {
  revendedor: { nome: string; tipo: 'REVENDEDOR' | 'GROSSISTA' } | null
  resumo: {
    pedidosPendentes: number
    pedidosEmProcessamento: number
    distribuicoesEmTransito: number
    totalPontosVenda: number
  }
  ultimosPedidos: PedidoResumo[]
}

export interface ItemPedidoInput {
  produtoId: string
  quantidade: number
}

export interface CriarPedidoPayload {
  itens: ItemPedidoInput[]
  observacoes?: string
}

export type StatusDistribuicao =
  | 'PLANEADA'
  | 'EM_TRANSITO'
  | 'ENTREGUE'
  | 'CANCELADA'

export interface ItemDistribuicaoResumo {
  produto: string
  quantidade: number
}

export interface DistribuicaoResumo {
  id: string
  status: StatusDistribuicao
  dataPrevista: string | null
  dataEntrega: string | null
  observacoes: string | null
  agente: { nome: string; contacto: string | null } | null
  pontoVenda: { nome: string; codigo: string } | null
  itens: ItemDistribuicaoResumo[]
}

export interface ListarPedidosResponse {
  pedidos: PedidoResumo[]
  proximoCursor: string | null
}

export type StatusPontoVenda = 'ATIVO' | 'PENDENTE_CADASTRO' | 'INATIVO'

export interface PontoVendaResumo {
  id: string
  nome: string
  codigo: string
  endereco: string | null
  status: StatusPontoVenda
  dataCadastro: string
  zona: { nome: string; provincia: string } | null
  totalDistribuicoes: number
}

export const revendedorService = {
  obterResumo: () =>
    apiClient.get<ResumoRevendedorResponse>('/api/revendedor/resumo'),

  criarPedido: (payload: CriarPedidoPayload) =>
    apiClient.post<{ message: string; pedido: PedidoResumo }>(
      '/api/revendedor/pedidos',
      payload,
    ),

  listarDistribuicoes: () =>
    apiClient.get<{ distribuicoes: DistribuicaoResumo[] }>(
      '/api/revendedor/distribuicoes',
    ),

  listarPedidos: (params?: { status?: string; cursor?: string }) => {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.cursor) query.set('cursor', params.cursor)
    const queryString = query.toString()

    return apiClient.get<ListarPedidosResponse>(
      `/api/revendedor/pedidos${queryString ? `?${queryString}` : ''}`,
    )
  },

  listarPontosVenda: () =>
    apiClient.get<{ pontosVenda: PontoVendaResumo[] }>(
      '/api/revendedor/pontos-venda',
    ),
}

import { apiClient } from '@/lib/api-client'

export type StatusPedidoEstoque =
  | 'PENDENTE'
  | 'APROVADO'
  | 'EM_PROCESSAMENTO'
  | 'CONCLUIDO'
  | 'REJEITADO'

export interface ItemPedidoEstoque {
  produto: string
  quantidade: number
}

export interface PedidoEstoqueResumo {
  id: string
  status: StatusPedidoEstoque
  observacoes: string | null
  criadoEm: string
  revendedor: { nome: string; tipo: 'REVENDEDOR' | 'GROSSISTA' }
  itens: ItemPedidoEstoque[]
}

export interface ListarPedidosEstoqueResponse {
  pedidos: PedidoEstoqueResumo[]
  proximoCursor: string | null
}

export const pedidoEstoqueService = {
  listar: (params?: { status?: string; cursor?: string }) => {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.cursor) query.set('cursor', params.cursor)
    const queryString = query.toString()

    return apiClient.get<ListarPedidosEstoqueResponse>(
      `/api/dashboard/estoque/pedidos${queryString ? `?${queryString}` : ''}`,
    )
  },

  atualizarStatus: (id: string, status: StatusPedidoEstoque) =>
    apiClient.patch<{ message: string; pedido: PedidoEstoqueResumo }>(
      `/api/dashboard/estoque/pedidos/${id}`,
      { status },
    ),
}

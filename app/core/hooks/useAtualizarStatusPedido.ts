import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  pedidoEstoqueService,
  StatusPedidoEstoque,
} from '../services/pedido-estoque.service'

export function useAtualizarStatusPedido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusPedidoEstoque }) =>
      pedidoEstoqueService.atualizarStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-estoque-pedidos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] })
    },
  })
}

import { useInfiniteQuery } from '@tanstack/react-query'
import { pedidoEstoqueService } from '../services/pedido-estoque.service'
import { useUtilizadorAtual } from './useUtilizadorAtual'

export function usePedidosEstoque(status?: string) {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const utilizadorId = dadosUtilizador?.utilizador?.id

  return useInfiniteQuery({
    queryKey: ['dashboard-estoque-pedidos', utilizadorId, status ?? 'TODOS'],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      pedidoEstoqueService.listar({ status, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.proximoCursor ?? undefined,
    enabled: Boolean(utilizadorId),
  })
}

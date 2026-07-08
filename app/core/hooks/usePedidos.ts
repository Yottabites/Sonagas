import { useInfiniteQuery } from '@tanstack/react-query'
import { revendedorService } from '../services/revendedor.service'

export function usePedidos(status?: string) {
  return useInfiniteQuery({
    queryKey: ['revendedor-pedidos', status ?? 'TODOS'],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      revendedorService.listarPedidos({ status, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.proximoCursor ?? undefined,
  })
}

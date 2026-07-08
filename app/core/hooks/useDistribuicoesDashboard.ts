import { useInfiniteQuery } from '@tanstack/react-query'
import { distribuicaoService } from '../services/distribuicao-dashboard.service'
import { useUtilizadorAtual } from './useUtilizadorAtual'

export function useDistribuicoesDashboard(status?: string) {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const utilizadorId = dadosUtilizador?.utilizador?.id

  return useInfiniteQuery({
    queryKey: ['dashboard-distribuicoes', utilizadorId, status ?? 'TODAS'],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      distribuicaoService.listar({ status, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.proximoCursor ?? undefined,
    enabled: Boolean(utilizadorId),
  })
}

import { useInfiniteQuery } from '@tanstack/react-query'
import { revendedoresDashboardService } from '../services/revendedores-dashboard.service'
import { useUtilizadorAtual } from '../hooks/useUtilizadorAtual'

export function useRevendedoresDashboard(tipo?: string, busca?: string) {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const utilizadorId = dadosUtilizador?.utilizador?.id

  return useInfiniteQuery({
    queryKey: [
      'dashboard-revendedores',
      utilizadorId,
      tipo ?? 'TODOS',
      busca ?? '',
    ],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      revendedoresDashboardService.listar({ tipo, busca, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.proximoCursor ?? undefined,
    enabled: Boolean(utilizadorId),
  })
}

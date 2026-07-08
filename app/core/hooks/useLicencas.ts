import { useInfiniteQuery } from '@tanstack/react-query'
import { useUtilizadorAtual } from './useUtilizadorAtual'
import { licencaService } from '../services/licenca.service'

export function useLicencas(status?: string, busca?: string) {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const utilizadorId = dadosUtilizador?.utilizador?.id

  return useInfiniteQuery({
    queryKey: [
      'dashboard-licencas',
      utilizadorId,
      status ?? 'TODAS',
      busca ?? '',
    ],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      licencaService.listar({ status, busca, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.proximoCursor ?? undefined,
    enabled: Boolean(utilizadorId),
  })
}

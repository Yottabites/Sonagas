import { useInfiniteQuery } from '@tanstack/react-query'
import { useUtilizadorAtual } from './useUtilizadorAtual'
import { fiscalizacaoService } from '../services/fiscalizacao.service'

export function useFiscalizacoes(conforme?: 'true' | 'false') {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const utilizadorId = dadosUtilizador?.utilizador?.id

  return useInfiniteQuery({
    queryKey: ['dashboard-fiscalizacoes', utilizadorId, conforme ?? 'TODAS'],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      fiscalizacaoService.listar({ conforme, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.proximoCursor ?? undefined,
    enabled: Boolean(utilizadorId),
  })
}

import { useQuery } from '@tanstack/react-query'
import { relatorioService } from '../services/relatorio.service'
import { useUtilizadorAtual } from '../hooks/useUtilizadorAtual'

export function useDadosRelatorio() {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const utilizadorId = dadosUtilizador?.utilizador?.id

  return useQuery({
    queryKey: ['dashboard-relatorios-dados', utilizadorId],
    queryFn: () => relatorioService.obterDados(),
    enabled: Boolean(utilizadorId),
    staleTime: 5 * 60 * 1000,
  })
}

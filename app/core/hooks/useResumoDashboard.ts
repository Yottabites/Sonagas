import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'
import { useUtilizadorAtual } from './useUtilizadorAtual'

export function useResumoDashboard() {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const utilizadorId = dadosUtilizador?.utilizador?.id

  return useQuery({
    queryKey: ['dashboard-resumo', utilizadorId],
    queryFn: () => dashboardService.obterResumo(),
    enabled: Boolean(utilizadorId),
    staleTime: 60 * 1000,
  })
}

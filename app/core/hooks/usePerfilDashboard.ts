import { useQuery } from '@tanstack/react-query'
import { perfilDashboardService } from '../services/perfil-dashboard.service'
import { useUtilizadorAtual } from '../hooks/useUtilizadorAtual'

export function usePerfilDashboard() {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const utilizadorId = dadosUtilizador?.utilizador?.id

  return useQuery({
    queryKey: ['dashboard-perfil', utilizadorId],
    queryFn: () => perfilDashboardService.obter(),
    enabled: Boolean(utilizadorId),
    staleTime: 2 * 60 * 1000,
  })
}

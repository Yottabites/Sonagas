import { useQuery } from '@tanstack/react-query'
import { revendedoresDashboardService } from '../services/revendedores-dashboard.service'

export function useRevendedorDetalhe(id: string | null) {
  return useQuery({
    queryKey: ['dashboard-revendedor-detalhe', id],
    queryFn: () => revendedoresDashboardService.obterDetalhe(id as string),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  })
}

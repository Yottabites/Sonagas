import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  revendedoresDashboardService,
  CriarRevendedorPayload,
} from '../services/revendedores-dashboard.service'

export function useCriarRevendedor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CriarRevendedorPayload) =>
      revendedoresDashboardService.criar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-revendedores'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] })
    },
  })
}

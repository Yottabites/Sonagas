import { useMutation, useQueryClient } from '@tanstack/react-query'
import { revendedoresDashboardService } from '../services/revendedores-dashboard.service'

export function useAlterarEstadoRevendedor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      revendedoresDashboardService.alterarEstado(id, ativo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-revendedores'] })
      queryClient.invalidateQueries({
        queryKey: ['dashboard-revendedor-detalhe'],
      })
      queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] })
    },
  })
}

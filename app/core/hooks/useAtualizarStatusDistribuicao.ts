import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  distribuicaoService,
  StatusDistribuicaoDashboard,
} from '../services/distribuicao-dashboard.service'

export function useAtualizarStatusDistribuicao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: StatusDistribuicaoDashboard
    }) => distribuicaoService.atualizarStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-distribuicoes'] })
      queryClient.invalidateQueries({
        queryKey: ['dashboard-estoque-produtos'],
      })
      queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] })
    },
  })
}

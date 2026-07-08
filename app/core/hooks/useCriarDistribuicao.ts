import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  distribuicaoService,
  CriarDistribuicaoPayload,
} from '../services/distribuicao-dashboard.service'

export function useCriarDistribuicao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CriarDistribuicaoPayload) =>
      distribuicaoService.criar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-distribuicoes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] })
    },
  })
}

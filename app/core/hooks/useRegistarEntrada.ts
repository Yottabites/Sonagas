import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  estoqueService,
  RegistarEntradaPayload,
} from '../services/estoque.service'

export function useRegistarEntrada() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegistarEntradaPayload) =>
      estoqueService.registarEntrada(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['dashboard-estoque-produtos'],
      })
      queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] })
    },
  })
}

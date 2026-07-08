import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CriarFiscalizacaoPayload,
  fiscalizacaoService,
} from '../services/fiscalizacao.service'

export function useCriarFiscalizacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CriarFiscalizacaoPayload) =>
      fiscalizacaoService.criar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-fiscalizacoes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] })
    },
  })
}

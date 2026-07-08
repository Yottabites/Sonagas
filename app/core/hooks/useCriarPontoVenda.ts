import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  revendedoresDashboardService,
  CriarPontoVendaPayload,
} from '../services/revendedores-dashboard.service'

export function useCriarPontoVenda() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      revendedorId,
      payload,
    }: {
      revendedorId: string
      payload: CriarPontoVendaPayload
    }) => revendedoresDashboardService.criarPontoVenda(revendedorId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['dashboard-revendedor-detalhe', variables.revendedorId],
      })
      queryClient.invalidateQueries({ queryKey: ['dashboard-revendedores'] })
    },
  })
}

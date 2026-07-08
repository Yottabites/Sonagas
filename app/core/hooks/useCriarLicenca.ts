import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CriarLicencaPayload,
  licencaService,
} from '../services/licenca.service'

export function useCriarLicenca() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CriarLicencaPayload) => licencaService.criar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-licencas'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] })
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  licencaService,
  RenovarLicencaPayload,
} from '../services/licenca.service'

export function useRenovarLicenca() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: RenovarLicencaPayload
    }) => licencaService.renovar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-licencas'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] })
    },
  })
}

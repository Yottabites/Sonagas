import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  perfilDashboardService,
  AtualizarPerfilInternoPayload,
} from '../services/perfil-dashboard.service'

export function useAtualizarPerfilDashboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AtualizarPerfilInternoPayload) =>
      perfilDashboardService.atualizar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-perfil'] })
      queryClient.invalidateQueries({ queryKey: ['utilizador-atual'] })
    },
  })
}

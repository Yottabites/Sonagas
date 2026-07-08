import { useMutation } from '@tanstack/react-query'
import {
  perfilDashboardService,
  AtualizarSenhaInternaPayload,
} from '../services/perfil-dashboard.service'

export function useAtualizarSenhaDashboard() {
  return useMutation({
    mutationFn: (payload: AtualizarSenhaInternaPayload) =>
      perfilDashboardService.atualizarSenha(payload),
  })
}

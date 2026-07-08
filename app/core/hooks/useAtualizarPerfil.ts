import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  perfilService,
  AtualizarPerfilPayload,
} from '../services/perfil.service'

export function useAtualizarPerfil() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AtualizarPerfilPayload) =>
      perfilService.atualizar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revendedor-perfil'] })
      queryClient.invalidateQueries({ queryKey: ['utilizador-atual'] })
    },
  })
}

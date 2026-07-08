import { useMutation } from '@tanstack/react-query'
import {
  perfilService,
  AtualizarSenhaPayload,
} from '../services/perfil.service'

export function useAtualizarSenhaPerfil() {
  return useMutation({
    mutationFn: (payload: AtualizarSenhaPayload) =>
      perfilService.atualizarSenha(payload),
  })
}

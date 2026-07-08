import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/auth.service'

export function useSolicitarCodigoRecuperacao() {
  return useMutation({
    mutationFn: (email: string) =>
      authService.solicitarCodigoRecuperacao(email),
  })
}

export function useValidarCodigoRecuperacao() {
  return useMutation({
    mutationFn: ({ email, codigo }: { email: string; codigo: string }) =>
      authService.validarCodigoRecuperacao(email, codigo),
  })
}

export function useAtualizarSenha() {
  return useMutation({
    mutationFn: ({
      email,
      codigo,
      novaSenha,
    }: {
      email: string
      codigo: string
      novaSenha: string
    }) => authService.atualizarSenha(email, codigo, novaSenha),
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  revendedorService,
  CriarPedidoPayload,
} from '../services/revendedor.service'

export function useCriarPedido() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: CriarPedidoPayload) =>
      revendedorService.criarPedido(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revendedor-resumo'] })
      router.push('/revendedor')
    },
  })
}

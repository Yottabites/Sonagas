import { useQuery } from '@tanstack/react-query'
import { revendedorService } from '../services/revendedor.service'

export function usePontosVenda() {
  return useQuery({
    queryKey: ['revendedor-pontos-venda'],
    queryFn: () => revendedorService.listarPontosVenda(),
    staleTime: 2 * 60 * 1000,
  })
}

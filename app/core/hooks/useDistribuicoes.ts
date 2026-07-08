import { useQuery } from '@tanstack/react-query'
import { revendedorService } from '../services/revendedor.service'

export function useDistribuicoes() {
  return useQuery({
    queryKey: ['revendedor-distribuicoes'],
    queryFn: () => revendedorService.listarDistribuicoes(),
    staleTime: 60 * 1000,
  })
}

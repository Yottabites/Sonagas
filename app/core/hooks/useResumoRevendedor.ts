import { useQuery } from '@tanstack/react-query'
import { revendedorService } from '../services/revendedor.service'

export function useResumoRevendedor() {
  return useQuery({
    queryKey: ['revendedor-resumo'],
    queryFn: () => revendedorService.obterResumo(),
    staleTime: 60 * 1000,
  })
}

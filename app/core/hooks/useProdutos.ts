import { useQuery } from '@tanstack/react-query'
import { produtoService } from '../services/produto.service'

export function useProdutos() {
  return useQuery({
    queryKey: ['produtos'],
    queryFn: () => produtoService.listar(),
    staleTime: 5 * 60 * 1000,
  })
}

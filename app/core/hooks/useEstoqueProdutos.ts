import { useQuery } from '@tanstack/react-query'
import { estoqueService } from '../services/estoque.service'
import { useUtilizadorAtual } from './useUtilizadorAtual'

export function useEstoqueProdutos() {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const utilizadorId = dadosUtilizador?.utilizador?.id

  return useQuery({
    queryKey: ['dashboard-estoque-produtos', utilizadorId],
    queryFn: () => estoqueService.listarProdutos(),
    enabled: Boolean(utilizadorId),
    staleTime: 60 * 1000,
  })
}

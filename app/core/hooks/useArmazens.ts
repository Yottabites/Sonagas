import { useQuery } from '@tanstack/react-query'
import { estoqueService } from '../services/estoque.service'
import { useUtilizadorAtual } from './useUtilizadorAtual'

export function useArmazens() {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const utilizadorId = dadosUtilizador?.utilizador?.id

  return useQuery({
    queryKey: ['dashboard-armazens', utilizadorId],
    queryFn: () => estoqueService.listarArmazens(),
    enabled: Boolean(utilizadorId),
    staleTime: 5 * 60 * 1000,
  })
}

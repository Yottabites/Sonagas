import { useQuery } from '@tanstack/react-query'
import { distribuicaoService } from '../services/distribuicao-dashboard.service'
import { useUtilizadorAtual } from '../hooks/useUtilizadorAtual'

export function usePontosVendaDashboard() {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const utilizadorId = dadosUtilizador?.utilizador?.id

  return useQuery({
    queryKey: ['dashboard-pontos-venda', utilizadorId],
    queryFn: () => distribuicaoService.listarPontosVenda(),
    enabled: Boolean(utilizadorId),
    staleTime: 5 * 60 * 1000,
  })
}

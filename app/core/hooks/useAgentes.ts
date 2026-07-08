import { useQuery } from '@tanstack/react-query'
import { agenteService } from '../services/agente.service'
import { useUtilizadorAtual } from './useUtilizadorAtual'

export function useAgentes() {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const utilizadorId = dadosUtilizador?.utilizador?.id

  return useQuery({
    queryKey: ['dashboard-agentes', utilizadorId],
    queryFn: () => agenteService.listar(),
    enabled: Boolean(utilizadorId),
    staleTime: 5 * 60 * 1000,
  })
}

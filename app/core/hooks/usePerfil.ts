import { useQuery } from '@tanstack/react-query'
import { perfilService } from '../services/perfil.service'
import { useUtilizadorAtual } from '../hooks/useUtilizadorAtual'

export function usePerfil() {
  const { data: dadosUtilizador } = useUtilizadorAtual()
  const utilizadorId = dadosUtilizador?.utilizador?.id

  return useQuery({
    queryKey: ['revendedor-perfil', utilizadorId],
    queryFn: () => perfilService.obter(),
    enabled: Boolean(utilizadorId),
    staleTime: 2 * 60 * 1000,
  })
}

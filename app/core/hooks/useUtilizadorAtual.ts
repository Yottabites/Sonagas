import { useQuery } from '@tanstack/react-query'
import { authService } from '../services/auth.service'

export function useUtilizadorAtual() {
  return useQuery({
    queryKey: ['utilizador-atual'],
    queryFn: () => authService.me(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 min
  })
}

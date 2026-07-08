import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/auth.service'

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear()
      router.push('/')
    },
  })
}

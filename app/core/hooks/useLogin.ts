import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
// import { LoginPayload } from ''
import { authService, LoginPayload } from '../services/auth.service'

export function useLogin() {
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data: any) => {
      router.push(data.redirectTo)
    },
  })
}

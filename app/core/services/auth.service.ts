import { apiClient } from '@/lib/api-client'

export type PerfilUtilizador =
  | 'ADMIN'
  | 'GESTOR_LICENCAS'
  | 'GESTOR_ESTOQUE'
  | 'FISCAL'
  | 'ANALISTA'
  | 'REVENDEDOR'
  | 'GROSSISTA'

export interface UtilizadorAutenticado {
  id: string
  nome: string
  email: string
  perfil: PerfilUtilizador
}

export interface LoginPayload {
  email: string
  senha: string
}

export interface LoginResponse {
  message: string
  utilizador: UtilizadorAutenticado
  redirectTo: string
}

export interface MensagemResponse {
  message: string
}

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>('/api/auth/login', payload),

  logout: () => apiClient.post<MensagemResponse>('/api/auth/logout'),

  me: () =>
    apiClient.get<{ utilizador: UtilizadorAutenticado }>('/api/auth/me'),

  solicitarCodigoRecuperacao: (email: string) =>
    apiClient.post<MensagemResponse>('/api/auth/recuperar-senha/solicitar', {
      email,
    }),

  validarCodigoRecuperacao: (email: string, codigo: string) =>
    apiClient.post<MensagemResponse>(
      '/api/auth/recuperar-senha/validar-codigo',
      { email, codigo },
    ),

  atualizarSenha: (email: string, codigo: string, novaSenha: string) =>
    apiClient.post<MensagemResponse>('/api/auth/recuperar-senha/atualizar', {
      email,
      codigo,
      novaSenha,
    }),
}

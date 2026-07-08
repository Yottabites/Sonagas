import { apiClient } from '@/lib/api-client'
import { PerfilUtilizador } from '../services/auth.service'

export interface PerfilUtilizadorDados {
  id: string
  nome: string
  email: string
  perfil: PerfilUtilizador
}

export interface PerfilRevendedorDados {
  id: string
  nome: string
  nif: string
  tipo: 'REVENDEDOR' | 'GROSSISTA'
  contacto: string | null
  email: string | null
}

export interface ObterPerfilResponse {
  utilizador: PerfilUtilizadorDados
  revendedor: PerfilRevendedorDados
}

export interface AtualizarPerfilPayload {
  nome: string
  contacto: string
  email: string
}

export interface AtualizarSenhaPayload {
  senhaAtual: string
  novaSenha: string
}

export const perfilService = {
  obter: () => apiClient.get<ObterPerfilResponse>('/api/revendedor/perfil'),

  atualizar: (payload: AtualizarPerfilPayload) =>
    apiClient.put<{ message: string } & ObterPerfilResponse>(
      '/api/revendedor/perfil',
      payload,
    ),

  atualizarSenha: (payload: AtualizarSenhaPayload) =>
    apiClient.put<{ message: string }>('/api/revendedor/perfil/senha', payload),
}

import { apiClient } from '@/lib/api-client'

export type PerfilInternoUtilizador =
  | 'ADMIN'
  | 'GESTOR_LICENCAS'
  | 'GESTOR_ESTOQUE'
  | 'FISCAL'
  | 'ANALISTA'

export const LABEL_PERFIL_INTERNO: Record<PerfilInternoUtilizador, string> = {
  ADMIN: 'Administrador',
  GESTOR_LICENCAS: 'Gestor de Licenças',
  GESTOR_ESTOQUE: 'Gestor de Estoque',
  FISCAL: 'Fiscal',
  ANALISTA: 'Analista',
}

export interface UtilizadorInternoDados {
  id: string
  nome: string
  email: string
  perfil: PerfilInternoUtilizador
  criadoEm: string
}

export interface AtualizarPerfilInternoPayload {
  nome: string
  email: string
}

export interface AtualizarSenhaInternaPayload {
  senhaAtual: string
  novaSenha: string
}

export const perfilDashboardService = {
  obter: () =>
    apiClient.get<{ utilizador: UtilizadorInternoDados }>(
      '/api/dashboard/perfil',
    ),

  atualizar: (payload: AtualizarPerfilInternoPayload) =>
    apiClient.put<{ message: string; utilizador: UtilizadorInternoDados }>(
      '/api/dashboard/perfil',
      payload,
    ),

  atualizarSenha: (payload: AtualizarSenhaInternaPayload) =>
    apiClient.put<{ message: string }>('/api/dashboard/perfil/senha', payload),
}

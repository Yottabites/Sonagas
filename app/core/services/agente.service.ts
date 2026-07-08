import { apiClient } from '@/lib/api-client'

export interface AgenteResumo {
  id: string
  nome: string
  nif: string
}

export const agenteService = {
  listar: () =>
    apiClient.get<{ agentes: AgenteResumo[] }>('/api/dashboard/agentes'),
}

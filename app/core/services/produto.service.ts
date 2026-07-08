import { apiClient } from '@/lib/api-client'

export interface Produto {
  id: string
  nome: string
  codigo: string
  pesoKg: number | null
}

export const produtoService = {
  listar: () => apiClient.get<{ produtos: Produto[] }>('/api/produtos'),
}

import { apiClient } from '@/lib/api-client'

export interface LoteResumo {
  id: string
  codigoLote: string
  quantidade: number
  armazem: { id: string; nome: string }
  dataEntrada: string
  dataValidade: string | null
}

export interface ProdutoEstoque {
  id: string
  nome: string
  codigo: string
  quantidadeTotal: number
  lotes: LoteResumo[]
}

export interface ArmazemResumo {
  id: string
  nome: string
  localizacao: string | null
}

export interface RegistarEntradaPayload {
  produtoId: string
  armazemId: string
  quantidade: number
  referenciaDoc?: string
  dataValidade?: string
}

export const estoqueService = {
  listarProdutos: () =>
    apiClient.get<{ produtos: ProdutoEstoque[] }>(
      '/api/dashboard/estoque/produtos',
    ),

  listarArmazens: () =>
    apiClient.get<{ armazens: ArmazemResumo[] }>(
      '/api/dashboard/estoque/armazens',
    ),

  registarEntrada: (payload: RegistarEntradaPayload) =>
    apiClient.post<{ message: string }>(
      '/api/dashboard/estoque/entrada',
      payload,
    ),
}

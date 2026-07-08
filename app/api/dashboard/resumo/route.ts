import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verificarToken, PayloadToken } from '@/lib/auth'
import { prisma } from '../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'

const PERFIS_INTERNOS: PayloadToken['perfil'][] = [
  'ADMIN',
  'GESTOR_LICENCAS',
  'GESTOR_ESTOQUE',
  'FISCAL',
  'ANALISTA',
]

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(NOME_COOKIE)?.value

    if (!token) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    const payload = verificarToken(token)

    if (!PERFIS_INTERNOS.includes(payload.perfil)) {
      return NextResponse.json(
        { message: 'Apenas utilizadores internos têm acesso a este recurso.' },
        { status: 403 },
      )
    }

    const perfil = payload.perfil
    const verTudo = perfil === 'ADMIN'

    const resumo: Record<string, unknown> = {}

    // ------------------------------------------------------------
    // LICENÇAS — Admin e Gestor de Licenças
    // ------------------------------------------------------------
    if (verTudo || perfil === 'GESTOR_LICENCAS') {
      const [licencasAtivas, licencasPendentesRenovacao, licencasExpiradas] =
        await Promise.all([
          prisma.licenca.count({ where: { status: 'ATIVA' } }),
          prisma.licenca.count({ where: { status: 'PENDENTE_RENOVACAO' } }),
          prisma.licenca.count({ where: { status: 'EXPIRADA' } }),
        ])

      resumo.licencas = {
        ativas: licencasAtivas,
        pendentesRenovacao: licencasPendentesRenovacao,
        expiradas: licencasExpiradas,
      }
    }

    // ------------------------------------------------------------
    // ESTOQUE — Admin e Gestor de Estoque
    // ------------------------------------------------------------
    if (verTudo || perfil === 'GESTOR_ESTOQUE') {
      const [produtos, pedidosPendentes, distribuicoesPlaneadas] =
        await Promise.all([
          prisma.produto.findMany({
            include: {
              lotes: { select: { quantidade: true } },
            },
          }),
          prisma.pedido.count({ where: { status: 'PENDENTE' } }),
          prisma.distribuicao.count({ where: { status: 'PLANEADA' } }),
        ])

      resumo.estoque = {
        produtos: produtos.map((p) => ({
          nome: p.nome,
          quantidadeTotal: p.lotes.reduce((soma, l) => soma + l.quantidade, 0),
        })),
        pedidosPendentes,
        distribuicoesPlaneadas,
      }
    }

    // ------------------------------------------------------------
    // FISCALIZAÇÃO — Admin e Fiscal
    // ------------------------------------------------------------
    if (verTudo || perfil === 'FISCAL') {
      const [licencasParaFiscalizar, fiscalizacoesRecentes] = await Promise.all(
        [
          prisma.licenca.count({ where: { status: 'PENDENTE_RENOVACAO' } }),
          prisma.fiscalizacao.findMany({
            orderBy: { dataFiscalizacao: 'desc' },
            take: 5,
            include: { agente: { select: { nome: true } } },
          }),
        ],
      )

      resumo.fiscalizacao = {
        licencasParaFiscalizar,
        ultimasFiscalizacoes: fiscalizacoesRecentes.map((f) => ({
          id: f.id,
          agente: f.agente.nome,
          conforme: f.conforme,
          data: f.dataFiscalizacao,
        })),
      }
    }

    // ------------------------------------------------------------
    // RELATÓRIOS — Admin e Analista
    // ------------------------------------------------------------
    if (verTudo || perfil === 'ANALISTA') {
      const [totalAgentes, totalDistribuicoesEntregues, relatoriosRecentes] =
        await Promise.all([
          prisma.agente.count({ where: { ativo: true } }),
          prisma.distribuicao.count({ where: { status: 'ENTREGUE' } }),
          prisma.relatorio.findMany({
            orderBy: { criadoEm: 'desc' },
            take: 5,
            select: { id: true, titulo: true, tipo: true, criadoEm: true },
          }),
        ])

      resumo.relatorios = {
        totalAgentes,
        totalDistribuicoesEntregues,
        ultimosRelatorios: relatoriosRecentes,
      }
    }

    // ------------------------------------------------------------
    // VISÃO GERAL — só Admin
    // ------------------------------------------------------------
    if (verTudo) {
      const [totalRevendedores, totalUtilizadores] = await Promise.all([
        prisma.revendedor.count({ where: { ativo: true } }),
        prisma.utilizador.count({ where: { ativo: true } }),
      ])

      resumo.visaoGeral = { totalRevendedores, totalUtilizadores }
    }

    return NextResponse.json({ perfil, resumo })
  } catch (error) {
    console.error('Erro ao obter resumo do dashboard:', error)
    return NextResponse.json(
      { message: 'Sessão inválida ou erro ao processar o pedido.' },
      { status: 401 },
    )
  }
}

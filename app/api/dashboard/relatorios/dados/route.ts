import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
// import { prisma } from '@/lib/prisma'
import { verificarToken } from '@/lib/auth'
import { prisma } from '../../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'
const PERFIS_PERMITIDOS = ['ADMIN', 'ANALISTA']

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(NOME_COOKIE)?.value
    if (!token) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    const payload = verificarToken(token)
    if (!PERFIS_PERMITIDOS.includes(payload.perfil)) {
      return NextResponse.json(
        { message: 'Sem permissão para este recurso.' },
        { status: 403 },
      )
    }

    const agora = new Date()
    const inicioAno = new Date(agora.getFullYear(), 0, 1)

    const [
      // KPIs gerais
      totalAgentes,
      totalRevendedores,
      totalGrossistas,
      totalLicencasAtivas,
      totalLicencasPendentes,
      totalLicencasExpiradas,
      totalPedidos,
      totalDistribuicoes,

      // Pedidos por status
      pedidosPorStatus,

      // Distribuicões por status
      distribuicoesPorStatus,

      // Estoque atual por produto
      produtosEstoque,

      // Fiscalizações conformidade
      fiscalizacoesConforme,
      fiscalizacoesNaoConforme,

      // Distribuições por mês (últimos 6 meses)
      distribuicoesPorMes,

      // Pedidos por mês (últimos 6 meses)
      pedidosPorMes,

      // Top 5 agentes com mais fiscalizações
      topAgentes,

      // Top 5 zonas geográficas com mais agentes
      topZonas,
    ] = await Promise.all([
      prisma.agente.count({ where: { ativo: true } }),
      prisma.revendedor.count({ where: { tipo: 'REVENDEDOR', ativo: true } }),
      prisma.revendedor.count({ where: { tipo: 'GROSSISTA', ativo: true } }),
      prisma.licenca.count({ where: { status: 'ATIVA' } }),
      prisma.licenca.count({ where: { status: 'PENDENTE_RENOVACAO' } }),
      prisma.licenca.count({ where: { status: 'EXPIRADA' } }),
      prisma.pedido.count(),
      prisma.distribuicao.count(),

      prisma.pedido.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      prisma.distribuicao.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      prisma.produto.findMany({
        include: {
          lotes: { select: { quantidade: true } },
        },
      }),

      prisma.fiscalizacao.count({ where: { conforme: true } }),
      prisma.fiscalizacao.count({ where: { conforme: false } }),

      prisma.distribuicao.findMany({
        where: { criadoEm: { gte: inicioAno } },
        select: { criadoEm: true, status: true },
        orderBy: { criadoEm: 'asc' },
      }),

      prisma.pedido.findMany({
        where: { criadoEm: { gte: inicioAno } },
        select: { criadoEm: true, status: true },
        orderBy: { criadoEm: 'asc' },
      }),

      prisma.agente.findMany({
        take: 5,
        orderBy: { fiscalizacoes: { _count: 'desc' } },
        select: {
          nome: true,
          _count: { select: { fiscalizacoes: true } },
        },
      }),

      prisma.zonaGeografica.findMany({
        take: 5,
        orderBy: { agentes: { _count: 'desc' } },
        select: {
          nome: true,
          provincia: true,
          _count: { select: { agentes: true } },
        },
      }),
    ])

    // Agrupar distribuições por mês
    const MESES = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ]
    const distribuicoesMes = Array.from({ length: 6 }, (_, i) => {
      const mes = new Date(agora.getFullYear(), agora.getMonth() - 5 + i, 1)
      const nome = MESES[mes.getMonth()]
      const total = distribuicoesPorMes.filter(
        (d) =>
          d.criadoEm.getMonth() === mes.getMonth() &&
          d.criadoEm.getFullYear() === mes.getFullYear(),
      ).length
      const entregues = distribuicoesPorMes.filter(
        (d) =>
          d.criadoEm.getMonth() === mes.getMonth() &&
          d.criadoEm.getFullYear() === mes.getFullYear() &&
          d.status === 'ENTREGUE',
      ).length
      return { mes: nome, total, entregues }
    })

    const pedidosMes = Array.from({ length: 6 }, (_, i) => {
      const mes = new Date(agora.getFullYear(), agora.getMonth() - 5 + i, 1)
      const nome = MESES[mes.getMonth()]
      const total = pedidosPorMes.filter(
        (p) =>
          p.criadoEm.getMonth() === mes.getMonth() &&
          p.criadoEm.getFullYear() === mes.getFullYear(),
      ).length
      const aprovados = pedidosPorMes.filter(
        (p) =>
          p.criadoEm.getMonth() === mes.getMonth() &&
          p.criadoEm.getFullYear() === mes.getFullYear() &&
          (p.status === 'APROVADO' || p.status === 'CONCLUIDO'),
      ).length
      return { mes: nome, total, aprovados }
    })

    return NextResponse.json({
      kpis: {
        totalAgentes,
        totalRevendedores,
        totalGrossistas,
        totalLicencasAtivas,
        totalLicencasPendentes,
        totalLicencasExpiradas,
        totalPedidos,
        totalDistribuicoes,
      },
      licencasPorStatus: [
        { status: 'Ativas', valor: totalLicencasAtivas, cor: '#1A8F4C' },
        { status: 'Pendentes', valor: totalLicencasPendentes, cor: '#FFC20E' },
        { status: 'Expiradas', valor: totalLicencasExpiradas, cor: '#E2231A' },
      ],
      pedidosPorStatus: pedidosPorStatus.map((p) => ({
        status: p.status,
        total: p._count.id,
      })),
      distribuicoesPorStatus: distribuicoesPorStatus.map((d) => ({
        status: d.status,
        total: d._count.id,
      })),
      estoqueProdutos: produtosEstoque.map((p) => ({
        nome: p.nome,
        quantidade: p.lotes.reduce((soma, l) => soma + l.quantidade, 0),
      })),
      fiscalizacoes: {
        conformes: fiscalizacoesConforme,
        naoConformes: fiscalizacoesNaoConforme,
        total: fiscalizacoesConforme + fiscalizacoesNaoConforme,
        taxaConformidade:
          fiscalizacoesConforme + fiscalizacoesNaoConforme > 0
            ? Math.round(
                (fiscalizacoesConforme /
                  (fiscalizacoesConforme + fiscalizacoesNaoConforme)) *
                  100,
              )
            : 0,
      },
      distribuicoesMes,
      pedidosMes,
      topAgentes: topAgentes.map((a) => ({
        nome: a.nome,
        fiscalizacoes: a._count.fiscalizacoes,
      })),
      topZonas: topZonas.map((z) => ({
        nome: z.nome,
        provincia: z.provincia,
        agentes: z._count.agentes,
      })),
      geradoEm: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erro ao gerar dados do relatório:', error)
    return NextResponse.json(
      { message: 'Erro ao gerar dados. Tente novamente.' },
      { status: 500 },
    )
  }
}

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verificarToken } from '@/lib/auth'
import { prisma } from '../../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'
const PERFIS_PERMITIDOS = ['ADMIN', 'GESTOR_ESTOQUE']
const STATUS_VALIDOS = [
  'PENDENTE',
  'APROVADO',
  'EM_PROCESSAMENTO',
  'CONCLUIDO',
  'REJEITADO',
]

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const cursor = searchParams.get('cursor')
    const limite = 10

    const where = {
      ...(status && STATUS_VALIDOS.includes(status)
        ? { status: status as any }
        : {}),
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      take: limite + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        revendedor: { select: { nome: true, tipo: true } },
        itens: { include: { produto: { select: { nome: true } } } },
      },
    })

    const temMais = pedidos.length > limite
    const pagina = temMais ? pedidos.slice(0, limite) : pedidos

    return NextResponse.json({
      pedidos: pagina.map((p) => ({
        id: p.id,
        status: p.status,
        observacoes: p.observacoes,
        criadoEm: p.criadoEm,
        revendedor: p.revendedor,
        itens: p.itens.map((item) => ({
          produto: item.produto.nome,
          quantidade: item.quantidade,
        })),
      })),
      proximoCursor: temMais ? pagina[pagina.length - 1].id : null,
    })
  } catch (error) {
    console.error('Erro ao listar pedidos:', error)
    return NextResponse.json(
      { message: 'Sessão inválida ou erro ao processar o pedido.' },
      { status: 401 },
    )
  }
}

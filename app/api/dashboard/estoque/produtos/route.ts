import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verificarToken } from '@/lib/auth'
import { prisma } from '../../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'
const PERFIS_PERMITIDOS = ['ADMIN', 'GESTOR_ESTOQUE']

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

    const produtos = await prisma.produto.findMany({
      orderBy: { nome: 'asc' },
      include: {
        lotes: {
          include: { armazem: { select: { id: true, nome: true } } },
        },
      },
    })

    return NextResponse.json({
      produtos: produtos.map((p) => ({
        id: p.id,
        nome: p.nome,
        codigo: p.codigo,
        quantidadeTotal: p.lotes.reduce((soma, l) => soma + l.quantidade, 0),
        lotes: p.lotes.map((l) => ({
          id: l.id,
          codigoLote: l.codigoLote,
          quantidade: l.quantidade,
          armazem: l.armazem,
          dataEntrada: l.dataEntrada,
          dataValidade: l.dataValidade,
        })),
      })),
    })
  } catch (error) {
    console.error('Erro ao obter estoque:', error)
    return NextResponse.json({ message: 'Sessão inválida.' }, { status: 401 })
  }
}

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verificarToken } from '@/lib/auth'
import { prisma } from '../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(NOME_COOKIE)?.value

    if (!token) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    const payload = verificarToken(token)

    if (!payload.revendedorId) {
      return NextResponse.json(
        {
          message: 'Apenas revendedores/grossistas têm acesso a este recurso.',
        },
        { status: 403 },
      )
    }

    const pontosVenda = await prisma.pontoVenda.findMany({
      where: { revendedorId: payload.revendedorId },
      orderBy: { dataCadastro: 'desc' },
      include: {
        zona: { select: { nome: true, provincia: true } },
        _count: { select: { distribuicoes: true } },
      },
    })

    return NextResponse.json({
      pontosVenda: pontosVenda.map((pv) => ({
        id: pv.id,
        nome: pv.nome,
        codigo: pv.codigo,
        endereco: pv.endereco,
        status: pv.status,
        dataCadastro: pv.dataCadastro,
        zona: pv.zona,
        totalDistribuicoes: pv._count.distribuicoes,
      })),
    })
  } catch (error) {
    console.error('Erro ao listar pontos de venda:', error)
    return NextResponse.json(
      { message: 'Sessão inválida ou erro ao processar o pedido.' },
      { status: 401 },
    )
  }
}

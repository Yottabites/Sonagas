import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
// import { prisma } from "@/lib/prisma";
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

    const distribuicoes = await prisma.distribuicao.findMany({
      where: {
        pontoVenda: { revendedorId: payload.revendedorId },
      },
      orderBy: { criadoEm: 'desc' },
      include: {
        agente: { select: { nome: true, contacto: true } },
        pontoVenda: { select: { nome: true, codigo: true } },
        itens: { include: { produto: { select: { nome: true } } } },
      },
    })

    return NextResponse.json({
      distribuicoes: distribuicoes.map((d) => ({
        id: d.id,
        status: d.status,
        dataPrevista: d.dataPrevista,
        dataEntrega: d.dataEntrega,
        observacoes: d.observacoes,
        agente: d.agente,
        pontoVenda: d.pontoVenda,
        itens: d.itens.map((item) => ({
          produto: item.produto.nome,
          quantidade: item.quantidade,
        })),
      })),
    })
  } catch (error) {
    console.error('Erro ao listar distribuições:', error)
    return NextResponse.json(
      { message: 'Sessão inválida ou erro ao processar o pedido.' },
      { status: 401 },
    )
  }
}

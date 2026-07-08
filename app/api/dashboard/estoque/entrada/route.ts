import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verificarToken } from '@/lib/auth'
import { prisma } from '../../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'
const PERFIS_PERMITIDOS = ['ADMIN', 'GESTOR_ESTOQUE']

export async function POST(request: Request) {
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

    const { produtoId, armazemId, quantidade, referenciaDoc, dataValidade } =
      await request.json()

    if (!produtoId || !armazemId || !quantidade || quantidade <= 0) {
      return NextResponse.json(
        { message: 'Produto, armazém e quantidade são obrigatórios.' },
        { status: 400 },
      )
    }

    const codigoLote = `LOTE-${Date.now()}`

    const [lote] = await prisma.$transaction([
      prisma.loteEstoque.create({
        data: {
          produtoId,
          armazemId,
          codigoLote,
          quantidade,
          dataValidade: dataValidade ? new Date(dataValidade) : undefined,
        },
      }),
    ])

    await prisma.movimentoEstoque.create({
      data: {
        produtoId,
        armazemId,
        loteId: lote.id,
        tipo: 'ENTRADA',
        quantidade,
        referenciaDoc,
      },
    })

    return NextResponse.json({
      message: 'Entrada em estoque registada com sucesso.',
      lote,
    })
  } catch (error) {
    console.error('Erro ao registar entrada em estoque:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}

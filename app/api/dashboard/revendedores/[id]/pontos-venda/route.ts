import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '../../../../../core/lib/prisma'
import { verificarToken } from '@/lib/auth'

const NOME_COOKIE = 'sonagas_token'
const PERFIS_PERMITIDOS = ['ADMIN']

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: revendedorId } = await params

    const cookieStore = await cookies()
    const token = cookieStore.get(NOME_COOKIE)?.value
    if (!token) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    const payload = verificarToken(token)
    if (!PERFIS_PERMITIDOS.includes(payload.perfil)) {
      return NextResponse.json(
        { message: 'Sem permissão para esta ação.' },
        { status: 403 },
      )
    }

    const { nome, codigo, endereco, zonaId, latitude, longitude } =
      await request.json()

    if (!nome || !codigo) {
      return NextResponse.json(
        { message: 'Nome e código do ponto de venda são obrigatórios.' },
        { status: 400 },
      )
    }

    const codigoEmUso = await prisma.pontoVenda.findUnique({
      where: { codigo },
    })
    if (codigoEmUso) {
      return NextResponse.json(
        { message: 'Já existe um ponto de venda com este código.' },
        { status: 409 },
      )
    }

    const pontoVenda = await prisma.pontoVenda.create({
      data: {
        nome,
        codigo,
        revendedorId,
        endereco,
        zonaId,
        latitude,
        longitude,
        status: 'ATIVO',
      },
    })

    return NextResponse.json({
      message: 'Ponto de venda criado com sucesso.',
      pontoVenda,
    })
  } catch (error) {
    console.error('Erro ao criar ponto de venda:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}

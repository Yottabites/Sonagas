import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verificarToken } from '@/lib/auth'
import { prisma } from '../../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'
const PERFIS_PERMITIDOS = ['ADMIN']

async function obterPayload() {
  const cookieStore = await cookies()
  const token = cookieStore.get(NOME_COOKIE)?.value
  if (!token) return null
  const payload = verificarToken(token)
  if (!PERFIS_PERMITIDOS.includes(payload.perfil)) return null
  return payload
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const payload = await obterPayload()
    if (!payload) {
      return NextResponse.json(
        { message: 'Não autenticado ou sem permissão.' },
        { status: 401 },
      )
    }

    const revendedor = await prisma.revendedor.findUnique({
      where: { id },
      include: {
        utilizador: { select: { id: true, email: true, ativo: true } },
        pontosVenda: {
          select: {
            id: true,
            nome: true,
            codigo: true,
            status: true,
            zona: { select: { nome: true, provincia: true } },
            _count: { select: { distribuicoes: true } },
          },
        },
        _count: { select: { pedidos: true } },
      },
    })

    if (!revendedor) {
      return NextResponse.json(
        { message: 'Revendedor não encontrado.' },
        { status: 404 },
      )
    }

    return NextResponse.json({ revendedor })
  } catch (error) {
    console.error('Erro ao obter revendedor:', error)
    return NextResponse.json({ message: 'Sessão inválida.' }, { status: 401 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const payload = await obterPayload()
    if (!payload) {
      return NextResponse.json(
        { message: 'Não autenticado ou sem permissão.' },
        { status: 401 },
      )
    }

    const { ativo, nome, contacto } = await request.json()

    // Atualiza o revendedor e o utilizador ligado em conjunto
    const revendedor = await prisma.$transaction(async (tx) => {
      const rev = await tx.revendedor.update({
        where: { id },
        data: {
          ...(typeof ativo === 'boolean' ? { ativo } : {}),
          ...(nome ? { nome } : {}),
          ...(contacto !== undefined ? { contacto } : {}),
        },
      })

      // Sincroniza estado de ativo/inativo no utilizador
      if (typeof ativo === 'boolean') {
        await tx.utilizador.updateMany({
          where: { revendedorId: id },
          data: { ativo },
        })
      }

      return rev
    })

    return NextResponse.json({
      message: `Revendedor ${ativo === false ? 'desativado' : 'atualizado'} com sucesso.`,
      revendedor,
    })
  } catch (error) {
    console.error('Erro ao atualizar revendedor:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}

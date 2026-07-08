import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verificarToken, verificarSenha, hashSenha } from '@/lib/auth'
import { prisma } from '../../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(NOME_COOKIE)?.value

    if (!token) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    const payload = verificarToken(token)

    const { senhaAtual, novaSenha } = await request.json()

    if (!senhaAtual || !novaSenha) {
      return NextResponse.json(
        { message: 'Senha atual e nova senha são obrigatórias.' },
        { status: 400 },
      )
    }

    if (typeof novaSenha !== 'string' || novaSenha.length < 8) {
      return NextResponse.json(
        { message: 'A nova senha deve ter pelo menos 8 caracteres.' },
        { status: 400 },
      )
    }

    const utilizador = await prisma.utilizador.findUnique({
      where: { id: payload.sub },
    })

    if (!utilizador) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    const senhaAtualValida = await verificarSenha(senhaAtual, utilizador.senha)

    if (!senhaAtualValida) {
      return NextResponse.json(
        { message: 'A senha atual está incorreta.' },
        { status: 400 },
      )
    }

    const novaSenhaHash = await hashSenha(novaSenha)

    await prisma.utilizador.update({
      where: { id: utilizador.id },
      data: { senha: novaSenhaHash },
    })

    return NextResponse.json({ message: 'Senha atualizada com sucesso.' })
  } catch (error) {
    console.error('Erro ao atualizar senha:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}

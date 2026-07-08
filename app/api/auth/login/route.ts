import { NextResponse } from 'next/server'
import { verificarSenha, gerarToken, obterRotaPosLogin } from '@/lib/auth'
import { prisma } from '../../../core/lib/prisma'

const NOME_COOKIE = 'sonagas_token'
const OITO_HORAS_EM_SEGUNDOS = 60 * 60 * 8

export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json()

    if (!email || !senha) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios.' },
        { status: 400 },
      )
    }

    const utilizador = await prisma.utilizador.findUnique({
      where: { email },
    })

    // Mensagem genérica propositadamente — não revela se o email existe
    if (!utilizador || !utilizador.ativo) {
      return NextResponse.json(
        { message: 'Credenciais inválidas.' },
        { status: 401 },
      )
    }

    const senhaValida = await verificarSenha(senha, utilizador.senha)

    if (!senhaValida) {
      return NextResponse.json(
        { message: 'Credenciais inválidas.' },
        { status: 401 },
      )
    }

    const token = gerarToken({
      sub: utilizador.id,
      perfil: utilizador.perfil,
      revendedorId: utilizador.revendedorId,
    })

    const rotaPosLogin = obterRotaPosLogin(utilizador.perfil)

    const response = NextResponse.json({
      message: 'Login efetuado com sucesso.',
      utilizador: {
        id: utilizador.id,
        nome: utilizador.nome,
        email: utilizador.email,
        perfil: utilizador.perfil,
      },
      redirectTo: rotaPosLogin,
    })

    // Cookie httpOnly — o token não fica acessível via JS no browser
    response.cookies.set(NOME_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: OITO_HORAS_EM_SEGUNDOS,
    })

    return response
  } catch (error) {
    console.error('Erro ao efetuar login:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}

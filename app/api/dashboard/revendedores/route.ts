import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verificarToken, hashSenha } from '@/lib/auth'
import { prisma } from '../../../core/lib/prisma'
import { enviarEmail } from '../../../core/lib/email'
// import { enviarEmail } from '@/lib/email'

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

export async function GET(request: Request) {
  try {
    const payload = await obterPayload()
    if (!payload) {
      return NextResponse.json(
        { message: 'Não autenticado ou sem permissão.' },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const busca = searchParams.get('busca')
    const cursor = searchParams.get('cursor')
    const limite = 10

    const where = {
      ...(tipo === 'REVENDEDOR' || tipo === 'GROSSISTA'
        ? { tipo: tipo as 'REVENDEDOR' | 'GROSSISTA' }
        : {}),
      ...(busca
        ? {
            OR: [{ nome: { contains: busca } }, { nif: { contains: busca } }],
          }
        : {}),
    }

    const revendedores = await prisma.revendedor.findMany({
      where,
      orderBy: { nome: 'asc' },
      take: limite + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        _count: { select: { pontosVenda: true, pedidos: true } },
        utilizador: { select: { id: true, email: true, ativo: true } },
      },
    })

    const temMais = revendedores.length > limite
    const pagina = temMais ? revendedores.slice(0, limite) : revendedores

    return NextResponse.json({
      revendedores: pagina.map((r) => ({
        id: r.id,
        nome: r.nome,
        nif: r.nif,
        tipo: r.tipo,
        contacto: r.contacto,
        email: r.email,
        ativo: r.ativo,
        totalPontosVenda: r._count.pontosVenda,
        totalPedidos: r._count.pedidos,
        utilizador: r.utilizador,
      })),
      proximoCursor: temMais ? pagina[pagina.length - 1].id : null,
    })
  } catch (error) {
    console.error('Erro ao listar revendedores:', error)
    return NextResponse.json({ message: 'Sessão inválida.' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await obterPayload()
    if (!payload) {
      return NextResponse.json(
        { message: 'Não autenticado ou sem permissão.' },
        { status: 401 },
      )
    }

    const { nome, nif, tipo, contacto, email } = await request.json()

    if (!nome || !nif || !tipo || !email) {
      return NextResponse.json(
        { message: 'Nome, NIF, tipo e email são obrigatórios.' },
        { status: 400 },
      )
    }

    const nifEmUso = await prisma.revendedor.findUnique({ where: { nif } })
    if (nifEmUso) {
      return NextResponse.json(
        { message: 'Já existe um revendedor/grossista com este NIF.' },
        { status: 409 },
      )
    }

    const emailEmUso = await prisma.utilizador.findUnique({ where: { email } })
    if (emailEmUso) {
      return NextResponse.json(
        { message: 'Este email já está associado a uma conta.' },
        { status: 409 },
      )
    }

    // Senha inicial = NIF — o utilizador troca no primeiro login via "Recuperar senha"
    const senhaHash = await hashSenha(nif)
    const labelTipo = tipo === 'GROSSISTA' ? 'Grossista' : 'Revendedor'

    const revendedor = await prisma.$transaction(async (tx) => {
      const rev = await tx.revendedor.create({
        data: { nome, nif, tipo, contacto, email, ativo: true },
      })

      // Cria o utilizador de acesso à plataforma
      await tx.utilizador.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          perfil: tipo, // "REVENDEDOR" ou "GROSSISTA"
          revendedorId: rev.id,
        },
      })

      // Regista também como Agente autorizado no sistema de distribuição
      await tx.agente.create({
        data: {
          nome,
          nif,
          contacto,
          ativo: true,
        },
      })

      return rev
    })

    // Envio do email com as credenciais — fora da transação para não
    // fazer rollback do registo se o email falhar
    try {
      await enviarEmail({
        para: email,
        assunto: `Acesso à plataforma Sonagás — Bem-vindo, ${nome}`,
        html: templateBoasVindas({ nome, email, senhaInicial: nif, labelTipo }),
      })
    } catch (emailError) {
      // Registo criado com sucesso mesmo se o email falhar
      console.error('Aviso: falha ao enviar email de boas-vindas:', emailError)
    }

    return NextResponse.json({
      message: `${labelTipo} criado com sucesso. Credenciais enviadas por email.`,
      revendedor,
    })
  } catch (error) {
    console.error('Erro ao criar revendedor:', error)
    return NextResponse.json(
      { message: 'Erro ao processar o pedido. Tente novamente.' },
      { status: 500 },
    )
  }
}

// ------------------------------------------------------------
// Template de email de boas-vindas com credenciais
// ------------------------------------------------------------
function templateBoasVindas({
  nome,
  email,
  senhaInicial,
  labelTipo,
}: {
  nome: string
  email: string
  senhaInicial: string
  labelTipo: string
}) {
  return `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FAFAF8;">
    <p style="color: #1A1A1A; font-size: 13px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 24px;">
      Sonagás · Grupo Sonangol
    </p>

    <h1 style="color: #1A1A1A; font-size: 22px; font-weight: 700; margin: 0 0 8px;">
      Bem-vindo à plataforma, ${nome}!
    </h1>
    <p style="color: #1A1A1A99; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      A tua conta de <strong>${labelTipo}</strong> foi criada com sucesso no sistema integrado da Sonagás.
      Abaixo encontras as tuas credenciais de acesso.
    </p>

    <div style="background: #1A1A1A; border-radius: 8px; padding: 20px; margin: 0 0 20px;">
      <p style="color: #FFC20E; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 12px;">
        Credenciais de acesso
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #ffffff99; font-size: 12px; padding: 4px 0; width: 80px;">Email</td>
          <td style="color: #ffffff; font-size: 14px; font-weight: 600; padding: 4px 0;">${email}</td>
        </tr>
        <tr>
          <td style="color: #ffffff99; font-size: 12px; padding: 4px 0;">Senha</td>
          <td style="color: #FFC20E; font-size: 14px; font-weight: 600; padding: 4px 0; letter-spacing: 0.05em;">${senhaInicial}</td>
        </tr>
      </table>
    </div>

    <div style="background: #E2231A15; border-left: 3px solid #E2231A; border-radius: 4px; padding: 12px 16px; margin: 0 0 24px;">
      <p style="color: #E2231A; font-size: 13px; font-weight: 600; margin: 0 0 4px;">
        ⚠️ Altera a senha no primeiro acesso
      </p>
      <p style="color: #1A1A1A99; font-size: 12px; margin: 0; line-height: 1.5;">
        A senha inicial é o teu NIF. Por segurança, altera-a imediatamente após o primeiro login
        através da opção <strong>"Esqueceu a senha?"</strong> no ecrã de login.
      </p>
    </div>

    <p style="color: #1A1A1A99; font-size: 12px; line-height: 1.6; margin: 0;">
      Se tiveres alguma dúvida, contacta o suporte em
      <a href="mailto:suporte@sonagas.co.ao" style="color: #E2231A;">suporte@sonagas.co.ao</a>.
    </p>
  </div>
  `
}

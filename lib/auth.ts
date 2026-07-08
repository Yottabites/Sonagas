import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

// ------------------------------------------------------------
// JWT_SECRET: lido e validado só quando é realmente necessário,
// não no import do módulo (evita quebrar o `next build`)
// ------------------------------------------------------------
function obterJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET não definido no .env')
  }
  return secret
}

// ------------------------------------------------------------
// Senhas: hash e verificação (bcrypt)
// ------------------------------------------------------------
export async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, SALT_ROUNDS)
}

export async function verificarSenha(
  senha: string,
  senhaHash: string,
): Promise<boolean> {
  return bcrypt.compare(senha, senhaHash)
}

// ------------------------------------------------------------
// Token JWT: emitido só depois da senha ser validada com bcrypt
// ------------------------------------------------------------
export interface PayloadToken {
  sub: string // id do utilizador
  perfil:
    | 'ADMIN'
    | 'GESTOR_LICENCAS'
    | 'GESTOR_ESTOQUE'
    | 'FISCAL'
    | 'ANALISTA'
    | 'REVENDEDOR'
    | 'GROSSISTA'
  revendedorId?: string | null
}

export function gerarToken(payload: PayloadToken): string {
  return jwt.sign(payload, obterJwtSecret(), { expiresIn: '8h' })
}

export function verificarToken(token: string): PayloadToken {
  return jwt.verify(token, obterJwtSecret()) as PayloadToken
}

// ------------------------------------------------------------
// Rota de redirecionamento pós-login, com base no perfil
// ------------------------------------------------------------
export function obterRotaPosLogin(perfil: PayloadToken['perfil']): string {
  if (perfil === 'REVENDEDOR' || perfil === 'GROSSISTA') {
    return '/revendedor'
  }
  return '/dashboard'
}

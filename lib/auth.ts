import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET as string

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido no .env')
}

const SALT_ROUNDS = 10

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
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
}

export function verificarToken(token: string): PayloadToken {
  return jwt.verify(token, JWT_SECRET) as PayloadToken
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

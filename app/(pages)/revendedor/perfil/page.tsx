'use client'

import { useEffect, useState } from 'react'
import { Loader2, User, Lock, Check, Store } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { usePerfil } from '../../../core/hooks/usePerfil'
import { useAtualizarPerfil } from '../../../core/hooks/useAtualizarPerfil'
import { useAtualizarSenhaPerfil } from '../../../core/hooks/useAtualizarSenha'

const LABEL_TIPO: Record<string, string> = {
  REVENDEDOR: 'Revendedor',
  GROSSISTA: 'Grossista',
}

export default function PerfilPage() {
  const { data, isLoading } = usePerfil()

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="font-[Roboto] text-xs font-bold uppercase tracking-[0.2em] text-[#E2231A]">
          Conta
        </p>
        <h1 className="font-[Roboto] text-2xl font-bold text-[#1A1A1A]">
          O meu perfil
        </h1>
        <p className="mt-1 text-sm text-[#1A1A1A]/60">
          Gere os teus dados pessoais e a segurança da tua conta.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#E2231A]" />
        </div>
      ) : data ? (
        <>
          <CartaoIdentificacao
            nome={data.revendedor.nome}
            nif={data.revendedor.nif}
            tipo={data.revendedor.tipo}
          />
          <FormularioDadosPessoais
            nomeInicial={data.utilizador.nome}
            emailInicial={data.utilizador.email}
            contactoInicial={data.revendedor.contacto ?? ''}
          />
          <FormularioSenha />
        </>
      ) : null}
    </div>
  )
}

function CartaoIdentificacao({
  nome,
  nif,
  tipo,
}: {
  nome: string
  nif: string
  tipo: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#1A1A1A]/10 bg-white p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A]">
        <Store className="h-6 w-6 text-[#FFC20E]" />
      </div>
      <div>
        <p className="font-[Roboto] text-base font-bold text-[#1A1A1A]">
          {nome}
        </p>
        <p className="text-xs text-[#1A1A1A]/50">
          NIF: {nif} · {LABEL_TIPO[tipo] ?? tipo}
        </p>
      </div>
    </div>
  )
}

function FormularioDadosPessoais({
  nomeInicial,
  emailInicial,
  contactoInicial,
}: {
  nomeInicial: string
  emailInicial: string
  contactoInicial: string
}) {
  const [nome, setNome] = useState(nomeInicial)
  const [email, setEmail] = useState(emailInicial)
  const [contacto, setContacto] = useState(contactoInicial)
  const [sucesso, setSucesso] = useState(false)

  const { mutate, isPending, error } = useAtualizarPerfil()

  useEffect(() => {
    setNome(nomeInicial)
    setEmail(emailInicial)
    setContacto(contactoInicial)
  }, [nomeInicial, emailInicial, contactoInicial])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSucesso(false)
    mutate({ nome, email, contacto }, { onSuccess: () => setSucesso(true) })
  }

  return (
    <div className="rounded-2xl border border-[#1A1A1A]/10 bg-white p-6">
      <div className="mb-5 flex items-center gap-2">
        <User className="h-4 w-4 text-[#E2231A]" />
        <h2 className="font-[Roboto] text-base font-bold text-[#1A1A1A]">
          Dados pessoais
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-[#1A1A1A]">
            Nome
          </Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            minLength={3}
            className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#1A1A1A]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
          />
          <p className="text-xs text-[#1A1A1A]/40">
            Este email é também usado para iniciar sessão.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contacto" className="text-[#1A1A1A]">
            Contacto
          </Label>
          <Input
            id="contacto"
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
            placeholder="+244 9XX XXX XXX"
            className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
          />
        </div>

        {error && (
          <p className="rounded-md bg-[#E2231A]/10 px-3 py-2 text-sm text-[#E2231A]">
            {error.message}
          </p>
        )}

        {sucesso && !isPending && (
          <p className="flex items-center gap-1.5 rounded-md bg-[#1A8F4C]/10 px-3 py-2 text-sm text-[#1A8F4C]">
            <Check className="h-4 w-4" />
            Dados atualizados com sucesso.
          </p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16] disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Guardar alterações'
          )}
        </Button>
      </form>
    </div>
  )
}

function FormularioSenha() {
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erroValidacao, setErroValidacao] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  const { mutate, isPending, error } = useAtualizarSenhaPerfil()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErroValidacao(null)
    setSucesso(false)

    if (novaSenha.length < 8) {
      setErroValidacao('A nova senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setErroValidacao('As senhas não coincidem.')
      return
    }

    mutate(
      { senhaAtual, novaSenha },
      {
        onSuccess: () => {
          setSucesso(true)
          setSenhaAtual('')
          setNovaSenha('')
          setConfirmarSenha('')
        },
      },
    )
  }

  return (
    <div className="rounded-2xl border border-[#1A1A1A]/10 bg-white p-6">
      <div className="mb-5 flex items-center gap-2">
        <Lock className="h-4 w-4 text-[#E2231A]" />
        <h2 className="font-[Roboto] text-base font-bold text-[#1A1A1A]">
          Alterar senha
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="senhaAtual" className="text-[#1A1A1A]">
            Senha atual
          </Label>
          <Input
            id="senhaAtual"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            required
            className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="novaSenha" className="text-[#1A1A1A]">
              Nova senha
            </Label>
            <Input
              id="novaSenha"
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
              minLength={8}
              className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmarSenha" className="text-[#1A1A1A]">
              Confirmar nova senha
            </Label>
            <Input
              id="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              minLength={8}
              className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
            />
          </div>
        </div>

        {(erroValidacao || error) && (
          <p className="rounded-md bg-[#E2231A]/10 px-3 py-2 text-sm text-[#E2231A]">
            {erroValidacao ?? error?.message}
          </p>
        )}

        {sucesso && !isPending && (
          <p className="flex items-center gap-1.5 rounded-md bg-[#1A8F4C]/10 px-3 py-2 text-sm text-[#1A8F4C]">
            <Check className="h-4 w-4" />
            Senha atualizada com sucesso.
          </p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 gap-2 bg-[#1A1A1A] font-[Roboto] font-semibold text-white hover:bg-[#1A1A1A]/85 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Atualizar senha'
          )}
        </Button>
      </form>
    </div>
  )
}

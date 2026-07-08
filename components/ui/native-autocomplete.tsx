'use client'

import { useId, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface OpcaoAutocomplete {
  id: string
  label: string
}

interface NativeAutocompleteProps {
  label: string
  placeholder?: string
  opcoes: OpcaoAutocomplete[]
  valorId: string
  onChange: (id: string) => void
  disabled?: boolean
}

/**
 * Autocomplete nativo: usa <input list="..."> + <datalist>, sem
 * nenhum componente de combobox em JS. O browser trata a UI de
 * sugestões (filtragem, navegação por teclado, etc.) nativamente.
 *
 * Como o <datalist> só devolve o texto escrito (não um id), guardamos
 * o texto livre num estado próprio e resolvemos o id comparando com
 * a label exata de uma opção sempre que o texto corresponde a uma.
 */
export function NativeAutocomplete({
  label,
  placeholder,
  opcoes,
  valorId,
  onChange,
  disabled,
}: NativeAutocompleteProps) {
  const datalistId = useId()
  const opcaoSelecionada = opcoes.find((o) => o.id === valorId)
  const [texto, setTexto] = useState(opcaoSelecionada?.label ?? '')

  function handleChange(novoTexto: string) {
    setTexto(novoTexto)
    const opcaoCorrespondente = opcoes.find((o) => o.label === novoTexto)
    onChange(opcaoCorrespondente?.id ?? '')
  }

  return (
    <div className="space-y-2">
      <Label className="text-[#1A1A1A]">{label}</Label>
      <Input
        list={datalistId}
        value={texto}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className="h-11 border-[#1A1A1A]/15 focus-visible:ring-[#E2231A]"
      />
      <datalist id={datalistId}>
        {opcoes.map((opcao) => (
          <option key={opcao.id} value={opcao.label} />
        ))}
      </datalist>
      {texto && !valorId && (
        <p className="text-xs text-[#E2231A]">
          Nenhuma correspondência encontrada — escolhe uma opção da lista.
        </p>
      )}
    </div>
  )
}

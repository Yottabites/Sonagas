'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  FileBadge,
  Boxes,
  Truck,
  BarChart3,
  ShoppingCart,
  MessageCircleQuestion,
  Bot,
  Phone,
  Mail,
} from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { useSimplifikaWidget } from '../../core/hooks/useSimplifikaWidget'
// import { useSimplifikaWidget } from "@/hooks/useSimplifikaWidget";

interface TopicoAjuda {
  icon: React.ElementType
  titulo: string
  descricao: string
}

const TOPICOS_AJUDA: TopicoAjuda[] = [
  {
    icon: ShoppingCart,
    titulo: 'Como faço um pedido?',
    descricao:
      "No teu painel, vai a 'Fazer pedido', escolhe os produtos (gás butano 13kg ou 6kg) e as quantidades desejadas. Confirma os dados e submete — o pedido fica com o estado 'Pendente' até ser aprovado pela Sonagás.",
  },
  {
    icon: Truck,
    titulo: 'Como acompanho a distribuição?',
    descricao:
      "Depois do pedido ser aprovado, é atribuído a um agente autorizado para entrega no teu ponto de venda. Podes acompanhar o estado — Planeada, Em trânsito, Entregue — diretamente na secção 'Distribuições' do teu painel.",
  },
  {
    icon: FileBadge,
    titulo: 'Preciso de licença para vender?',
    descricao:
      'A licença é exigida aos agentes autorizados que fazem a distribuição, não diretamente ao revendedor/grossista. O teu ponto de venda (pingpoint) é registado e validado pela Sonagás no momento do cadastro.',
  },
  {
    icon: Boxes,
    titulo: 'Como sei se o meu pedido está em estoque?',
    descricao:
      'A disponibilidade é verificada automaticamente no momento em que submetes o pedido. Se um produto estiver temporariamente indisponível, serás notificado antes de confirmares.',
  },
  {
    icon: BarChart3,
    titulo: 'Tenho acesso a relatórios das minhas vendas?',
    descricao:
      "Sim. Na secção 'Histórico', encontras o resumo de todos os pedidos feitos, por período, com o respetivo estado e quantidade entregue.",
  },
]

export default function SuporteSonagas() {
  const { abrirChat } = useSimplifikaWidget()

  return (
    <div className="min-h-screen w-full bg-[#FAFAF8] font-[Inter]">
      {/* ---------------------------------------------------- */}
      {/* TOPO */}
      {/* ---------------------------------------------------- */}
      <header className="border-b border-[#1A1A1A]/10 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Link>
          <Image
            src="/sonagas.png"
            alt="Sonagás Energias Renováveis"
            width={130}
            height={44}
            className="h-8 w-auto object-contain"
          />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* ---------------------------------------------------- */}
        {/* CABEÇALHO */}
        {/* ---------------------------------------------------- */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block font-[Roboto] text-xs font-bold uppercase tracking-[0.25em] text-[#E2231A]">
            Central de ajuda · Revendedores e Grossistas
          </span>
          <h1 className="font-[Roboto] text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Como podemos ajudar?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#1A1A1A]/60">
            Aqui encontras tudo sobre como funciona a plataforma — desde como
            fazer um pedido até como acompanhar a distribuição. Se ainda tiveres
            dúvidas, fala com o nosso assistente.
          </p>
        </div>

        {/* ---------------------------------------------------- */}
        {/* CARTÃO DE DESTAQUE — ASSISTENTE IA (SIMPLIFIKA) */}
        {/* ---------------------------------------------------- */}
        <div className="mb-12 flex flex-col items-center gap-4 rounded-2xl border border-[#1A1A1A]/10 bg-white p-8 text-center shadow-sm sm:flex-row sm:text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A]">
            <Bot className="h-7 w-7 text-[#FFC20E]" />
          </div>
          <div className="flex-1">
            <h2 className="font-[Roboto] text-lg font-bold text-[#1A1A1A]">
              Assistente Simplifika
            </h2>
            <p className="mt-1 text-sm text-[#1A1A1A]/60">
              Tens uma dúvida específica? O assistente de IA da Simplifika
              responde-te em tempo real, a qualquer hora.
            </p>
          </div>
          <Button
            onClick={abrirChat}
            className="h-11 w-full shrink-0 gap-2 bg-[#E2231A] font-[Roboto] font-semibold text-white hover:bg-[#C01D16] sm:w-auto"
          >
            <MessageCircleQuestion className="h-4 w-4" />
            Falar com o assistente
          </Button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TÓPICOS / FAQ */}
        {/* ---------------------------------------------------- */}
        <div className="mb-12">
          <h2 className="mb-5 font-[Roboto] text-lg font-bold text-[#1A1A1A]">
            Como funciona a plataforma
          </h2>

          <Accordion type="single" collapsible className="space-y-3">
            {TOPICOS_AJUDA.map((topico, index) => {
              const Icon = topico.icon
              return (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-xl border border-[#1A1A1A]/10 bg-white px-5"
                >
                  <AccordionTrigger className="font-[Roboto] text-sm font-semibold text-[#1A1A1A] hover:no-underline">
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-[#E2231A]" />
                      {topico.titulo}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pl-7 text-sm leading-relaxed text-[#1A1A1A]/65">
                    {topico.descricao}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>

        {/* ---------------------------------------------------- */}
        {/* CONTACTOS DIRETOS */}
        {/* ---------------------------------------------------- */}
        <div className="rounded-2xl border border-[#1A1A1A]/10 bg-white p-6">
          <h2 className="mb-4 font-[Roboto] text-base font-bold text-[#1A1A1A]">
            Prefere contacto direto?
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:suporte@sonagas.co.ao"
              className="flex flex-1 items-center gap-3 rounded-lg border border-[#1A1A1A]/10 px-4 py-3 text-sm font-medium text-[#1A1A1A]/80 transition hover:border-[#E2231A]/30 hover:bg-[#E2231A]/[0.04]"
            >
              <Mail className="h-4 w-4 text-[#E2231A]" />
              suporte@sonagas.co.ao
            </a>
            <a
              href="tel:+244923000000"
              className="flex flex-1 items-center gap-3 rounded-lg border border-[#1A1A1A]/10 px-4 py-3 text-sm font-medium text-[#1A1A1A]/80 transition hover:border-[#E2231A]/30 hover:bg-[#E2231A]/[0.04]"
            >
              <Phone className="h-4 w-4 text-[#E2231A]" />
              +244 923 000 000
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

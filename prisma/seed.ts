import bcrypt from 'bcryptjs'
import { prisma } from '../app/core/lib/prisma'

const SALT_ROUNDS = 10

async function hash(senha: string) {
  return bcrypt.hash(senha, SALT_ROUNDS)
}

async function main() {
  console.log('Seed iniciado...')

  // ----------------------------------------------------------
  // 1. ZONAS GEOGRÁFICAS
  // ----------------------------------------------------------
  const [zonaLuanda, zonaBenguela, zonaHuambo] = await Promise.all([
    prisma.zonaGeografica.create({
      data: { nome: 'Luanda Centro', provincia: 'Luanda', municipio: 'Luanda' },
    }),
    prisma.zonaGeografica.create({
      data: {
        nome: 'Benguela Norte',
        provincia: 'Benguela',
        municipio: 'Benguela',
      },
    }),
    prisma.zonaGeografica.create({
      data: { nome: 'Huambo Centro', provincia: 'Huambo', municipio: 'Huambo' },
    }),
  ])

  console.log('Zonas geográficas criadas.')

  // ----------------------------------------------------------
  // 2. UTILIZADORES INTERNOS (Admin, Gestores, Fiscal, Analista)
  // ----------------------------------------------------------
  const senhaPadrao = await hash('Senha@123')

  const admin = await prisma.utilizador.create({
    data: {
      nome: 'Administrador Sonagás',
      email: 'admin@sonagas.co.ao',
      senha: senhaPadrao,
      perfil: 'ADMIN',
    },
  })

  const gestorLicencas = await prisma.utilizador.create({
    data: {
      nome: 'Mariana Costa',
      email: 'gestor.licencas@sonagas.co.ao',
      senha: senhaPadrao,
      perfil: 'GESTOR_LICENCAS',
    },
  })

  const gestorEstoque = await prisma.utilizador.create({
    data: {
      nome: 'João Fernandes',
      email: 'gestor.estoque@sonagas.co.ao',
      senha: senhaPadrao,
      perfil: 'GESTOR_ESTOQUE',
    },
  })

  const fiscal = await prisma.utilizador.create({
    data: {
      nome: 'Carlos Neto',
      email: 'fiscal@sonagas.co.ao',
      senha: senhaPadrao,
      perfil: 'FISCAL',
    },
  })

  const analista = await prisma.utilizador.create({
    data: {
      nome: 'Beatriz Lopes',
      email: 'analista@sonagas.co.ao',
      senha: senhaPadrao,
      perfil: 'ANALISTA',
    },
  })

  console.log('Utilizadores internos criados.')

  // ----------------------------------------------------------
  // 3. PRODUTOS E ARMAZÉM
  // ----------------------------------------------------------
  const produtoP13 = await prisma.produto.create({
    data: {
      nome: 'Botija de Gás Butano 13kg',
      codigo: 'GB-13KG',
      pesoKg: 13,
    },
  })

  const produtoP6 = await prisma.produto.create({
    data: {
      nome: 'Botija de Gás Butano 6kg',
      codigo: 'GB-06KG',
      pesoKg: 6,
    },
  })

  const armazemCentral = await prisma.armazem.create({
    data: {
      nome: 'Armazém Central Luanda',
      localizacao: 'Zona Industrial, Luanda',
    },
  })

  const loteP13 = await prisma.loteEstoque.create({
    data: {
      produtoId: produtoP13.id,
      armazemId: armazemCentral.id,
      codigoLote: 'LOTE-P13-2026-001',
      quantidade: 5000,
    },
  })

  const loteP6 = await prisma.loteEstoque.create({
    data: {
      produtoId: produtoP6.id,
      armazemId: armazemCentral.id,
      codigoLote: 'LOTE-P06-2026-001',
      quantidade: 3000,
    },
  })

  // Movimento de entrada inicial em estoque
  await prisma.movimentoEstoque.createMany({
    data: [
      {
        produtoId: produtoP13.id,
        armazemId: armazemCentral.id,
        loteId: loteP13.id,
        tipo: 'ENTRADA',
        quantidade: 5000,
        referenciaDoc: 'GR-2026-0001',
      },
      {
        produtoId: produtoP6.id,
        armazemId: armazemCentral.id,
        loteId: loteP6.id,
        tipo: 'ENTRADA',
        quantidade: 3000,
        referenciaDoc: 'GR-2026-0002',
      },
    ],
  })

  console.log('Produtos, armazém e estoque inicial criados.')

  // ----------------------------------------------------------
  // 4. AGENTES + LICENÇAS + FISCALIZAÇÃO
  // ----------------------------------------------------------
  const agente1 = await prisma.agente.create({
    data: {
      nome: 'Agente Autorizado - Domingos Sapalo',
      nif: 'AO0011223344',
      contacto: '+244 923 111 222',
      zonaId: zonaLuanda.id,
      codigoSap: 'SAP-AG-001',
    },
  })

  const agente2 = await prisma.agente.create({
    data: {
      nome: 'Agente Autorizado - Isabel Manuel',
      nif: 'AO0011223355',
      contacto: '+244 923 333 444',
      zonaId: zonaBenguela.id,
      codigoSap: 'SAP-AG-002',
    },
  })

  const licenca1 = await prisma.licenca.create({
    data: {
      numero: 'LIC-2026-0001',
      agenteId: agente1.id,
      dataEmissao: new Date('2026-01-10'),
      dataValidade: new Date('2027-01-10'),
      status: 'ATIVA',
      latitude: -8.838333,
      longitude: 13.234444,
      sapReferencia: 'SAP-LIC-0001',
    },
  })

  const licenca2 = await prisma.licenca.create({
    data: {
      numero: 'LIC-2026-0002',
      agenteId: agente2.id,
      dataEmissao: new Date('2025-12-01'),
      dataValidade: new Date('2026-12-01'),
      status: 'PENDENTE_RENOVACAO',
      latitude: -12.578333,
      longitude: 13.405,
      sapReferencia: 'SAP-LIC-0002',
    },
  })

  await prisma.fiscalizacao.create({
    data: {
      licencaId: licenca1.id,
      agenteId: agente1.id,
      fiscalId: fiscal.id,
      conforme: true,
      observacoes: 'Documentação validada no local, sem irregularidades.',
      latitude: -8.838333,
      longitude: 13.234444,
    },
  })

  await prisma.renovacaoLicenca.create({
    data: {
      licencaId: licenca2.id,
      observacoes: 'Pedido de renovação submetido pelo agente.',
    },
  })

  console.log('Agentes, licenças e fiscalização criados.')

  // ----------------------------------------------------------
  // 5. REVENDEDORES / GROSSISTAS (4 vendedores) + UTILIZADOR + PONTO DE VENDA
  // ----------------------------------------------------------
  const vendedoresData = [
    {
      nome: 'Loja Kianda Gás',
      nif: 'AO0099887701',
      tipo: 'REVENDEDOR' as const,
      email: 'kiandagas@vendedores.co.ao',
      contacto: '+244 924 100 001',
      zonaId: zonaLuanda.id,
      pontoVenda: {
        nome: 'PDV Kianda - Talatona',
        codigo: 'PDV-0001',
        endereco: 'Talatona, Luanda',
      },
    },
    {
      nome: 'Distribuidora Maianga',
      nif: 'AO0099887702',
      tipo: 'GROSSISTA' as const,
      email: 'maianga@vendedores.co.ao',
      contacto: '+244 924 100 002',
      zonaId: zonaLuanda.id,
      pontoVenda: {
        nome: 'PDV Maianga - Armazém',
        codigo: 'PDV-0002',
        endereco: 'Maianga, Luanda',
      },
    },
    {
      nome: 'Comercial Catumbela',
      nif: 'AO0099887703',
      tipo: 'REVENDEDOR' as const,
      email: 'catumbela@vendedores.co.ao',
      contacto: '+244 924 100 003',
      zonaId: zonaBenguela.id,
      pontoVenda: {
        nome: 'PDV Catumbela Centro',
        codigo: 'PDV-0003',
        endereco: 'Catumbela, Benguela',
      },
    },
    {
      nome: 'Grossista Huambo Sul',
      nif: 'AO0099887704',
      tipo: 'GROSSISTA' as const,
      email: 'huambosul@vendedores.co.ao',
      contacto: '+244 924 100 004',
      zonaId: zonaHuambo.id,
      pontoVenda: {
        nome: 'PDV Huambo Sul',
        codigo: 'PDV-0004',
        endereco: 'Huambo, Huambo',
      },
    },
  ]

  const revendedoresCriados = []

  for (const v of vendedoresData) {
    const revendedor = await prisma.revendedor.create({
      data: {
        nome: v.nome,
        nif: v.nif,
        tipo: v.tipo,
        contacto: v.contacto,
        email: v.email,
      },
    })

    // Utilizador de acesso à plataforma, ligado ao revendedor
    await prisma.utilizador.create({
      data: {
        nome: v.nome,
        email: v.email,
        senha: senhaPadrao,
        perfil: v.tipo, // "REVENDEDOR" ou "GROSSISTA"
        revendedorId: revendedor.id,
      },
    })

    const pontoVenda = await prisma.pontoVenda.create({
      data: {
        nome: v.pontoVenda.nome,
        codigo: v.pontoVenda.codigo,
        revendedorId: revendedor.id,
        zonaId: v.zonaId,
        endereco: v.pontoVenda.endereco,
        status: 'ATIVO',
      },
    })

    revendedoresCriados.push({ revendedor, pontoVenda })
  }

  console.log(
    '4 vendedores (revendedores/grossistas) + utilizadores + pontos de venda criados.',
  )

  // ----------------------------------------------------------
  // 6. PEDIDOS feitos pelos vendedores na plataforma
  // ----------------------------------------------------------
  await prisma.pedido.create({
    data: {
      revendedorId: revendedoresCriados[0].revendedor.id,
      status: 'APROVADO',
      observacoes: 'Pedido mensal recorrente.',
      itens: {
        create: [
          { produtoId: produtoP13.id, quantidade: 100 },
          { produtoId: produtoP6.id, quantidade: 50 },
        ],
      },
    },
  })

  await prisma.pedido.create({
    data: {
      revendedorId: revendedoresCriados[1].revendedor.id,
      status: 'EM_PROCESSAMENTO',
      itens: {
        create: [{ produtoId: produtoP13.id, quantidade: 500 }],
      },
    },
  })

  await prisma.pedido.create({
    data: {
      revendedorId: revendedoresCriados[2].revendedor.id,
      status: 'PENDENTE',
      itens: {
        create: [{ produtoId: produtoP6.id, quantidade: 80 }],
      },
    },
  })

  await prisma.pedido.create({
    data: {
      revendedorId: revendedoresCriados[3].revendedor.id,
      status: 'CONCLUIDO',
      itens: {
        create: [
          { produtoId: produtoP13.id, quantidade: 300 },
          { produtoId: produtoP6.id, quantidade: 150 },
        ],
      },
    },
  })

  console.log('Pedidos dos vendedores criados.')

  // ----------------------------------------------------------
  // 7. DISTRIBUIÇÃO (Agente -> Ponto de Venda) + movimento de saída
  // ----------------------------------------------------------
  const distribuicao1 = await prisma.distribuicao.create({
    data: {
      agenteId: agente1.id,
      pontoVendaId: revendedoresCriados[0].pontoVenda.id,
      status: 'ENTREGUE',
      dataPrevista: new Date('2026-06-15'),
      dataEntrega: new Date('2026-06-15'),
      itens: {
        create: [
          { produtoId: produtoP13.id, quantidade: 100 },
          { produtoId: produtoP6.id, quantidade: 50 },
        ],
      },
    },
  })

  await prisma.movimentoEstoque.createMany({
    data: [
      {
        produtoId: produtoP13.id,
        armazemId: armazemCentral.id,
        loteId: loteP13.id,
        tipo: 'SAIDA',
        quantidade: 100,
        referenciaDoc: 'DIST-0001',
        distribuicaoId: distribuicao1.id,
      },
      {
        produtoId: produtoP6.id,
        armazemId: armazemCentral.id,
        loteId: loteP6.id,
        tipo: 'SAIDA',
        quantidade: 50,
        referenciaDoc: 'DIST-0001',
        distribuicaoId: distribuicao1.id,
      },
    ],
  })

  const distribuicao2 = await prisma.distribuicao.create({
    data: {
      agenteId: agente2.id,
      pontoVendaId: revendedoresCriados[2].pontoVenda.id,
      status: 'EM_TRANSITO',
      dataPrevista: new Date('2026-06-20'),
      itens: {
        create: [{ produtoId: produtoP6.id, quantidade: 80 }],
      },
    },
  })

  console.log('Distribuições criadas.')

  // ----------------------------------------------------------
  // 8. RELATÓRIO de exemplo
  // ----------------------------------------------------------
  await prisma.relatorio.create({
    data: {
      titulo: 'Relatório de Distribuição - Junho 2026',
      tipo: 'DISTRIBUICAO',
      zonaId: zonaLuanda.id,
      periodoInicio: new Date('2026-06-01'),
      periodoFim: new Date('2026-06-30'),
      geradoPorId: analista.id,
      dadosJson: {
        totalDistribuicoes: 2,
        totalUnidadesEntregues: 150,
        zonasAtendidas: ['Luanda Centro', 'Benguela Norte'],
      },
    },
  })

  console.log('Relatório de exemplo criado.')

  console.log('\nSeed concluído com sucesso!')
  console.log('Senha padrão de todos os utilizadores: Senha@123')
}

main()
  .catch((e) => {
    console.error('Erro ao executar o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { DadosRelatorio } from '../../app/core/services/relatorio.service'

const VERMELHO = '#E2231A'
const AMARELO = '#FFC20E'
const PRETO = '#1A1A1A'
const VERDE = '#1A8F4C'
const CINZA_CLARO = '#F5F5F5'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 9,
    color: PRETO,
  },
  // Cabeçalho
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: VERMELHO,
  },
  cabecalhoTitulo: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: PRETO },
  cabecalhoSubtitulo: { fontSize: 9, color: '#666', marginTop: 2 },
  cabecalhoMarca: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: VERMELHO,
    textAlign: 'right',
  },
  cabecalhoData: {
    fontSize: 8,
    color: '#666',
    textAlign: 'right',
    marginTop: 2,
  },
  // Secções
  secao: { marginBottom: 20 },
  secaoTitulo: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: VERMELHO,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  // Grid de KPIs
  kpiGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  kpiCard: {
    flex: 1,
    minWidth: '18%',
    backgroundColor: CINZA_CLARO,
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  kpiValor: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: PRETO },
  kpiLabel: { fontSize: 7, color: '#666', textAlign: 'center', marginTop: 2 },
  // Tabelas
  tabela: { marginTop: 4 },
  tabelaLinha: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingVertical: 5,
    alignItems: 'center',
  },
  tabelaHeader: {
    flexDirection: 'row',
    backgroundColor: PRETO,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginBottom: 2,
  },
  tabelaHeaderTexto: {
    fontFamily: 'Helvetica-Bold',
    color: '#FFF',
    fontSize: 8,
  },
  tabelaCelula: { flex: 1, paddingHorizontal: 4 },
  // Badges de status
  badge: { borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  // Gráfico de barras simples (horizontal)
  barraContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  barraLabel: { width: 120, fontSize: 8, color: '#444' },
  barraFundo: {
    flex: 1,
    height: 12,
    backgroundColor: '#E8E8E8',
    borderRadius: 6,
  },
  barraPreenchimento: { height: 12, borderRadius: 6 },
  barraValor: {
    width: 30,
    fontSize: 8,
    textAlign: 'right',
    color: PRETO,
    fontFamily: 'Helvetica-Bold',
  },
  // Dois em linha
  duasColsContainer: { flexDirection: 'row', gap: 12 },
  duasCols: { flex: 1 },
  // Rodapé
  rodape: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 6,
  },
  rodapeTexto: { fontSize: 7, color: '#999' },
})

const COR_STATUS_LICENCA: Record<string, string> = {
  ATIVA: VERDE,
  PENDENTE_RENOVACAO: AMARELO,
  EXPIRADA: VERMELHO,
  SUSPENSA: '#888',
  CANCELADA: '#888',
}

const LABEL_STATUS_PEDIDO: Record<string, string> = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  EM_PROCESSAMENTO: 'Em proc.',
  CONCLUIDO: 'Concluído',
  REJEITADO: 'Rejeitado',
}

const LABEL_STATUS_DIST: Record<string, string> = {
  PLANEADA: 'Planeada',
  EM_TRANSITO: 'Em trânsito',
  ENTREGUE: 'Entregue',
  CANCELADA: 'Cancelada',
}

function Barra({
  label,
  valor,
  maximo,
  cor = VERMELHO,
}: {
  label: string
  valor: number
  maximo: number
  cor?: string
}) {
  const pct = maximo > 0 ? (valor / maximo) * 100 : 0
  return (
    <View style={styles.barraContainer}>
      <Text style={styles.barraLabel}>{label}</Text>
      <View style={styles.barraFundo}>
        <View
          style={[
            styles.barraPreenchimento,
            { width: `${pct}%`, backgroundColor: cor },
          ]}
        />
      </View>
      <Text style={styles.barraValor}>{valor}</Text>
    </View>
  )
}

interface Props {
  dados: DadosRelatorio
}

export function RelatorioSonagas({ dados }: Props) {
  const {
    kpis,
    licencasPorStatus,
    pedidosPorStatus,
    distribuicoesPorStatus,
    estoqueProdutos,
    fiscalizacoes,
    distribuicoesMes,
    pedidosMes,
    topAgentes,
    topZonas,
    geradoEm,
  } = dados

  const maxDistribuicoesMes = Math.max(
    ...distribuicoesMes.map((d) => d.total ?? 0),
    1,
  )
  const maxPedidosMes = Math.max(...pedidosMes.map((p) => p.total ?? 0), 1)
  const maxEstoque = Math.max(
    ...estoqueProdutos.map((p) => p.quantidade ?? 0),
    1,
  )
  const maxAgentes = Math.max(...topAgentes.map((a) => a.fiscalizacoes ?? 0), 1)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* CABEÇALHO */}
        <View style={styles.cabecalho}>
          <View>
            <Text style={styles.cabecalhoTitulo}>Relatório Geral</Text>
            <Text style={styles.cabecalhoSubtitulo}>
              Sistema Integrado de Gestão
            </Text>
          </View>
          <View>
            <Text style={styles.cabecalhoMarca}>Sonagás · Grupo Sonangol</Text>
            <Text style={styles.cabecalhoData}>
              Gerado em {new Date(geradoEm).toLocaleString('pt-PT')}
            </Text>
          </View>
        </View>

        {/* KPIs */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Resumo Executivo</Text>
          <View style={styles.kpiGrid}>
            {[
              { label: 'Agentes ativos', valor: kpis.totalAgentes },
              { label: 'Revendedores', valor: kpis.totalRevendedores },
              { label: 'Grossistas', valor: kpis.totalGrossistas },
              { label: 'Licenças ativas', valor: kpis.totalLicencasAtivas },
              { label: 'Total pedidos', valor: kpis.totalPedidos },
              { label: 'Distribuições', valor: kpis.totalDistribuicoes },
            ].map((kpi) => (
              <View key={kpi.label} style={styles.kpiCard}>
                <Text style={styles.kpiValor}>{kpi.valor}</Text>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* LICENÇAS + FISCALIZAÇÃO */}
        <View style={[styles.duasColsContainer, styles.secao]}>
          <View style={styles.duasCols}>
            <Text style={styles.secaoTitulo}>Licenças</Text>
            {licencasPorStatus.map((item) => (
              <Barra
                key={item.status}
                label={item.status ?? ''}
                valor={item.valor ?? 0}
                maximo={
                  kpis.totalLicencasAtivas +
                  kpis.totalLicencasPendentes +
                  kpis.totalLicencasExpiradas
                }
                cor={item.cor}
              />
            ))}
          </View>
          <View style={styles.duasCols}>
            <Text style={styles.secaoTitulo}>Fiscalização</Text>
            <Barra
              label="Conformes"
              valor={fiscalizacoes.conformes}
              maximo={fiscalizacoes.total}
              cor={VERDE}
            />
            <Barra
              label="Não conformes"
              valor={fiscalizacoes.naoConformes}
              maximo={fiscalizacoes.total}
              cor={VERMELHO}
            />
            <View
              style={[
                styles.kpiCard,
                { marginTop: 8, backgroundColor: '#FFF0F0' },
              ]}
            >
              <Text
                style={[
                  styles.kpiValor,
                  {
                    color:
                      fiscalizacoes.taxaConformidade >= 80 ? VERDE : VERMELHO,
                  },
                ]}
              >
                {fiscalizacoes.taxaConformidade}%
              </Text>
              <Text style={styles.kpiLabel}>Taxa de conformidade</Text>
            </View>
          </View>
        </View>

        {/* TENDÊNCIA — Distribuições por mês */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>
            Distribuições — Últimos 6 meses
          </Text>
          {distribuicoesMes.map((item) => (
            <Barra
              key={item.mes}
              label={item.mes ?? ''}
              valor={item.total ?? 0}
              maximo={maxDistribuicoesMes}
              cor={VERMELHO}
            />
          ))}
        </View>

        {/* TENDÊNCIA — Pedidos por mês */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Pedidos — Últimos 6 meses</Text>
          {pedidosMes.map((item) => (
            <Barra
              key={item.mes}
              label={item.mes ?? ''}
              valor={item.total ?? 0}
              maximo={maxPedidosMes}
              cor={AMARELO}
            />
          ))}
        </View>

        {/* ESTOQUE + TOP AGENTES */}
        <View style={styles.duasColsContainer}>
          <View style={styles.duasCols}>
            <Text style={styles.secaoTitulo}>Estoque por produto</Text>
            {estoqueProdutos.map((item) => (
              <Barra
                key={item.nome}
                label={item.nome ?? ''}
                valor={item.quantidade ?? 0}
                maximo={maxEstoque}
                cor="#1A1A1A"
              />
            ))}
          </View>
          <View style={styles.duasCols}>
            <Text style={styles.secaoTitulo}>Top agentes</Text>
            {topAgentes.map((item) => (
              <Barra
                key={item.nome}
                label={item.nome ?? ''}
                valor={item.fiscalizacoes ?? 0}
                maximo={maxAgentes}
                cor={VERMELHO}
              />
            ))}
          </View>
        </View>

        {/* RODAPÉ */}
        <View style={styles.rodape} fixed>
          <Text style={styles.rodapeTexto}>Sonagás · Grupo Sonangol</Text>
          <Text style={styles.rodapeTexto}>
            Documento gerado automaticamente — uso interno
          </Text>
        </View>
      </Page>
    </Document>
  )
}

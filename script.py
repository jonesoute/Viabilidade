# Vou criar os arquivos finais do aplicativo para facilitar o upload para o GitHub
import zipfile
import os

# Vamos criar uma versão final e otimizada dos arquivos para o GitHub

# HTML final
html_content = '''<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Análise de Viabilidade Econômica - Sistema Web</title>
    <meta name="description" content="Sistema profissional para análise de viabilidade econômica de empresas em estágio inicial">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>">
</head>
<body>
    <div class="container">
        <header class="app-header">
            <h1>📊 Análise de Viabilidade Econômica</h1>
            <p>Sistema profissional para análise de empresas em estágio inicial</p>
            <div class="version-info">v1.0 - Desenvolvido para empreendedores</div>
        </header>

        <nav class="nav-tabs">
            <button class="nav-tab active" data-tab="dashboard">Dashboard</button>
            <button class="nav-tab" data-tab="premissas">Premissas</button>
            <button class="nav-tab" data-tab="servicos">Serviços</button>
            <button class="nav-tab" data-tab="custos">Custos</button>
            <button class="nav-tab" data-tab="cenarios">Cenários</button>
            <button class="nav-tab" data-tab="analise">Análise</button>
        </nav>

        <!-- Dashboard Tab -->
        <section id="dashboard" class="tab-content active">
            <div class="dashboard-grid">
                <div class="card">
                    <div class="card__body">
                        <h3>Status da Viabilidade</h3>
                        <div class="viability-status">
                            <div class="status-indicator" id="viabilityIndicator">
                                <span class="status-text" id="viabilityText">Calculando...</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card__body">
                        <h3>Indicadores Principais</h3>
                        <div class="indicators-grid">
                            <div class="indicator">
                                <span class="indicator-label">ROI</span>
                                <span class="indicator-value" id="dashboardROI">0%</span>
                            </div>
                            <div class="indicator">
                                <span class="indicator-label">Payback</span>
                                <span class="indicator-value" id="dashboardPayback">0 meses</span>
                            </div>
                            <div class="indicator">
                                <span class="indicator-label">VPL</span>
                                <span class="indicator-value" id="dashboardVPL">R$ 0</span>
                            </div>
                            <div class="indicator">
                                <span class="indicator-label">TIR</span>
                                <span class="indicator-value" id="dashboardTIR">0%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card chart-card">
                    <div class="card__body">
                        <h3>Evolução Financeira (24 meses)</h3>
                        <canvas id="evolutionChart"></canvas>
                    </div>
                </div>
                
                <div class="card chart-card">
                    <div class="card__body">
                        <h3>Ponto de Equilíbrio</h3>
                        <div class="breakeven-info">
                            <div class="breakeven-item">
                                <span class="breakeven-label">Atendimentos/mês:</span>
                                <span class="breakeven-value" id="breakevenAtendimentos">0</span>
                            </div>
                            <div class="breakeven-item">
                                <span class="breakeven-label">Receita mínima:</span>
                                <span class="breakeven-value" id="breakevenReceita">R$ 0</span>
                            </div>
                            <div class="breakeven-item">
                                <span class="breakeven-label">Ocupação necessária:</span>
                                <span class="breakeven-value" id="breakevenOcupacao">0%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Premissas Tab -->
        <section id="premissas" class="tab-content">
            <div class="card">
                <div class="card__body">
                    <h3>Parâmetros Operacionais</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="diasUteis">Dias úteis por mês</label>
                            <input type="number" id="diasUteis" min="20" max="30" step="1">
                        </div>
                        <div class="form-group">
                            <label for="horasPorDia">Horas por dia</label>
                            <input type="number" id="horasPorDia" min="6" max="16" step="1">
                        </div>
                        <div class="form-group">
                            <label for="numeroSalas">Número de salas/estações</label>
                            <input type="number" id="numeroSalas" min="1" max="10" step="1">
                        </div>
                        <div class="form-group">
                            <label for="ocupacaoInicial">Ocupação inicial (%)</label>
                            <input type="number" id="ocupacaoInicial" min="10" max="100" step="5">
                        </div>
                        <div class="form-group">
                            <label for="ocupacaoEstabilizada">Ocupação estabilizada (%)</label>
                            <input type="number" id="ocupacaoEstabilizada" min="50" max="100" step="5">
                        </div>
                        <div class="form-group">
                            <label for="crescimentoMensal">Crescimento mensal (%)</label>
                            <input type="number" id="crescimentoMensal" min="0" max="10" step="0.5">
                        </div>
                        <div class="form-group">
                            <label for="impostos">Impostos (% faturamento)</label>
                            <input type="number" id="impostos" min="0" max="30" step="0.1">
                        </div>
                        <div class="form-group">
                            <label for="inadimplencia">Inadimplência (%)</label>
                            <input type="number" id="inadimplencia" min="0" max="15" step="0.5">
                        </div>
                        <div class="form-group">
                            <label for="capitalGiro">Capital de giro (meses)</label>
                            <input type="number" id="capitalGiro" min="1" max="12" step="1">
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Serviços Tab -->
        <section id="servicos" class="tab-content">
            <div class="card">
                <div class="card__body">
                    <div class="section-header">
                        <h3>Serviços/Produtos</h3>
                        <button class="btn btn-primary" onclick="adicionarServico()">+ Adicionar Serviço</button>
                    </div>
                    
                    <div class="alert alert-info">
                        <strong>Dica:</strong> O mix percentual deve somar 100%. O ticket médio é calculado automaticamente.
                    </div>
                    
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Serviço</th>
                                    <th>Categoria</th>
                                    <th>Preço (R$)</th>
                                    <th>Duração (min)</th>
                                    <th>Mix (%)</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="servicosTableBody">
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="summary-info">
                        <div class="summary-item">
                            <span class="summary-label">Total Mix:</span>
                            <span class="summary-value" id="totalMix">0%</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Ticket Médio:</span>
                            <span class="summary-value" id="ticketMedio">R$ 0,00</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Duração Média:</span>
                            <span class="summary-value" id="duracaoMedia">0 min</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Custos Tab -->
        <section id="custos" class="tab-content">
            <div class="costs-grid">
                <div class="card">
                    <div class="card__body">
                        <div class="section-header">
                            <h3>Materiais e Insumos</h3>
                            <button class="btn btn-primary" onclick="adicionarMaterial()">+ Adicionar Material</button>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Material</th>
                                        <th>Custo Unit. (R$)</th>
                                        <th>Qtd/Serviço</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="materiaisTableBody">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card__body">
                        <div class="section-header">
                            <h3>Equipamentos</h3>
                            <button class="btn btn-primary" onclick="adicionarEquipamento()">+ Adicionar Equipamento</button>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Equipamento</th>
                                        <th>Qtd</th>
                                        <th>Valor Unit. (R$)</th>
                                        <th>Vida Útil (meses)</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="equipamentosTableBody">
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="summary-info">
                            <div class="summary-item">
                                <span class="summary-label">Total CAPEX:</span>
                                <span class="summary-value" id="totalCAPEX">R$ 0,00</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Depreciação Mensal:</span>
                                <span class="summary-value" id="depreciacao">R$ 0,00</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card__body">
                        <div class="section-header">
                            <h3>Gastos Fixos Mensais</h3>
                            <button class="btn btn-primary" onclick="adicionarGastoFixo()">+ Adicionar Gasto</button>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Descrição</th>
                                        <th>Valor (R$)</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="gastosFixosTableBody">
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="summary-info">
                            <div class="summary-item">
                                <span class="summary-label">Total Gastos Fixos:</span>
                                <span class="summary-value" id="totalGastosFixos">R$ 0,00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Cenários Tab -->
        <section id="cenarios" class="tab-content">
            <div class="scenarios-grid">
                <div class="card">
                    <div class="card__body">
                        <h3>Simulador de Cenários</h3>
                        <div class="scenario-controls">
                            <div class="control-group">
                                <label for="ocupacaoSlider">Ocupação: <span id="ocupacaoValue">75</span>%</label>
                                <input type="range" id="ocupacaoSlider" min="30" max="100" value="75" step="5">
                            </div>
                            <div class="control-group">
                                <label for="ticketSlider">Ticket Médio: R$ <span id="ticketValue">112</span></label>
                                <input type="range" id="ticketSlider" min="50" max="200" value="112" step="5">
                            </div>
                        </div>
                        
                        <div class="scenario-results">
                            <div class="result-item">
                                <span class="result-label">Receita Mensal:</span>
                                <span class="result-value" id="receitaCenario">R$ 0</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Lucro Mensal:</span>
                                <span class="result-value" id="lucroCenario">R$ 0</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Margem (%):</span>
                                <span class="result-value" id="margemCenario">0%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card chart-card">
                    <div class="card__body">
                        <h3>Comparação de Cenários</h3>
                        <canvas id="scenariosChart"></canvas>
                    </div>
                </div>
            </div>
        </section>

        <!-- Análise Tab -->
        <section id="analise" class="tab-content">
            <div class="analysis-grid">
                <div class="card">
                    <div class="card__body">
                        <h3>Indicadores Financeiros</h3>
                        <div class="indicators-detailed">
                            <div class="indicator-detailed">
                                <div class="indicator-header">
                                    <span class="indicator-name">Investimento Total</span>
                                    <span class="indicator-amount" id="investimentoTotal">R$ 0</span>
                                </div>
                            </div>
                            <div class="indicator-detailed">
                                <div class="indicator-header">
                                    <span class="indicator-name">Receita Anual (Ano 1)</span>
                                    <span class="indicator-amount" id="receitaAnual">R$ 0</span>
                                </div>
                            </div>
                            <div class="indicator-detailed">
                                <div class="indicator-header">
                                    <span class="indicator-name">Lucro Anual (Ano 1)</span>
                                    <span class="indicator-amount" id="lucroAnual">R$ 0</span>
                                </div>
                            </div>
                            <div class="indicator-detailed">
                                <div class="indicator-header">
                                    <span class="indicator-name">ROI - Retorno sobre Investimento</span>
                                    <span class="indicator-amount" id="roiDetalhado">0%</span>
                                </div>
                            </div>
                            <div class="indicator-detailed">
                                <div class="indicator-header">
                                    <span class="indicator-name">Payback - Tempo de Retorno</span>
                                    <span class="indicator-amount" id="paybackDetalhado">0 meses</span>
                                </div>
                            </div>
                            <div class="indicator-detailed">
                                <div class="indicator-header">
                                    <span class="indicator-name">VPL - Valor Presente Líquido</span>
                                    <span class="indicator-amount" id="vplDetalhado">R$ 0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card__body">
                        <h3>Recomendação Final</h3>
                        <div class="recommendation" id="recommendationCard">
                            <div class="recommendation-status" id="recommendationStatus">
                                Analisando...
                            </div>
                            <div class="recommendation-text" id="recommendationText">
                                Configure os parâmetros para receber a análise de viabilidade.
                            </div>
                            <div class="recommendation-details" id="recommendationDetails">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card__body">
                    <h3>DRE Simplificada (12 meses)</h3>
                    <div class="table-responsive">
                        <table class="data-table dre-table">
                            <thead>
                                <tr>
                                    <th>Mês</th>
                                    <th>Receita Bruta</th>
                                    <th>Custos Variáveis</th>
                                    <th>Margem Contribuição</th>
                                    <th>Custos Fixos</th>
                                    <th>Lucro Líquido</th>
                                </tr>
                            </thead>
                            <tbody id="dreTableBody">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <footer class="app-footer">
        <div class="footer-content">
            <p>&copy; 2025 Sistema de Análise de Viabilidade Econômica. Desenvolvido para empreendedores.</p>
            <p>Versão 1.0 - Hospedado no GitHub Pages</p>
        </div>
    </footer>

    <script src="app.js"></script>
</body>
</html>'''

# Salvar HTML
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("✅ Arquivo index.html criado")
print("✅ Tamanho do arquivo HTML:", len(html_content), "caracteres")

# Criar README para o GitHub
readme_content = '''# 📊 Sistema de Análise de Viabilidade Econômica

**Sistema web profissional para análise de viabilidade econômica de empresas em estágio inicial**

🔗 **Acesso Online**: [https://seu-usuario.github.io/viabilidade-analyzer](https://seu-usuario.github.io/viabilidade-analyzer)

## 🎯 Características Principais

- **Interface moderna e responsiva** - Funciona em desktop e mobile
- **Cálculos automáticos** - Indicadores financeiros em tempo real
- **Simulador de cenários** - Teste diferentes combinações
- **Gráficos interativos** - Visualizações profissionais
- **Sistema completo** - Da premissa à recomendação final

## 🚀 Funcionalidades

### Dashboard Executivo
- Status de viabilidade com semáforo visual
- Indicadores principais (ROI, Payback, VPL, TIR)
- Gráficos de evolução financeira
- Análise do ponto de equilíbrio

### Configuração Inteligente
- **Premissas operacionais** configuráveis
- **Cadastro dinâmico** de serviços/produtos
- **Gestão completa** de custos (materiais, equipamentos, fixos)
- **Validações automáticas** dos dados

### Análise Avançada
- **Projeção 24 meses** automatizada
- **3 cenários** (otimista, realista, pessimista)
- **Indicadores financeiros** profissionais
- **Recomendação final** baseada em critérios técnicos

## 💻 Como Usar

1. **Configure as Premissas** - Defina parâmetros operacionais
2. **Cadastre Serviços** - Adicione produtos/serviços oferecidos
3. **Defina Custos** - Configure materiais, equipamentos e gastos fixos
4. **Analise Resultados** - Visualize projeções no Dashboard
5. **Teste Cenários** - Simule diferentes condições
6. **Tome Decisões** - Baseie-se na recomendação final

## 🔧 Tecnologias

- **HTML5/CSS3** - Interface moderna
- **JavaScript** - Lógica de negócio
- **Chart.js** - Gráficos interativos
- **Responsive Design** - Funciona em qualquer dispositivo

## 📋 Indicadores Calculados

- **ROI** - Retorno sobre Investimento
- **VPL** - Valor Presente Líquido
- **TIR** - Taxa Interna de Retorno
- **Payback** - Tempo de retorno do investimento
- **Ponto de Equilíbrio** - Em atendimentos e receita
- **Margem de Contribuição** - Por produto/serviço

## 🎓 Aplicações

- **Empreendedores** - Validar ideias de negócio
- **Consultores** - Analisar viabilidade para clientes
- **Investidores** - Avaliar oportunidades
- **Estudantes** - Aprender análise financeira
- **Empresários** - Planejar expansões

## 📊 Setores Compatíveis

- Clínicas e consultórios
- Salões e estética
- Restaurantes e lanchonetes
- Academias e fitness
- Consultorias e serviços
- Comércio em geral
- E muito mais...

## 🔄 Atualizações

**Versão 1.0** (Atual)
- Sistema completo de análise
- Interface responsiva
- Cálculos financeiros avançados
- Simulador de cenários
- Gráficos interativos

---

⭐ **Estrele este repositório** se foi útil para você!

📝 **Desenvolvido com ❤️ para empreendedores brasileiros**
'''

# Salvar README
with open('README.md', 'w', encoding='utf-8') as f:
    f.write(readme_content)

print("✅ Arquivo README.md criado")
print("✅ Total de arquivos preparados: index.html, style.css, app.js, README.md")

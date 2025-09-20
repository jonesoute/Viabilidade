// Sistema de Análise de Viabilidade Econômica - Versão 2.0
// Desenvolvido para GitHub Pages - Revisão completa com cálculos automáticos

// Estado da aplicação
let appState = {
    premissas: {
        diasUteis: 26,
        horasPorDia: 10,
        numeroSalas: 2,
        ocupacaoInicial: 50,
        ocupacaoEstabilizada: 85,
        crescimentoMensal: 2,
        impostos: 7.54,
        inadimplencia: 2,
        capitalGiro: 4
    },
    servicos: [
        {id: 1, nome: "Limpeza de pele profunda", categoria: "Facial", preco: 129, duracao: 60, mix: 12},
        {id: 2, nome: "Peeling de cristal/diamante", categoria: "Facial", preco: 169, duracao: 40, mix: 8},
        {id: 3, nome: "Hidratação facial", categoria: "Facial", preco: 99, duracao: 50, mix: 15},
        {id: 4, nome: "Drenagem linfática", categoria: "Corporal", preco: 119, duracao: 60, mix: 15},
        {id: 5, nome: "Massagem modeladora", categoria: "Corporal", preco: 139, duracao: 60, mix: 12},
        {id: 6, nome: "Depilação pernas", categoria: "Depilação", preco: 69, duracao: 60, mix: 8}
    ],
    materiais: [
        {id: 1, nome: "Sabonete glicólico", custoUnitario: 0.8, quantidadePorServico: 5},
        {id: 2, nome: "Loção tônica", custoUnitario: 1.2, quantidadePorServico: 5},
        {id: 3, nome: "Cera para depilação", custoUnitario: 0.15, quantidadePorServico: 100}
    ],
    equipamentos: [
        {id: 1, nome: "Maca profissional", quantidade: 2, valorUnitario: 3500, vidaUtilMeses: 60},
        {id: 2, nome: "Vapor de ozônio", quantidade: 1, valorUnitario: 8000, vidaUtilMeses: 60},
        {id: 3, nome: "Autoclave", quantidade: 1, valorUnitario: 3500, vidaUtilMeses: 60}
    ],
    gastosFixos: [
        {id: 1, nome: "Aluguel", valor: 3500},
        {id: 2, nome: "Salários + Encargos", valor: 8500},
        {id: 3, nome: "Energia elétrica", valor: 1400},
        {id: 4, nome: "Água", valor: 350},
        {id: 5, nome: "Internet", valor: 150}
    ],
    custosVariaveis: [
        {id: 1, nome: "Comissões vendedores", custoUnitario: 5.0, quantidadePorServico: 1}
    ]
};

let charts = {};
let nextId = {
    servicos: 7,
    materiais: 4,
    equipamentos: 4,
    gastosFixos: 6,
    custosVariaveis: 2
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando aplicação...');
    initializeApp();
    setupEventListeners();
    loadInitialData();
    setTimeout(() => {
        calculateAndUpdate();
        console.log('✅ Aplicação inicializada');
    }, 100);
});

function initializeApp() {
    // Configurar navegação por abas
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');

            // Remover classes ativas
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Adicionar classes ativas
            tab.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');

                // Recarregar gráficos se necessário
                if (targetTab === 'dashboard') {
                    setTimeout(createCharts, 100);
                } else if (targetTab === 'capex') {
                    setTimeout(createCapexChart, 100);
                } else if (targetTab === 'investimento') {
                    setTimeout(createInvestmentChart, 100);
                }
            }
        });
    });

    // Configurar accordion
    setupAccordion();
}

function setupAccordion() {
    document.querySelectorAll('.accordion-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            const isActive = content.classList.contains('active');

            // Toggle do accordion
            btn.classList.toggle('active');
            content.classList.toggle('active');
        });
    });
}

function setupEventListeners() {
    // Premissas - eventos de mudança
    const premissasInputs = [
        'diasUteis', 'horasPorDia', 'numeroSalas', 'ocupacaoInicial', 
        'ocupacaoEstabilizada', 'crescimentoMensal', 'impostos', 
        'inadimplencia', 'capitalGiro'
    ];

    premissasInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', (e) => {
                appState.premissas[id] = parseFloat(e.target.value) || 0;
                calculateAndUpdate();
            });
        }
    });

    // Cenários - sliders
    const ocupacaoSlider = document.getElementById('ocupacaoSlider');
    const ticketSlider = document.getElementById('ticketSlider');

    if (ocupacaoSlider) {
        ocupacaoSlider.addEventListener('input', (e) => {
            document.getElementById('ocupacaoValue').textContent = e.target.value;
            updateScenarioResults();
        });
    }

    if (ticketSlider) {
        ticketSlider.addEventListener('input', (e) => {
            document.getElementById('ticketValue').textContent = e.target.value;
            updateScenarioResults();
        });
    }
}

function loadInitialData() {
    // Carregar premissas
    Object.keys(appState.premissas).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.value = appState.premissas[key];
        }
    });

    // Carregar valores iniciais de investimento
    const investimentoReformas = document.getElementById('investimentoReformas');
    const investimentoEstoque = document.getElementById('investimentoEstoque');
    if (investimentoReformas && !investimentoReformas.value) investimentoReformas.value = 25000;
    if (investimentoEstoque && !investimentoEstoque.value) investimentoEstoque.value = 8000;

    // Carregar tabelas
    renderServicosTable();
    renderMateriaisTable();
    renderEquipamentosTable();
    renderGastosFixosTable();
    renderCustosVariaveisTable();
}

// SERVIÇOS
function renderServicosTable() {
    const tbody = document.getElementById('servicosTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    appState.servicos.forEach(servico => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" value="${servico.nome}" onchange="updateServico(${servico.id}, 'nome', this.value)"></td>
            <td>
                <input list="categorias" value="${servico.categoria}" onchange="updateServico(${servico.id}, 'categoria', this.value)">
                <datalist id="categorias">
                    <option value="Facial">
                    <option value="Corporal">
                    <option value="Depilação">
                    <option value="Estética">
                    <option value="Massagem">
                    <option value="Tratamento">
                </datalist>
            </td>
            <td><input type="text" value="${formatCurrency(servico.preco)}" onchange="updateServicoPreco(${servico.id}, this.value)"></td>
            <td><input type="number" value="${servico.duracao}" min="5" step="5" onchange="updateServico(${servico.id}, 'duracao', parseInt(this.value))"></td>
            <td><input type="number" value="${servico.mix}" min="0" max="100" step="1" onchange="updateServico(${servico.id}, 'mix', parseInt(this.value))"></td>
            <td><button class="btn btn-danger btn-sm" onclick="removeServico(${servico.id})">Remover</button></td>
        `;
        tbody.appendChild(row);
    });

    updateServicosSummary();
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function parseCurrency(value) {
    return parseFloat(value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
}

function updateServicoPreco(id, value) {
    const preco = parseCurrency(value);
    updateServico(id, 'preco', preco);
}

function updateServico(id, field, value) {
    const servico = appState.servicos.find(s => s.id === id);
    if (servico) {
        servico[field] = value;
        if (field === 'preco') {
            // Rerender apenas a linha com o preço formatado
            renderServicosTable();
        }
        updateServicosSummary();
        calculateAndUpdate();
    }
}

function removeServico(id) {
    appState.servicos = appState.servicos.filter(s => s.id !== id);
    renderServicosTable();
    calculateAndUpdate();
}

function adicionarServico() {
    const novoServico = {
        id: nextId.servicos++,
        nome: `Novo Serviço ${nextId.servicos}`,
        categoria: 'Facial',
        preco: 100,
        duracao: 60,
        mix: 0
    };

    appState.servicos.push(novoServico);
    renderServicosTable();
}

function updateServicosSummary() {
    const totalMix = appState.servicos.reduce((sum, s) => sum + (s.mix || 0), 0);
    const ticketMedio = appState.servicos.reduce((sum, s) => sum + ((s.preco || 0) * (s.mix || 0) / 100), 0);
    const duracaoMedia = appState.servicos.reduce((sum, s) => sum + ((s.duracao || 0) * (s.mix || 0) / 100), 0);

    updateElement('totalMix', `${totalMix}%`);
    updateElement('ticketMedio', formatCurrency(ticketMedio));
    updateElement('duracaoMedia', `${Math.round(duracaoMedia)} min`);
}

// MATERIAIS
function renderMateriaisTable() {
    const tbody = document.getElementById('materiaisTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    appState.materiais.forEach(material => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" value="${material.nome}" onchange="updateMaterial(${material.id}, 'nome', this.value)"></td>
            <td><input type="number" value="${material.custoUnitario}" min="0" step="0.01" onchange="updateMaterial(${material.id}, 'custoUnitario', parseFloat(this.value))"></td>
            <td><input type="number" value="${material.quantidadePorServico}" min="0" step="0.1" onchange="updateMaterial(${material.id}, 'quantidadePorServico', parseFloat(this.value))"></td>
            <td><button class="btn btn-danger btn-sm" onclick="removeMaterial(${material.id})">Remover</button></td>
        `;
        tbody.appendChild(row);
    });
}

function updateMaterial(id, field, value) {
    const material = appState.materiais.find(m => m.id === id);
    if (material) {
        material[field] = value;
        calculateAndUpdate();
    }
}

function removeMaterial(id) {
    appState.materiais = appState.materiais.filter(m => m.id !== id);
    renderMateriaisTable();
    calculateAndUpdate();
}

function adicionarMaterial() {
    const novoMaterial = {
        id: nextId.materiais++,
        nome: `Material ${nextId.materiais}`,
        custoUnitario: 1.0,
        quantidadePorServico: 1
    };

    appState.materiais.push(novoMaterial);
    renderMateriaisTable();
}

// CUSTOS VARIÁVEIS
function renderCustosVariaveisTable() {
    const tbody = document.getElementById('custosVariaveisTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    appState.custosVariaveis.forEach(custo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" value="${custo.nome}" onchange="updateCustoVariavel(${custo.id}, 'nome', this.value)"></td>
            <td><input type="number" value="${custo.custoUnitario}" min="0" step="0.01" onchange="updateCustoVariavel(${custo.id}, 'custoUnitario', parseFloat(this.value))"></td>
            <td><input type="number" value="${custo.quantidadePorServico}" min="0" step="0.1" onchange="updateCustoVariavel(${custo.id}, 'quantidadePorServico', parseFloat(this.value))"></td>
            <td><button class="btn btn-danger btn-sm" onclick="removeCustoVariavel(${custo.id})">Remover</button></td>
        `;
        tbody.appendChild(row);
    });
}

function updateCustoVariavel(id, field, value) {
    const custo = appState.custosVariaveis.find(c => c.id === id);
    if (custo) {
        custo[field] = value;
        calculateAndUpdate();
    }
}

function removeCustoVariavel(id) {
    appState.custosVariaveis = appState.custosVariaveis.filter(c => c.id !== id);
    renderCustosVariaveisTable();
    calculateAndUpdate();
}

function adicionarCustoVariavel() {
    const novoCusto = {
        id: nextId.custosVariaveis++,
        nome: `Custo Variável ${nextId.custosVariaveis}`,
        custoUnitario: 1.0,
        quantidadePorServico: 1
    };

    appState.custosVariaveis.push(novoCusto);
    renderCustosVariaveisTable();
}

// EQUIPAMENTOS
function renderEquipamentosTable() {
    const tbody = document.getElementById('equipamentosTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    appState.equipamentos.forEach(equipamento => {
        const valorTotal = equipamento.quantidade * equipamento.valorUnitario;
        const depreciacaoMensal = valorTotal / equipamento.vidaUtilMeses;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" value="${equipamento.nome}" onchange="updateEquipamento(${equipamento.id}, 'nome', this.value)"></td>
            <td><input type="number" value="${equipamento.quantidade}" min="1" onchange="updateEquipamento(${equipamento.id}, 'quantidade', parseInt(this.value))"></td>
            <td><input type="number" value="${equipamento.valorUnitario}" min="0" step="100" onchange="updateEquipamento(${equipamento.id}, 'valorUnitario', parseFloat(this.value))"></td>
            <td>${formatCurrency(valorTotal)}</td>
            <td><input type="number" value="${equipamento.vidaUtilMeses}" min="1" onchange="updateEquipamento(${equipamento.id}, 'vidaUtilMeses', parseInt(this.value))"></td>
            <td>${formatCurrency(depreciacaoMensal)}</td>
            <td><button class="btn btn-danger btn-sm" onclick="removeEquipamento(${equipamento.id})">Remover</button></td>
        `;
        tbody.appendChild(row);
    });

    updateEquipamentosSummary();
}

function updateEquipamento(id, field, value) {
    const equipamento = appState.equipamentos.find(e => e.id === id);
    if (equipamento) {
        equipamento[field] = value;
        renderEquipamentosTable();
        calculateAndUpdate();
    }
}

function removeEquipamento(id) {
    appState.equipamentos = appState.equipamentos.filter(e => e.id !== id);
    renderEquipamentosTable();
    calculateAndUpdate();
}

function adicionarEquipamento() {
    const novoEquipamento = {
        id: nextId.equipamentos++,
        nome: `Equipamento ${nextId.equipamentos}`,
        quantidade: 1,
        valorUnitario: 1000,
        vidaUtilMeses: 60
    };

    appState.equipamentos.push(novoEquipamento);
    renderEquipamentosTable();
}

function updateEquipamentosSummary() {
    const totalCAPEX = appState.equipamentos.reduce((sum, e) => sum + (e.quantidade * e.valorUnitario), 0);
    const depreciacaoMensal = appState.equipamentos.reduce((sum, e) => sum + ((e.quantidade * e.valorUnitario) / e.vidaUtilMeses), 0);

    updateElement('totalCAPEX', formatCurrency(totalCAPEX));
    updateElement('depreciacaoMensal', formatCurrency(depreciacaoMensal));
}

// GASTOS FIXOS
function renderGastosFixosTable() {
    const tbody = document.getElementById('gastosFixosTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    appState.gastosFixos.forEach(gasto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" value="${gasto.nome}" onchange="updateGastoFixo(${gasto.id}, 'nome', this.value)"></td>
            <td><input type="number" value="${gasto.valor}" min="0" step="50" onchange="updateGastoFixo(${gasto.id}, 'valor', parseFloat(this.value))"></td>
            <td><button class="btn btn-danger btn-sm" onclick="removeGastoFixo(${gasto.id})">Remover</button></td>
        `;
        tbody.appendChild(row);
    });

    updateGastosFixosSummary();
}

function updateGastoFixo(id, field, value) {
    const gasto = appState.gastosFixos.find(g => g.id === id);
    if (gasto) {
        gasto[field] = value;
        updateGastosFixosSummary();
        calculateAndUpdate();
    }
}

function removeGastoFixo(id) {
    appState.gastosFixos = appState.gastosFixos.filter(g => g.id !== id);
    renderGastosFixosTable();
    calculateAndUpdate();
}

function adicionarGastoFixo() {
    const novoGasto = {
        id: nextId.gastosFixos++,
        nome: `Gasto Fixo ${nextId.gastosFixos}`,
        valor: 500
    };

    appState.gastosFixos.push(novoGasto);
    renderGastosFixosTable();
}

function updateGastosFixosSummary() {
    const totalGastosFixos = appState.gastosFixos.reduce((sum, g) => sum + (g.valor || 0), 0);
    updateElement('totalGastosFixos', formatCurrency(totalGastosFixos));
}

// CÁLCULOS PRINCIPAIS
function calculateAndUpdate() {
    const calculos = performCalculations();
    updateDashboard(calculos);
    updateAnalysis(calculos);
    updateInvestmentTab(calculos);
    updateScenarioResults();

    // Criar gráficos após um pequeno delay para garantir que os dados estão atualizados
    setTimeout(() => {
        createCharts();
        createCapexChart();
        createInvestmentChart();
    }, 50);
}

function performCalculations() {
    const premissas = appState.premissas;

    // Cálculos básicos
    const ticketMedio = appState.servicos.reduce((sum, s) => sum + ((s.preco || 0) * (s.mix || 0) / 100), 0);
    const duracaoMediaServico = appState.servicos.reduce((sum, s) => sum + ((s.duracao || 0) * (s.mix || 0) / 100), 0);

    // Capacidade operacional
    const horasPorMes = premissas.diasUteis * premissas.horasPorDia;
    const capacidadeMaximaHoras = horasPorMes * premissas.numeroSalas;
    const atendimentosPorHora = duracaoMediaServico > 0 ? 60 / duracaoMediaServico : 0;
    const capacidadeMaximaAtendimentos = capacidadeMaximaHoras * atendimentosPorHora;

    // CMV por atendimento
    const cmvMateriais = appState.materiais.reduce((sum, m) => 
        sum + ((m.custoUnitario || 0) * (m.quantidadePorServico || 0) / 100), 0
    );
    const cmvVariaveis = appState.custosVariaveis.reduce((sum, c) => 
        sum + ((c.custoUnitario || 0) * (c.quantidadePorServico || 0)), 0
    );
    const cmvTotal = cmvMateriais + cmvVariaveis;

    // Custos fixos
    const gastosFixosBase = appState.gastosFixos.reduce((sum, g) => sum + (g.valor || 0), 0);
    const depreciacaoMensal = appState.equipamentos.reduce((sum, e) => 
        sum + (((e.quantidade || 0) * (e.valorUnitario || 0)) / (e.vidaUtilMeses || 1)), 0
    );
    const custosFixosTotal = gastosFixosBase + depreciacaoMensal;

    // Investimento
    const capexTotal = appState.equipamentos.reduce((sum, e) => 
        sum + ((e.quantidade || 0) * (e.valorUnitario || 0)), 0
    );
    const reformas = parseFloat(document.getElementById('investimentoReformas')?.value || 0);
    const estoque = parseFloat(document.getElementById('investimentoEstoque')?.value || 0);

    // Capital de giro baseado na ocupação estabilizada
    const atendimentosEstabilizados = capacidadeMaximaAtendimentos * (premissas.ocupacaoEstabilizada / 100);
    const receitaMensalEstabilizada = atendimentosEstabilizados * ticketMedio;
    const custosVariaveisMensais = atendimentosEstabilizados * cmvTotal;
    const necessidadeMensal = custosFixosTotal + custosVariaveisMensais;
    const capitalGiro = necessidadeMensal * premissas.capitalGiro;

    const investimentoTotal = capexTotal + reformas + estoque + capitalGiro;

    // Ponto de equilíbrio
    const margemContribuicaoUnitaria = ticketMedio - cmvTotal - (ticketMedio * premissas.impostos / 100);
    const pontoEquilibrioAtendimentos = custosFixosTotal / (margemContribuicaoUnitaria || 1);
    const pontoEquilibrioReceita = pontoEquilibrioAtendimentos * ticketMedio;
    const pontoEquilibrioOcupacao = (pontoEquilibrioAtendimentos / capacidadeMaximaAtendimentos) * 100;

    // Projeções mensais
    const projecoes = [];
    let receitaAcumulada = 0;
    let lucroAcumulado = 0;

    for (let mes = 1; mes <= 24; mes++) {
        // Ocupação progressiva
        let ocupacao;
        if (mes <= 6) {
            ocupacao = premissas.ocupacaoInicial + (premissas.ocupacaoEstabilizada - premissas.ocupacaoInicial) * (mes - 1) / 5;
        } else {
            ocupacao = premissas.ocupacaoEstabilizada;
        }
        ocupacao = Math.min(ocupacao, 100) / 100;

        // Crescimento e sazonalidade
        const crescimentoAcumulado = Math.pow(1 + premissas.crescimentoMensal / 100, mes - 1);
        const quarter = Math.floor((mes - 1) % 12 / 3) + 1;
        let sazonalidade = 1.0;
        if (quarter === 1) sazonalidade = 0.95;
        else if (quarter === 3) sazonalidade = 1.05;

        // Cálculos do mês
        const atendimentosMes = capacidadeMaximaAtendimentos * ocupacao;
        const ticketAjustado = ticketMedio * crescimentoAcumulado;
        const receitaBruta = atendimentosMes * ticketAjustado * sazonalidade;
        const custosVariaveis = atendimentosMes * cmvTotal;
        const impostos = receitaBruta * premissas.impostos / 100;
        const receitaLiquida = receitaBruta - custosVariaveis - impostos;
        const lucroLiquido = receitaLiquida - custosFixosTotal;

        if (mes <= 12) {
            receitaAcumulada += receitaBruta;
            lucroAcumulado += lucroLiquido;
        }

        projecoes.push({
            mes,
            ocupacao: ocupacao * 100,
            atendimentos: atendimentosMes,
            receitaBruta,
            custosVariaveis,
            impostos,
            receitaLiquida,
            custosFixos: custosFixosTotal,
            lucroLiquido
        });
    }

    // Indicadores financeiros
    const roi = lucroAcumulado > 0 ? (lucroAcumulado / investimentoTotal) * 100 : 0;
    const paybackMeses = lucroAcumulado > 0 ? investimentoTotal / (lucroAcumulado / 12) : 0;
    const margemLiquida = receitaAcumulada > 0 ? (lucroAcumulado / receitaAcumulada) * 100 : 0;

    // VPL simplificado (TMA 1.2% a.m.)
    const tma = 0.012;
    let vpv = -investimentoTotal;
    projecoes.slice(0, 12).forEach((proj, index) => {
        vpv += proj.lucroLiquido / Math.pow(1 + tma, index + 1);
    });

    // TIR aproximada
    let tir = 0;
    if (lucroAcumulado > 0 && investimentoTotal > 0) {
        tir = (Math.pow(Math.abs(lucroAcumulado) / investimentoTotal + 1, 1/12) - 1) * 100;
    }

    return {
        ticketMedio,
        capacidadeMaximaAtendimentos,
        cmvTotal,
        custosFixosTotal,
        capexTotal,
        reformas,
        estoque,
        capitalGiro,
        investimentoTotal,
        pontoEquilibrioAtendimentos,
        pontoEquilibrioReceita,
        pontoEquilibrioOcupacao,
        projecoes,
        receitaAcumulada,
        lucroAcumulado,
        roi,
        paybackMeses,
        margemLiquida,
        vpv,
        tir,
        depreciacaoMensal
    };
}

function updateDashboard(calculos) {
    // Status de viabilidade
    const indicator = document.getElementById('viabilityIndicator');
    const text = document.getElementById('viabilityText');

    if (indicator && text) {
        if (calculos.roi > 20 && calculos.vpv > 0) {
            indicator.className = 'status-indicator viable';
            text.textContent = 'VIÁVEL';
        } else if (calculos.roi > 10 && calculos.vpv > -50000) {
            indicator.className = 'status-indicator caution';
            text.textContent = 'ANALISAR';
        } else {
            indicator.className = 'status-indicator not-viable';
            text.textContent = 'NÃO VIÁVEL';
        }
    }

    // Indicadores principais
    updateElement('dashboardROI', `${calculos.roi.toFixed(1)}%`);
    updateElement('dashboardPayback', `${calculos.paybackMeses.toFixed(1)} meses`);
    updateElement('dashboardVPL', formatCurrency(calculos.vpv));
    updateElement('dashboardTIR', `${calculos.tir.toFixed(1)}%`);

    // Ponto de equilíbrio
    updateElement('breakevenAtendimentos', Math.round(calculos.pontoEquilibrioAtendimentos));
    updateElement('breakevenReceita', formatCurrency(calculos.pontoEquilibrioReceita));
    updateElement('breakevenOcupacao', `${calculos.pontoEquilibrioOcupacao.toFixed(1)}%`);
}

function updateAnalysis(calculos) {
    updateElement('analiseInvestimentoTotal', formatCurrency(calculos.investimentoTotal));
    updateElement('receitaAnual', formatCurrency(calculos.receitaAcumulada));
    updateElement('lucroAnual', formatCurrency(calculos.lucroAcumulado));
    updateElement('roiDetalhado', `${calculos.roi.toFixed(1)}%`);
    updateElement('paybackDetalhado', `${calculos.paybackMeses.toFixed(1)} meses`);
    updateElement('vplDetalhado', formatCurrency(calculos.vpv));

    // Recomendação final
    const recommendation = document.getElementById('recommendationCard');
    const status = document.getElementById('recommendationStatus');
    const text = document.getElementById('recommendationText');

    if (recommendation && status && text) {
        if (calculos.roi > 20 && calculos.vpv > 0) {
            recommendation.className = 'recommendation viable';
            status.textContent = '✅ PROJETO VIÁVEL';
            text.textContent = 'O negócio apresenta excelentes indicadores financeiros. ROI superior a 20% e VPL positivo indicam alta viabilidade econômica.';
        } else if (calculos.roi > 10) {
            recommendation.className = 'recommendation caution';
            status.textContent = '⚠️ ANALISAR COM CUIDADO';
            text.textContent = 'O projeto apresenta viabilidade marginal. Recomenda-se otimizar custos ou aumentar receitas.';
        } else {
            recommendation.className = 'recommendation not-viable';
            status.textContent = '❌ PROJETO NÃO RECOMENDADO';
            text.textContent = 'Os indicadores financeiros não justificam o investimento. Revisar modelo de negócio.';
        }
    }

    // DRE
    const dreBody = document.getElementById('dreTableBody');
    if (dreBody && calculos.projecoes) {
        dreBody.innerHTML = '';
        calculos.projecoes.slice(0, 12).forEach(proj => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${proj.mes}</td>
                <td>${formatCurrency(proj.receitaBruta)}</td>
                <td>${formatCurrency(proj.custosVariaveis)}</td>
                <td>${formatCurrency(proj.receitaLiquida)}</td>
                <td>${formatCurrency(proj.custosFixos)}</td>
                <td style="color: ${proj.lucroLiquido >= 0 ? 'green' : 'red'}">${formatCurrency(proj.lucroLiquido)}</td>
            `;
            dreBody.appendChild(row);
        });
    }
}

function updateInvestmentTab(calculos) {
    updateElement('investimentoCAPEX', formatCurrency(calculos.capexTotal));
    updateElement('investimentoCapitalGiro', formatCurrency(calculos.capitalGiro));
    updateElement('investimentoTotal', formatCurrency(calculos.investimentoTotal));
}

function updateScenarioResults() {
    const ocupacao = parseFloat(document.getElementById('ocupacaoSlider')?.value || 75);
    const ticket = parseFloat(document.getElementById('ticketSlider')?.value || 112);

    const calculos = performCalculations();
    const atendimentosMes = calculos.capacidadeMaximaAtendimentos * ocupacao / 100;
    const receitaMensal = atendimentosMes * ticket;
    const custoVariavel = atendimentosMes * calculos.cmvTotal;
    const impostos = receitaMensal * appState.premissas.impostos / 100;
    const lucroMensal = receitaMensal - custoVariavel - impostos - calculos.custosFixosTotal;
    const margem = receitaMensal > 0 ? (lucroMensal / receitaMensal) * 100 : 0;

    updateElement('receitaCenario', formatCurrency(receitaMensal));
    updateElement('lucroCenario', formatCurrency(lucroMensal));
    updateElement('margemCenario', `${margem.toFixed(1)}%`);
}

// FINANCIAMENTO
function calcularFinanciamento() {
    const valor = parseFloat(document.getElementById('valorFinanciamento')?.value || 0);
    const taxa = parseFloat(document.getElementById('taxaJuros')?.value || 0) / 100;
    const prazo = parseFloat(document.getElementById('prazoFinanciamento')?.value || 0);

    if (valor > 0 && taxa > 0 && prazo > 0) {
        // Fórmula PMT
        const parcela = valor * (taxa * Math.pow(1 + taxa, prazo)) / (Math.pow(1 + taxa, prazo) - 1);
        updateElement('parcelaMensal', formatCurrency(parcela));
    } else {
        updateElement('parcelaMensal', 'R$ 0,00');
    }
}

// GRÁFICOS
function createCharts() {
    createEvolutionChart();
    createScenariosChart();
}

function createEvolutionChart() {
    const ctx = document.getElementById('evolutionChart');
    if (!ctx) return;

    const calculos = performCalculations();

    if (charts.evolution) {
        charts.evolution.destroy();
    }

    charts.evolution = new Chart(ctx, {
        type: 'line',
        data: {
            labels: calculos.projecoes.slice(0, 12).map(p => `Mês ${p.mes}`),
            datasets: [{
                label: 'Receita Bruta',
                data: calculos.projecoes.slice(0, 12).map(p => p.receitaBruta),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4
            }, {
                label: 'Custos Totais',
                data: calculos.projecoes.slice(0, 12).map(p => p.custosVariaveis + p.custosFixos),
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                tension: 0.4
            }, {
                label: 'Lucro Líquido',
                data: calculos.projecoes.slice(0, 12).map(p => p.lucroLiquido),
                borderColor: '#059669',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

function createScenariosChart() {
    const ctx = document.getElementById('scenariosChart');
    if (!ctx) return;

    if (charts.scenarios) {
        charts.scenarios.destroy();
    }

    const calculos = performCalculations();
    const cenarios = [
        { nome: 'Pessimista', ocupacao: 50, ticket: calculos.ticketMedio * 0.85 },
        { nome: 'Realista', ocupacao: 75, ticket: calculos.ticketMedio },
        { nome: 'Otimista', ocupacao: 90, ticket: calculos.ticketMedio * 1.15 }
    ];

    const dadosCenarios = cenarios.map(cenario => {
        const atendimentos = calculos.capacidadeMaximaAtendimentos * cenario.ocupacao / 100;
        const receita = atendimentos * cenario.ticket;
        const custos = atendimentos * calculos.cmvTotal + calculos.custosFixosTotal;
        const lucro = receita - custos;

        return { nome: cenario.nome, receita, lucro };
    });

    charts.scenarios = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dadosCenarios.map(c => c.nome),
            datasets: [{
                label: 'Receita Mensal',
                data: dadosCenarios.map(c => c.receita),
                backgroundColor: 'rgba(37, 99, 235, 0.6)',
                borderColor: '#2563eb',
                borderWidth: 1
            }, {
                label: 'Lucro Mensal',
                data: dadosCenarios.map(c => c.lucro),
                backgroundColor: 'rgba(5, 150, 105, 0.6)',
                borderColor: '#059669',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

function createCapexChart() {
    const ctx = document.getElementById('capexChart');
    if (!ctx || !appState.equipamentos.length) return;

    if (charts.capex) {
        charts.capex.destroy();
    }

    charts.capex = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: appState.equipamentos.map(e => e.nome),
            datasets: [{
                data: appState.equipamentos.map(e => e.quantidade * e.valorUnitario),
                backgroundColor: [
                    '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed',
                    '#0891b2', '#be185d', '#059669', '#ea580c'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

function createInvestmentChart() {
    const ctx = document.getElementById('investmentChart');
    if (!ctx) return;

    const calculos = performCalculations();

    if (charts.investment) {
        charts.investment.destroy();
    }

    charts.investment = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['CAPEX', 'Capital de Giro', 'Reformas', 'Estoque Inicial'],
            datasets: [{
                data: [
                    calculos.capexTotal,
                    calculos.capitalGiro,
                    calculos.reformas,
                    calculos.estoque
                ],
                backgroundColor: ['#2563eb', '#059669', '#d97706', '#dc2626']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const percentage = ((context.raw / calculos.investimentoTotal) * 100).toFixed(1);
                            return context.label + ': ' + formatCurrency(context.raw) + ` (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Função auxiliar
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Auto-save
function saveData() {
    try {
        localStorage.setItem('viabilidadeAnalyzer', JSON.stringify(appState));
    } catch (e) {
        console.warn('Não foi possível salvar no localStorage:', e);
    }
}

function loadData() {
    try {
        const saved = localStorage.getItem('viabilidadeAnalyzer');
        if (saved) {
            const savedState = JSON.parse(saved);
            appState = { ...appState, ...savedState };
            loadInitialData();
            calculateAndUpdate();
        }
    } catch (e) {
        console.warn('Erro ao carregar dados salvos:', e);
    }
}

// Auto-save a cada 30 segundos
setInterval(saveData, 30000);

// Carregar dados salvos na inicialização
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadData, 500);
});

// Configuração inicial do financiamento
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        calcularFinanciamento();

        // Eventos de financiamento
        ['valorFinanciamento', 'taxaJuros', 'prazoFinanciamento'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', calcularFinanciamento);
        });
    }, 1000);
});

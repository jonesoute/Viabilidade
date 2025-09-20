// Sistema de Análise de Viabilidade Econômica
// Desenvolvido para GitHub Pages

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
    ]
};

let charts = {};
let nextId = {
    servicos: 7,
    materiais: 4,
    equipamentos: 4,
    gastosFixos: 6
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadInitialData();
    calculateAndUpdate();
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
            document.getElementById(targetTab).classList.add('active');

            // Recarregar gráficos se necessário
            if (targetTab === 'dashboard') {
                setTimeout(createCharts, 100);
            }
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

    // Carregar tabelas
    renderServicosTable();
    renderMateriaisTable();
    renderEquipamentosTable();
    renderGastosFixosTable();
}

function renderServicosTable() {
    const tbody = document.getElementById('servicosTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    appState.servicos.forEach(servico => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" value="${servico.nome}" onchange="updateServico(${servico.id}, 'nome', this.value)"></td>
            <td>
                <select onchange="updateServico(${servico.id}, 'categoria', this.value)">
                    <option value="Facial" ${servico.categoria === 'Facial' ? 'selected' : ''}>Facial</option>
                    <option value="Corporal" ${servico.categoria === 'Corporal' ? 'selected' : ''}>Corporal</option>
                    <option value="Depilação" ${servico.categoria === 'Depilação' ? 'selected' : ''}>Depilação</option>
                    <option value="Estética" ${servico.categoria === 'Estética' ? 'selected' : ''}>Estética</option>
                </select>
            </td>
            <td><input type="number" value="${servico.preco}" min="0" step="0.01" onchange="updateServico(${servico.id}, 'preco', parseFloat(this.value))"></td>
            <td><input type="number" value="${servico.duracao}" min="5" step="5" onchange="updateServico(${servico.id}, 'duracao', parseInt(this.value))"></td>
            <td><input type="number" value="${servico.mix}" min="0" max="100" step="1" onchange="updateServico(${servico.id}, 'mix', parseInt(this.value))"></td>
            <td><button class="btn btn-danger btn-sm" onclick="removeServico(${servico.id})">Remover</button></td>
        `;
        tbody.appendChild(row);
    });

    updateServicosSummary();
}

function updateServico(id, field, value) {
    const servico = appState.servicos.find(s => s.id === id);
    if (servico) {
        servico[field] = value;
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
    const totalMix = appState.servicos.reduce((sum, s) => sum + s.mix, 0);
    const ticketMedio = appState.servicos.reduce((sum, s) => sum + (s.preco * s.mix / 100), 0);
    const duracaoMedia = appState.servicos.reduce((sum, s) => sum + (s.duracao * s.mix / 100), 0);

    const totalMixEl = document.getElementById('totalMix');
    const ticketMedioEl = document.getElementById('ticketMedio');
    const duracaoMediaEl = document.getElementById('duracaoMedia');

    if (totalMixEl) totalMixEl.textContent = `${totalMix}%`;
    if (ticketMedioEl) ticketMedioEl.textContent = `R$ ${ticketMedio.toFixed(2)}`;
    if (duracaoMediaEl) duracaoMediaEl.textContent = `${Math.round(duracaoMedia)} min`;
}

// Funções similares para materiais, equipamentos e gastos fixos
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

function renderEquipamentosTable() {
    const tbody = document.getElementById('equipamentosTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    appState.equipamentos.forEach(equipamento => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" value="${equipamento.nome}" onchange="updateEquipamento(${equipamento.id}, 'nome', this.value)"></td>
            <td><input type="number" value="${equipamento.quantidade}" min="1" onchange="updateEquipamento(${equipamento.id}, 'quantidade', parseInt(this.value))"></td>
            <td><input type="number" value="${equipamento.valorUnitario}" min="0" step="0.01" onchange="updateEquipamento(${equipamento.id}, 'valorUnitario', parseFloat(this.value))"></td>
            <td><input type="number" value="${equipamento.vidaUtilMeses}" min="1" onchange="updateEquipamento(${equipamento.id}, 'vidaUtilMeses', parseInt(this.value))"></td>
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
        updateEquipamentosSummary();
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
    const depreciacao = appState.equipamentos.reduce((sum, e) => sum + (e.quantidade * e.valorUnitario / e.vidaUtilMeses), 0);

    const totalCAPEXEl = document.getElementById('totalCAPEX');
    const depreciacaoEl = document.getElementById('depreciacao');

    if (totalCAPEXEl) totalCAPEXEl.textContent = `R$ ${totalCAPEX.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    if (depreciacaoEl) depreciacaoEl.textContent = `R$ ${depreciacao.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}

function renderGastosFixosTable() {
    const tbody = document.getElementById('gastosFixosTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    appState.gastosFixos.forEach(gasto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" value="${gasto.nome}" onchange="updateGastoFixo(${gasto.id}, 'nome', this.value)"></td>
            <td><input type="number" value="${gasto.valor}" min="0" step="0.01" onchange="updateGastoFixo(${gasto.id}, 'valor', parseFloat(this.value))"></td>
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
    const totalGastosFixos = appState.gastosFixos.reduce((sum, g) => sum + g.valor, 0);

    const totalGastosFixosEl = document.getElementById('totalGastosFixos');
    if (totalGastosFixosEl) {
        totalGastosFixosEl.textContent = `R$ ${totalGastosFixos.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    }
}

// Cálculos principais
function calculateAndUpdate() {
    const calculos = performCalculations();
    updateDashboard(calculos);
    updateAnalysis(calculos);
    updateScenarioResults();
    createCharts();
}

function performCalculations() {
    const premissas = appState.premissas;

    // Cálculos básicos
    const capacidadeMaxima = premissas.diasUteis * premissas.horasPorDia * premissas.numeroSalas;
    const ticketMedio = appState.servicos.reduce((sum, s) => sum + (s.preco * s.mix / 100), 0);
    const duracaoMediaServico = appState.servicos.reduce((sum, s) => sum + (s.duracao * s.mix / 100), 0);
    const atendimentosPorHora = duracaoMediaServico > 0 ? 60 / duracaoMediaServico : 0;
    const capacidadeRealAtendimentos = capacidadeMaxima * atendimentosPorHora;

    // CMV médio por atendimento
    const cmvMedioAtendimento = appState.materiais.reduce((sum, m) => 
        sum + (m.custoUnitario * m.quantidadePorServico / 100), 0
    );

    // Gastos fixos totais
    const gastosFixosTotal = appState.gastosFixos.reduce((sum, g) => sum + g.valor, 0);
    const depreciacao = appState.equipamentos.reduce((sum, e) => 
        sum + (e.quantidade * e.valorUnitario / e.vidaUtilMeses), 0
    );
    const gastosFixosComDepreciacao = gastosFixosTotal + depreciacao;

    // CAPEX total
    const capexTotal = appState.equipamentos.reduce((sum, e) => 
        sum + (e.quantidade * e.valorUnitario), 0
    );

    // Capital de giro
    const gastosVariaveisMes = capacidadeRealAtendimentos * premissas.ocupacaoEstabilizada / 100 * cmvMedioAtendimento;
    const capitalGiro = (gastosFixosComDepreciacao + gastosVariaveisMes) * premissas.capitalGiro;
    const investimentoTotal = capexTotal + capitalGiro;

    // Ponto de equilíbrio
    const margemContribuicaoUnitaria = ticketMedio - cmvMedioAtendimento - (ticketMedio * premissas.impostos / 100);
    const pontoEquilibrioAtendimentos = gastosFixosComDepreciacao / margemContribuicaoUnitaria;
    const pontoEquilibrioReceita = pontoEquilibrioAtendimentos * ticketMedio;
    const pontoEquilibrioOcupacao = pontoEquilibrioAtendimentos / capacidadeRealAtendimentos * 100;

    // Projeções 12 meses
    const projecoes = [];
    let receitaAcumulada = 0;
    let lucroAcumulado = 0;

    for (let mes = 1; mes <= 12; mes++) {
        const ocupacao = Math.min(
            premissas.ocupacaoInicial + (premissas.ocupacaoEstabilizada - premissas.ocupacaoInicial) * (mes - 1) / 11,
            premissas.ocupacaoEstabilizada
        );

        const crescimentoAcumulado = Math.pow(1 + premissas.crescimentoMensal / 100, mes - 1);
        const atendimentosMes = capacidadeRealAtendimentos * ocupacao / 100;
        const receitaBruta = atendimentosMes * ticketMedio * crescimentoAcumulado;
        const custosVariaveis = atendimentosMes * cmvMedioAtendimento;
        const impostos = receitaBruta * premissas.impostos / 100;
        const receitaLiquida = receitaBruta - custosVariaveis - impostos;
        const lucroLiquido = receitaLiquida - gastosFixosComDepreciacao;

        receitaAcumulada += receitaBruta;
        lucroAcumulado += lucroLiquido;

        projecoes.push({
            mes,
            ocupacao,
            atendimentos: atendimentosMes,
            receitaBruta,
            custosVariaveis,
            impostos,
            receitaLiquida,
            gastosFixos: gastosFixosComDepreciacao,
            lucroLiquido
        });
    }

    // Indicadores financeiros
    const roi = lucroAcumulado / investimentoTotal * 100;
    const paybackMeses = investimentoTotal / (lucroAcumulado / 12);
    const margemLiquida = lucroAcumulado / receitaAcumulada * 100;

    // VPL simplificado (TMA 1.2% a.m.)
    const tma = 0.012;
    let vpv = -investimentoTotal;
    projecoes.forEach((proj, index) => {
        vpv += proj.lucroLiquido / Math.pow(1 + tma, index + 1);
    });

    // TIR aproximada
    let tir = 0;
    if (lucroAcumulado > 0) {
        tir = Math.pow(lucroAcumulado / investimentoTotal + 1, 1/12) - 1;
    }

    return {
        capacidadeRealAtendimentos,
        ticketMedio,
        cmvMedioAtendimento,
        gastosFixosComDepreciacao,
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
        tir: tir * 100
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
    updateElement('dashboardVPL', `R$ ${calculos.vpv.toLocaleString('pt-BR', {minimumFractionDigits: 0})}`);
    updateElement('dashboardTIR', `${calculos.tir.toFixed(1)}%`);

    // Ponto de equilíbrio
    updateElement('breakevenAtendimentos', Math.round(calculos.pontoEquilibrioAtendimentos));
    updateElement('breakevenReceita', `R$ ${calculos.pontoEquilibrioReceita.toLocaleString('pt-BR', {minimumFractionDigits: 0})}`);
    updateElement('breakevenOcupacao', `${calculos.pontoEquilibrioOcupacao.toFixed(1)}%`);
}

function updateAnalysis(calculos) {
    // Indicadores detalhados
    updateElement('investimentoTotal', `R$ ${calculos.investimentoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 0})}`);
    updateElement('receitaAnual', `R$ ${calculos.receitaAcumulada.toLocaleString('pt-BR', {minimumFractionDigits: 0})}`);
    updateElement('lucroAnual', `R$ ${calculos.lucroAcumulado.toLocaleString('pt-BR', {minimumFractionDigits: 0})}`);
    updateElement('roiDetalhado', `${calculos.roi.toFixed(1)}%`);
    updateElement('paybackDetalhado', `${calculos.paybackMeses.toFixed(1)} meses`);
    updateElement('vplDetalhado', `R$ ${calculos.vpv.toLocaleString('pt-BR', {minimumFractionDigits: 0})}`);

    // Recomendação final
    const recommendation = document.getElementById('recommendationCard');
    const status = document.getElementById('recommendationStatus');
    const text = document.getElementById('recommendationText');

    if (recommendation && status && text) {
        if (calculos.roi > 20 && calculos.vpv > 0) {
            recommendation.className = 'recommendation viable';
            status.textContent = '✅ PROJETO VIÁVEL';
            text.textContent = 'O negócio apresenta excelentes indicadores financeiros. ROI superior a 20% e VPL positivo indicam alta viabilidade econômica.';
        } else if (calculos.roi > 10 && calculos.vpv > -50000) {
            recommendation.className = 'recommendation caution';
            status.textContent = '⚠️ ANALISAR COM CUIDADO';
            text.textContent = 'O projeto apresenta viabilidade marginal. Recomenda-se otimizar custos ou aumentar receitas antes de investir.';
        } else {
            recommendation.className = 'recommendation not-viable';
            status.textContent = '❌ PROJETO NÃO RECOMENDADO';
            text.textContent = 'Os indicadores financeiros não justificam o investimento. Considere revisar o modelo de negócio.';
        }
    }

    // DRE simplificada
    const dreBody = document.getElementById('dreTableBody');
    if (dreBody && calculos.projecoes) {
        dreBody.innerHTML = '';
        calculos.projecoes.forEach(proj => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${proj.mes}</td>
                <td>R$ ${proj.receitaBruta.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</td>
                <td>R$ ${proj.custosVariaveis.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</td>
                <td>R$ ${proj.receitaLiquida.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</td>
                <td>R$ ${proj.gastosFixos.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</td>
                <td style="color: ${proj.lucroLiquido >= 0 ? 'green' : 'red'}">R$ ${proj.lucroLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</td>
            `;
            dreBody.appendChild(row);
        });
    }
}

function updateScenarioResults() {
    const ocupacao = parseFloat(document.getElementById('ocupacaoSlider')?.value || 75);
    const ticket = parseFloat(document.getElementById('ticketSlider')?.value || 112);

    const calculos = performCalculations();
    const atendimentosMes = calculos.capacidadeRealAtendimentos * ocupacao / 100;
    const receitaMensal = atendimentosMes * ticket;
    const custoVariavel = atendimentosMes * calculos.cmvMedioAtendimento;
    const impostos = receitaMensal * appState.premissas.impostos / 100;
    const lucroMensal = receitaMensal - custoVariavel - impostos - calculos.gastosFixosComDepreciacao;
    const margem = lucroMensal / receitaMensal * 100;

    updateElement('receitaCenario', `R$ ${receitaMensal.toLocaleString('pt-BR', {minimumFractionDigits: 0})}`);
    updateElement('lucroCenario', `R$ ${lucroMensal.toLocaleString('pt-BR', {minimumFractionDigits: 0})}`);
    updateElement('margemCenario', `${margem.toFixed(1)}%`);
}

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
            labels: calculos.projecoes.map(p => `Mês ${p.mes}`),
            datasets: [{
                label: 'Receita Bruta',
                data: calculos.projecoes.map(p => p.receitaBruta),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4
            }, {
                label: 'Custos Totais',
                data: calculos.projecoes.map(p => p.custosVariaveis + p.gastosFixos),
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                tension: 0.4
            }, {
                label: 'Lucro Líquido',
                data: calculos.projecoes.map(p => p.lucroLiquido),
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
                            return context.dataset.label + ': R$ ' + context.raw.toLocaleString('pt-BR');
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

    // Dados dos cenários
    const cenarios = [
        { nome: 'Pessimista', ocupacao: 50, ticket: 95 },
        { nome: 'Realista', ocupacao: 75, ticket: 112 },
        { nome: 'Otimista', ocupacao: 90, ticket: 135 }
    ];

    const calculos = performCalculations();
    const dadosCenarios = cenarios.map(cenario => {
        const atendimentos = calculos.capacidadeRealAtendimentos * cenario.ocupacao / 100;
        const receita = atendimentos * cenario.ticket;
        const custos = atendimentos * calculos.cmvMedioAtendimento + calculos.gastosFixosComDepreciacao;
        const lucro = receita - custos;

        return {
            nome: cenario.nome,
            receita,
            lucro
        };
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
                            return context.dataset.label + ': R$ ' + context.raw.toLocaleString('pt-BR');
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

// Salvar e carregar dados (localStorage)
function saveData() {
    localStorage.setItem('viabilidadeAnalyzer', JSON.stringify(appState));
}

function loadData() {
    const saved = localStorage.getItem('viabilidadeAnalyzer');
    if (saved) {
        appState = {...appState, ...JSON.parse(saved)};
        loadInitialData();
        calculateAndUpdate();
    }
}

// Auto-save a cada mudança
setInterval(saveData, 10000); // Salva a cada 10 segundos

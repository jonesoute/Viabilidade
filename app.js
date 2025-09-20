// Sistema de Análise de Viabilidade Econômica
// Versão 1.0 – atualizado com melhorias

// Estado inicial
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
        {id:1, nome:"Limpeza de pele profunda", categoria:"Facial", preco:129, duracao:60, mix:12},
        {id:2, nome:"Peeling de cristal/diamante", categoria:"Facial", preco:169, duracao:40, mix:8},
        {id:3, nome:"Hidratação facial", categoria:"Facial", preco:99, duracao:50, mix:15},
        {id:4, nome:"Drenagem linfática", categoria:"Corporal", preco:119, duracao:60, mix:15},
        {id:5, nome:"Massagem modeladora", categoria:"Corporal", preco:139, duracao:60, mix:12},
        {id:6, nome:"Depilação pernas", categoria:"Depilação", preco:69, duracao:60, mix:8}
    ],
    materiais: [
        {id:1,nome:"Sabonete glicólico",custoUnitario:0.8,quantidadePorServico:5},
        {id:2,nome:"Loção tônica",custoUnitario:1.2,quantidadePorServico:5},
        {id:3,nome:"Cera para depilação",custoUnitario:0.15,quantidadePorServico:100}
    ],
    equipamentos: [
        {id:1,nome:"Maca profissional",quantidade:2,valorUnitario:3500,vidaUtilMeses:60},
        {id:2,nome:"Vapor de ozônio",quantidade:1,valorUnitario:8000,vidaUtilMeses:60},
        {id:3,nome:"Autoclave",quantidade:1,valorUnitario:3500,vidaUtilMeses:60}
    ],
    gastosFixos:[
        {id:1,nome:"Aluguel",valor:3500},
        {id:2,nome:"Salários + Encargos",valor:8500},
        {id:3,nome:"Energia elétrica",valor:1400},
        {id:4,nome:"Água",valor:350},
        {id:5,nome:"Internet",valor:150}
    ],
    custosVariaveis:[]
};
let nextId = {servicos:7,materiais:4,equipamentos:4,gastosFixos:6,custosVariaveis:1};
let charts = {};

// Inicialização ao carregar o DOM
document.addEventListener('DOMContentLoaded',()=>{
    initializeApp();
    setupEventListeners();
    loadInitialData();
    calculateAndUpdate();
});

// Navegação por abas e impressão
function initializeApp(){
    document.querySelectorAll('.nav-tab').forEach(tab=>{
        tab.onclick=()=>{
            document.querySelectorAll('.nav-tab,.tab-content').forEach(e=>e.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
            if(tab.dataset.tab==='dashboard') setTimeout(createCharts,100);
        };
    });
}

// Eventos em formulários e sliders
function setupEventListeners(){
    ['diasUteis','horasPorDia','numeroSalas','ocupacaoInicial','ocupacaoEstabilizada','crescimentoMensal','impostos','inadimplencia','capitalGiro']
    .forEach(id=>{
        const el=document.getElementById(id);
        if(el)el.oninput=e=>{appState.premissas[id]=parseFloat(e.target.value)||0;calculateAndUpdate();};
    });
    const occ= document.getElementById('ocupacaoSlider');
    const tkt= document.getElementById('ticketSlider');
    if(occ)occ.oninput=e=>{document.getElementById('ocupacaoValue').textContent=e.target.value;updateScenarioResults();};
    if(tkt)tkt.oninput=e=>{document.getElementById('ticketValue').textContent=e.target.value;updateScenarioResults();};
}

// Carregar dados iniciais em inputs e tabelas
function loadInitialData(){
    Object.keys(appState.premissas).forEach(key=>{
        const el=document.getElementById(key); if(el)el.value=appState.premissas[key];
    });
    renderServicosTable();
    renderMateriaisTable();
    renderEquipamentosTable();
    renderGastosFixosTable();
    renderCustosVariaveisTable();
}

// RENDERIZAÇÕES E CONTROLES DINÂMICOS...
// (Mesmos métodos de adicionar, editar, remover para servicos, materiais, equipamentos, gastosFixos)
// NOVO: Métodos para custosVariaveis

function renderCustosVariaveisTable(){
    const tbody=document.getElementById('custosVariaveisTableBody');
    tbody.innerHTML='';
    appState.custosVariaveis.forEach(c=>{
        const row=document.createElement('tr');
        row.innerHTML=`
            <td><input type="text" value="${c.nome}" onchange="updateCustoVariavel(${c.id},'nome',this.value)"></td>
            <td><input type="number" value="${c.custoUnitario}" step="0.01" onchange="updateCustoVariavel(${c.id},'custoUnitario',parseFloat(this.value))"></td>
            <td><input type="number" value="${c.quantidadePorServico}" step="0.1" onchange="updateCustoVariavel(${c.id},'quantidadePorServico',parseFloat(this.value))"></td>
            <td><button class="btn btn-danger btn-sm" onclick="removeCustoVariavel(${c.id})">Remover</button></td>`;
        tbody.appendChild(row);
    });
}

function adicionarCustoVariavel(){
    appState.custosVariaveis.push({
        id:nextId.custosVariaveis++,nome:`CustoVar${nextId.custosVariaveis}`,custoUnitario:1,quantidadePorServico:1
    });
    renderCustosVariaveisTable();calculateAndUpdate();
}

function updateCustoVariavel(id,field,value){
    const c=appState.custosVariaveis.find(x=>x.id===id);
    if(c){c[field]=value;calculateAndUpdate();}
}

function removeCustoVariavel(id){
    appState.custosVariaveis=appState.custosVariaveis.filter(x=>x.id!==id);
    renderCustosVariaveisTable();calculateAndUpdate();
}

// FORMATAR MOEDA em inputs de preço
function formatPrecoInput(input,servico){
    input.value=servico.preco.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    input.onfocus=()=>input.value=servico.preco;
}

function renderServicosTable(){
    const tbody=document.getElementById('servicosTableBody');
    tbody.innerHTML='';
    appState.servicos.forEach(s=>{
        const row=document.createElement('tr');
        row.innerHTML=`
            <td><input type="text" value="${s.nome}" onchange="updateServico(${s.id},'nome',this.value)"></td>
            <td><input list="categorias" value="${s.categoria}" onchange="updateServico(${s.id},'categoria',this.value)"></td>
            <td style="text-align:center"><input type="text" id="preco${s.id}"></td>
            <td style="text-align:center"><input type="number" value="${s.duracao}" min="5" step="5" onchange="updateServico(${s.id},'duracao',parseInt(this.value))"></td>
            <td style="text-align:center"><input type="number" value="${s.mix}" min="0" max="100" step="1" onchange="updateServico(${s.id},'mix',parseInt(this.value))"></td>
            <td><button class="btn btn-danger btn-sm" onclick="removeServico(${s.id})">Remover</button></td>`;
        tbody.appendChild(row);
        const inp=document.getElementById(`preco${s.id}`);
        inp.onchange=e=>{
            const num=Number(e.target.value.replace(/[^0-9,.]/g,'').replace(',','.'))||0;
            updateServico(s.id,'preco',num);
        };
        formatPrecoInput(inp,s);
    });
    const catList=document.createElement('datalist');
    catList.id='categorias';
    ['Facial','Corporal','Depilação','Estética'].forEach(c=>{
        const opt=document.createElement('option');opt.value=c;catList.appendChild(opt);
    });
    document.body.appendChild(catList);
}

// ... Mesmos demais métodos (renderMateriaisTable, renderEquipamentosTable, renderGastosFixosTable)

// CÁLCULOS E ATUALIZAÇÃO GERAL
function calculateAndUpdate(){
    const calc=performCalculations();
    updateDashboard(calc);
    updateAnalysis(calc);
    updateScenarioResults();
    createCharts();
}

// (Mantém performCalculations, updateDashboard, updateAnalysis, createCharts...)


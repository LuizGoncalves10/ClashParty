// 1. Puxa as configurações e protege contra valores vazios
let configs = JSON.parse(localStorage.getItem('draftRoyaleConfig')) || { casas: 10 };
let tipos = configs.tiposPergunta || ['individual_avanco', 'individual_recuo', 'coletiva'];

let hasAvancoInd = tipos.includes('individual_avanco');
let hasRecuoInd = tipos.includes('individual_recuo');
let hasColetiva = tipos.includes('coletiva');

// Verifica o progresso máximo no tabuleiro para a regra dos 30%
let posicoes = JSON.parse(localStorage.getItem('draftRoyalePosicoes')) || {};
let casasTotal = configs.casas || 10;
let progressoMaximo = 0;
for (let jog in posicoes) {
    if (posicoes[jog] > progressoMaximo) {
        progressoMaximo = posicoes[jog];
    }
}
let atingiu30PorCento = (progressoMaximo / casasTotal) >= 0.3;

let fatias = [];
let contextoModo = ''; 

// 2. DISTRIBUIÇÃO DAS 10 FATIAS (Proporções exatas)
if (hasAvancoInd && hasRecuoInd && hasColetiva) {
    fatias = ['A','A','A','A', 'R','R', 'C','C','C','C']; 
    contextoModo = 'todos';
} else if (hasAvancoInd && hasColetiva && !hasRecuoInd) {
    fatias = ['A','A','A','A','A','A', 'C','C','C','C']; 
    contextoModo = 'avanco_coletivo';
} else if (hasRecuoInd && hasColetiva && !hasAvancoInd) {
    fatias = ['R','R', 'C','C','C','C','C','C','C','C']; 
    contextoModo = 'recuo_coletivo';
} else if (hasAvancoInd && hasRecuoInd && !hasColetiva) {
    fatias = ['A','A','A','A','A','A','A','A', 'R','R']; 
    contextoModo = 'somente_individuais';
} else {
    fatias = ['A','A','A','A', 'R','R', 'C','C','C','C']; 
    contextoModo = 'todos';
}

// APLICA A REGRA DOS 30%: Se ninguém chegou em 30% das casas, converte todos os Recuos (R) para Avanços (A)
if (!atingiu30PorCento) {
    fatias = fatias.map(fatia => fatia === 'R' ? 'A' : fatia);
}

// 3. EMBARALHA ALEATORIAMENTE AS FATIAS
fatias = fatias.sort(() => Math.random() - 0.5);

let rotacaoAtual = 0;
let girando = false;

// 4. DESENHA A ROLETA ASSIM QUE A PÁGINA CARREGAR
document.addEventListener("DOMContentLoaded", () => {
    const roda = document.getElementById('roda');
    let gradientString = 'from -18deg, '; 
    let corAtual = '';

    fatias.forEach((tipo, index) => {
        if (tipo === 'A') corAtual = '#4CAF50'; // Verde
        if (tipo === 'R') corAtual = '#F44336'; // Vermelho
        if (tipo === 'C') corAtual = '#2196F3'; // Azul
        
        let inicio = index * 36;
        let fim = (index + 1) * 36;
        gradientString += `${corAtual} ${inicio}deg ${fim}deg${index < 9 ? ', ' : ''}`;
    });

    roda.style.background = `conic-gradient(${gradientString})`;
});

// 5. LÓGICA DE GIRO
function girarRoleta() {
    if (girando) return;
    girando = true;
    
    const btn = document.getElementById('btn-girar');
    const roda = document.getElementById('roda');
    btn.disabled = true;
    btn.innerText = "GIRANDO...";

    // Sorteia a fatia vencedora (0 a 9)
    const fatiaVencedoraIndex = Math.floor(Math.random() * 10);
    const tipoVencedor = fatias[fatiaVencedoraIndex];

    const voltasExtras = 360 * 5;
    const rotacaoParaFatia = 360 - (fatiaVencedoraIndex * 36);
    const novaRotacao = rotacaoAtual + voltasExtras + rotacaoParaFatia;

    roda.style.transform = `rotate(${novaRotacao}deg)`;
    rotacaoAtual = novaRotacao - (novaRotacao % 360); 

    // Espera os 5 segundos da animação para revelar o resultado
    setTimeout(() => {
        revelarResultado(tipoVencedor);
    }, 5000);
}

// 6. EXIBE O RESULTADO NA CAIXA
function revelarResultado(tipo) {
    const caixa = document.getElementById('caixa-resultado');
    const txtPergunta = document.getElementById('texto-pergunta');
    const txtEfeito = document.getElementById('texto-efeito');
    const btn = document.getElementById('btn-girar');

    let perguntaSorteada = "";
    let classeCor = "";
    let efeitoTexto = "";

    // Remove a classe vazia (cinza) para a transição acontecer
    caixa.className = 'resultado-box'; 

    if (tipo === 'A') {
        perguntaSorteada = perguntasIndividuais[Math.floor(Math.random() * perguntasIndividuais.length)].texto;
        classeCor = 'efeito-avanco';
        efeitoTexto = "+ AVANÇO INDIVIDUAL +";
    } 
    else if (tipo === 'R') {
        perguntaSorteada = perguntasIndividuais[Math.floor(Math.random() * perguntasIndividuais.length)].texto;
        classeCor = 'efeito-recuo';
        efeitoTexto = "- RECUO INDIVIDUAL -";
    } 
    else if (tipo === 'C') {
        let chanceRoll = Math.random() * 100;
        let seraAvanco = true;

        // REGRA DOS 30% NOS COLETIVOS: Força avanço coletivo se ninguém andou 30% ainda
        if (!atingiu30PorCento) {
            seraAvanco = true;
        } else {
            if (contextoModo === 'todos' || contextoModo === 'avanco_coletivo') {
                seraAvanco = chanceRoll <= 62.5; 
            } else if (contextoModo === 'recuo_coletivo') {
                seraAvanco = chanceRoll <= 81.25; 
            }
        }

        perguntaSorteada = perguntasColetivas[Math.floor(Math.random() * perguntasColetivas.length)].texto;
        
        if (seraAvanco) {
            classeCor = 'efeito-avanco';
            efeitoTexto = "+ AVANÇO COLETIVO +";
        } else {
            classeCor = 'efeito-recuo';
            efeitoTexto = "- RECUO COLETIVO -";
        }
    }

    caixa.classList.add(classeCor);
    txtPergunta.innerText = perguntaSorteada;
    txtEfeito.innerText = efeitoTexto;

    btn.disabled = false;
    btn.innerText = "VER RESULTADO";
    btn.onclick = () => {
        window.location.href = "tabuleiro.html"; 
    };
}
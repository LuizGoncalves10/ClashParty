const configs = {
    jogadores: 4,
    casas: 10,
    modo: 'aleatorio',
    tipoRodada: 'unica',
    regras: {
        avanco: true,
        recuo: true,
        grupo: true
    }
};

const LIMITES = {
    jogadores: { min: 2, max: 10 },
    casas: { min: 3, max: 15 }
};

const CHAVES_JOGO = [
    'draftRoyalePosicoes',
    'draftRoyaleCartasEscolhidas',
    'draftRoyaleFase',
    'draftRoyaleRodada',
    'draftRoyaleUltimoResultado',
    'draftRoyalePendente',
    'draftRoyaleVez'
];

const MENSAGEM_NOME_VAZIO = "⚠️ Todos os guerreiros precisam ter um nome válido para entrar na arena!";
const MENSAGEM_NOME_REPETIDO = "⚠️ Cada guerreiro precisa ter um nome diferente dos outros!";

document.addEventListener("DOMContentLoaded", () => {
    atualizarBotoesLimites();
});

function calcularTiposPergunta() {
    const tipos = [];
    if (configs.regras.avanco) tipos.push('individual_avanco');
    if (configs.regras.recuo) tipos.push('individual_recuo');
    if (configs.regras.grupo) tipos.push('coletiva');
    return tipos;
}

function salvarConfig() {
    configs.tiposPergunta = calcularTiposPergunta();
    localStorage.setItem('draftRoyaleConfig', JSON.stringify(configs));
}

function alterarValor(tipo, variacao) {
    let novoValor = configs[tipo] + variacao;
    if (novoValor >= LIMITES[tipo].min && novoValor <= LIMITES[tipo].max) {
        configs[tipo] = novoValor;
        document.getElementById(`valor-${tipo}`).innerText = configs[tipo];
        atualizarBotoesLimites();
    }
}

function atualizarBotoesLimites() {
    const btnMenosJog = document.querySelector('.config-box:nth-child(1) .btn-counter:nth-child(1)');
    const btnMaisJog = document.querySelector('.config-box:nth-child(1) .btn-counter:nth-child(3)');
    btnMenosJog.disabled = configs.jogadores <= LIMITES.jogadores.min;
    btnMaisJog.disabled = configs.jogadores >= LIMITES.jogadores.max;

    const btnMenosCasas = document.querySelector('.config-box:nth-child(2) .btn-counter:nth-child(1)');
    const btnMaisCasas = document.querySelector('.config-box:nth-child(2) .btn-counter:nth-child(3)');
    btnMenosCasas.disabled = configs.casas <= LIMITES.casas.min;
    btnMaisCasas.disabled = configs.casas >= LIMITES.casas.max;
}

function selecionarModo(modo) {
    configs.modo = modo;
    document.getElementById('modo-aleatorio').classList.remove('selected');
    document.getElementById('modo-escolha').classList.remove('selected');
    document.getElementById(`modo-${modo}`).classList.add('selected');
}

function selecionarTipoRodada(tipo) {
    configs.tipoRodada = tipo;
    document.getElementById('rodada-unica').classList.remove('selected');
    document.getElementById('rodada-porrodada').classList.remove('selected');
    document.getElementById(tipo === 'unica' ? 'rodada-unica' : 'rodada-porrodada').classList.add('selected');
}

function alternarRegra(regra) {
    if (regra === 'avanco' && configs.regras.avanco && !configs.regras.grupo) return;
    if (regra === 'grupo' && configs.regras.grupo && !configs.regras.avanco) return;

    configs.regras[regra] = !configs.regras[regra];
    const elemento = document.getElementById(`regra-${regra}`);
    if (configs.regras[regra]) {
        elemento.classList.add('active');
    } else {
        elemento.classList.remove('active');
    }
}

function irParaTelaJogadores() {
    salvarConfig();

    const listaDiv = document.getElementById('lista-jogadores');
    listaDiv.innerHTML = "";
    document.getElementById('mensagem-erro').style.display = 'none';

    for (let i = 1; i <= configs.jogadores; i++) {
        listaDiv.innerHTML += `
            <div class="player-input-card">
                <div class="player-number">${i}</div>
                <input type="text" id="jogador-${i}" value="Jogador ${i}" maxlength="12" placeholder="Nome do Jogador" oninput="limparErroInput(this)">
            </div>
        `;
    }

    document.getElementById('tela-config').classList.remove('active');
    document.getElementById('tela-jogadores').classList.add('active');
}

function voltarParaConfig() {
    document.getElementById('tela-jogadores').classList.remove('active');
    document.getElementById('tela-config').classList.add('active');
}

function limparErroInput(input) {
    input.classList.remove('input-error');
    let aindaTemErro = false;
    for (let i = 1; i <= configs.jogadores; i++) {
        if (document.getElementById(`jogador-${i}`).classList.contains('input-error')) {
            aindaTemErro = true;
            break;
        }
    }
    if (!aindaTemErro) {
        document.getElementById('mensagem-erro').style.display = 'none';
    }
}

function iniciarJogoFinal() {
    const nomesJogadores = [];
    const mensagemErro = document.getElementById('mensagem-erro');
    let temCampoVazio = false;

    for (let i = 1; i <= configs.jogadores; i++) {
        const inputField = document.getElementById(`jogador-${i}`);
        const inputVal = inputField.value.trim();
        inputField.classList.remove('input-error');

        if (inputVal === "") {
            inputField.classList.add('input-error');
            temCampoVazio = true;
        }
        nomesJogadores.push(inputVal);
    }

    if (temCampoVazio) {
        mensagemErro.textContent = MENSAGEM_NOME_VAZIO;
        mensagemErro.style.display = 'block';
        return;
    }

    let temRepetido = false;
    nomesJogadores.forEach((nome, indice) => {
        const quantidade = nomesJogadores.filter(outro => outro.toLowerCase() === nome.toLowerCase()).length;
        if (quantidade > 1) {
            document.getElementById(`jogador-${indice + 1}`).classList.add('input-error');
            temRepetido = true;
        }
    });

    if (temRepetido) {
        mensagemErro.textContent = MENSAGEM_NOME_REPETIDO;
        mensagemErro.style.display = 'block';
        return;
    }

    salvarConfig();
    CHAVES_JOGO.forEach(chave => localStorage.removeItem(chave));
    localStorage.setItem('draftRoyaleNomes', JSON.stringify(nomesJogadores));

    const posicoesIniciais = {};
    nomesJogadores.forEach(nome => {
        posicoesIniciais[nome] = 0;
    });
    localStorage.setItem('draftRoyalePosicoes', JSON.stringify(posicoesIniciais));
    localStorage.setItem('draftRoyaleVez', String(Math.floor(Math.random() * nomesJogadores.length)));
    localStorage.setItem('draftRoyaleRodada', '1');
    localStorage.setItem('draftRoyaleFase', 'draft');

    window.location.href = "tabuleiro.html";
}
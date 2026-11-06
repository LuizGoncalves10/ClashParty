const configs = {
    jogadores: 4,
    casas: 10,
    modo: 'aleatorio',
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

document.addEventListener("DOMContentLoaded", () => {
    atualizarBotoesLimites();
});

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
    localStorage.setItem('draftRoyaleConfig', JSON.stringify(configs));

    const listaDiv = document.getElementById('lista-jogadores');
    listaDiv.innerHTML = "";

    // Esconde qualquer erro anterior ao entrar na tela
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
    // Se todos os campos estiverem preenchidos, esconde a caixa de aviso
    let temVazio = false;
    for (let i = 1; i <= configs.jogadores; i++) {
        if (document.getElementById(`jogador-${i}`).value.trim() === "") {
            temVazio = true;
            break;
        }
    }
    if (!temVazio) {
        document.getElementById('mensagem-erro').style.display = 'none';
    }
}

// Inicia o jogo travando se houver campos vazios
function iniciarJogoFinal() {
    let nomesJogadores = [];
    let temCampoVazio = false;
    
    for (let i = 1; i <= configs.jogadores; i++) {
        let inputField = document.getElementById(`jogador-${i}`);
        let inputVal = inputField.value.trim();
        
        if (inputVal === "") {
            inputField.classList.add('input-error');
            temCampoVazio = true;
        } else {
            inputField.classList.remove('input-error');
            nomesJogadores.push(inputVal);
        }
    }

    if (temCampoVazio) {
        // Exibe a mensagem de erro direto na tela com o estilo do jogo
        document.getElementById('mensagem-erro').style.display = 'block';
        return; // Interrompe e não deixa avançar
    }

    // Salva os nomes validados e prossegue
    localStorage.setItem('draftRoyaleNomes', JSON.stringify(nomesJogadores));
    alert("Tudo pronto! Guerreiros definidos: " + nomesJogadores.join(', ') + ".");
}
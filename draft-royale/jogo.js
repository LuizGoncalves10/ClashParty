const CHAVES_JOGO = [
    'draftRoyalePosicoes',
    'draftRoyaleCartasEscolhidas',
    'draftRoyaleFase',
    'draftRoyaleRodada',
    'draftRoyaleUltimoResultado',
    'draftRoyalePrimeiroJogador'
];

function lerJSON(chave, padrao) {
    try {
        const bruto = localStorage.getItem(chave);
        if (bruto === null) return padrao;
        const valor = JSON.parse(bruto);
        return valor === null ? padrao : valor;
    } catch (erro) {
        return padrao;
    }
}

let configs = lerJSON('draftRoyaleConfig', { jogadores: 4, casas: 10, modo: 'aleatorio' });
let nomesJogadores = lerJSON('draftRoyaleNomes', ["Jogador 1", "Jogador 2", "Jogador 3", "Jogador 4"]);
if (!Array.isArray(nomesJogadores) || nomesJogadores.length === 0) {
    nomesJogadores = ["Jogador 1", "Jogador 2", "Jogador 3", "Jogador 4"];
}
configs.casas = Number(configs.casas) || 10;

let todasAsTropas = [];
let indiceJogadorAtual = 0;
let primeiroJogadorRodada = 0;
let cartaSelecionadaId = null;
let escolhasDaRodada = {};
let posicoes = {};
let rodadaAtual = 1;

const pesoRaridade = {
    "common": 1,
    "rare": 2,
    "epic": 3,
    "legendary": 4,
    "champion": 5
};

document.addEventListener("DOMContentLoaded", async () => {
    await carregarEClassificarTropas();

    posicoes = carregarPosicoes();
    rodadaAtual = parseInt(localStorage.getItem('draftRoyaleRodada'), 10) || 1;

    const fase = localStorage.getItem('draftRoyaleFase') || 'draft';
    const cartasSalvas = lerJSON('draftRoyaleCartasEscolhidas', null);

    if ((fase === 'tabuleiro' || fase === 'resultado') && cartasSalvasValidas(cartasSalvas)) {
        escolhasDaRodada = cartasSalvas;
        primeiroJogadorRodada = parseInt(localStorage.getItem('draftRoyalePrimeiroJogador'), 10) || 0;
        mostrarTabuleiro(fase);
    } else {
        localStorage.setItem('draftRoyaleFase', 'draft');
        sortearPrimeiroJogador();
        renderizarInterfaceTurno();
    }
});

function cartasSalvasValidas(cartas) {
    if (!cartas || typeof cartas !== 'object') return false;
    return nomesJogadores.every(nome => typeof cartas[nome] === 'string' && cartas[nome] !== "");
}

function carregarPosicoes() {
    const salvas = lerJSON('draftRoyalePosicoes', {});
    const resultado = {};
    nomesJogadores.forEach(nome => {
        const valor = Number(salvas[nome]);
        resultado[nome] = Number.isFinite(valor) ? Math.max(0, Math.min(configs.casas, Math.round(valor))) : 0;
    });
    return resultado;
}

function obterVencedores() {
    return nomesJogadores.filter(nome => posicoes[nome] >= configs.casas);
}

async function carregarEClassificarTropas() {
    try {
        let resposta = await fetch('../../todas_as_cartas.json');
        if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
        let dadosBrutos = await resposta.json();

        todasAsTropas = dadosBrutos.filter(carta => carta.type && carta.type.toLowerCase() === 'troop');

        todasAsTropas.sort((a, b) => {
            let rarityA = a.rarity ? a.rarity.toLowerCase() : "";
            let rarityB = b.rarity ? b.rarity.toLowerCase() : "";
            let pesoA = pesoRaridade[rarityA] || 99;
            let pesoB = pesoRaridade[rarityB] || 99;
            if (pesoA !== pesoB) return pesoA - pesoB;

            let elixirA = a.elixir !== undefined ? a.elixir : 0;
            let elixirB = b.elixir !== undefined ? b.elixir : 0;
            if (elixirA !== elixirB) return elixirA - elixirB;

            let nomeA = a.name_pt || a.name || "";
            let nomeB = b.name_pt || b.name || "";
            return nomeA.localeCompare(nomeB);
        });
    } catch (erro) {
        alert("Erro ao carregar as tropas do jogo.");
    }
}

function sortearPrimeiroJogador() {
    indiceJogadorAtual = Math.floor(Math.random() * nomesJogadores.length);
    primeiroJogadorRodada = indiceJogadorAtual;
}

function renderizarInterfaceTurno() {
    let jogadorNome = nomesJogadores[indiceJogadorAtual];
    document.getElementById('titulo-vez').innerText = `Vez de: ${jogadorNome}`;
    document.getElementById('subtitulo-vez').innerText = `Rodada ${rodadaAtual} • Escolha sua tropa para a batalha!`;

    let btn = document.getElementById('btn-acao-draft');
    let btnVoltar = document.getElementById('btn-voltar-draft');
    let totalEscolhidos = Object.keys(escolhasDaRodada).length;

    if (rodadaAtual === 1 && indiceJogadorAtual === primeiroJogadorRodada && totalEscolhidos === 0) {
        btnVoltar.style.display = "block";
    } else {
        btnVoltar.style.display = "none";
    }

    if (totalEscolhidos === nomesJogadores.length - 1) {
        btn.innerText = "JOGAR!";
    } else {
        let proximoIndice = (indiceJogadorAtual + 1) % nomesJogadores.length;
        btn.innerText = `Passar para ${nomesJogadores[proximoIndice]}`;
    }

    btn.disabled = true;
    cartaSelecionadaId = null;
    renderizarGridCartas();
}

function renderizarGridCartas() {
    let grid = document.getElementById('grid-escolha-cartas');
    grid.innerHTML = "";

    if (todasAsTropas.length === 0) {
        grid.innerHTML = "<p style='color: white; text-align: center; width: 100%; font-family: sans-serif;'>A carregar tropas...</p>";
        return;
    }

    let cartasJaEscolhidas = Object.values(escolhasDaRodada);

    todasAsTropas.forEach(tropa => {
        let nomeExibicao = tropa.name_pt || tropa.name;
        let jaEscolhidaPorOutro = cartasJaEscolhidas.includes(nomeExibicao);
        let cardDiv = document.createElement('div');
        cardDiv.className = `tropa-card ${jaEscolhidaPorOutro ? 'escolhida-outros' : ''}`;

        if (!jaEscolhidaPorOutro) {
            cardDiv.onclick = () => selecionarCarta(nomeExibicao, cardDiv);
        }

        let imgUrl = `https://cdn.royaleapi.com/static/img/cards-150/${tropa.key}.png`;
        let elixir = tropa.elixir !== undefined ? tropa.elixir : '?';

        cardDiv.innerHTML = `
            <div class="elixir-badge">${elixir}</div>
            <img src="${imgUrl}" alt="${nomeExibicao}" onerror="this.src='https://cdn.royaleapi.com/static/img/ui/card-placeholder.png'">
            <span>${nomeExibicao}</span>
        `;
        grid.appendChild(cardDiv);
    });
}

function selecionarCarta(nomeTropa, elementoCard) {
    document.querySelectorAll('.tropa-card').forEach(c => c.classList.remove('selected'));
    elementoCard.classList.add('selected');
    cartaSelecionadaId = nomeTropa;
    document.getElementById('btn-acao-draft').disabled = false;
}

function confirmarEscolhaCarta() {
    if (!cartaSelecionadaId) return;
    let jogadorAtual = nomesJogadores[indiceJogadorAtual];
    escolhasDaRodada[jogadorAtual] = cartaSelecionadaId;
    indiceJogadorAtual = (indiceJogadorAtual + 1) % nomesJogadores.length;

    if (Object.keys(escolhasDaRodada).length === nomesJogadores.length) {
        iniciarFaseTabuleiro();
    } else {
        renderizarInterfaceTurno();
    }
}

function voltarParaNomes() {
    window.location.href = "index.html";
}

function iniciarFaseTabuleiro() {
    localStorage.setItem('draftRoyaleCartasEscolhidas', JSON.stringify(escolhasDaRodada));
    localStorage.setItem('draftRoyalePrimeiroJogador', String(primeiroJogadorRodada));
    localStorage.setItem('draftRoyaleFase', 'tabuleiro');
    localStorage.removeItem('draftRoyaleUltimoResultado');
    posicoes = carregarPosicoes();
    mostrarTabuleiro('tabuleiro');
}

function criarLinhaSubtitulo(texto, cor) {
    const linha = document.createElement('span');
    linha.style.display = 'block';
    linha.textContent = texto;
    if (cor) linha.style.color = cor;
    return linha;
}

function renderizarSubtitulo(fase, resultado) {
    const subtitulo = document.getElementById('subtitulo-jogo');
    subtitulo.textContent = "";

    if (fase === 'resultado') {
        if (!resultado) {
            subtitulo.appendChild(criarLinhaSubtitulo("Resultado da roleta aplicado!"));
            return;
        }
        const avanco = resultado.direcao === 'avanco';
        const afetados = Array.isArray(resultado.afetados) ? resultado.afetados : [];
        subtitulo.appendChild(criarLinhaSubtitulo(resultado.efeito || ""));
        subtitulo.appendChild(criarLinhaSubtitulo(resultado.pergunta || ""));
        if (afetados.length === 0) {
            subtitulo.appendChild(criarLinhaSubtitulo("Ninguém se encaixou nesta pergunta.", "#ffd54f"));
        } else {
            const rotulo = avanco ? "Avançam" : "Recuam";
            subtitulo.appendChild(criarLinhaSubtitulo(`${rotulo}: ${afetados.join(', ')}`, avanco ? "#8bff8b" : "#ff8a80"));
        }
        return;
    }

    if (configs.modo === 'escolha') {
        subtitulo.textContent = `Vez de: ${nomesJogadores[primeiroJogadorRodada] || nomesJogadores[0]}`;
    } else {
        subtitulo.textContent = "A sorte guiará a batalha!";
    }
}

function renderizarTabuleiro(resultado) {
    const tabuleiro = document.getElementById('tabuleiro-casas');
    tabuleiro.innerHTML = '';

    const afetados = resultado && Array.isArray(resultado.afetados) ? resultado.afetados : [];
    const corAfetados = resultado && resultado.direcao === 'avanco' ? '#8bff8b' : '#ff8a80';

    nomesJogadores.forEach(jogador => {
        const nomeCarta = escolhasDaRodada[jogador];
        const tropa = todasAsTropas.find(t => (t.name_pt || t.name) === nomeCarta);
        const imgUrl = tropa ? `https://cdn.royaleapi.com/static/img/cards-150/${tropa.key}.png` : '';
        const posicaoJogador = posicoes[jogador] || 0;

        const trilha = document.createElement('div');
        trilha.className = 'trilha-jogador';

        const spanNome = document.createElement('span');
        spanNome.className = 'nome-jogador-trilha';
        spanNome.innerText = jogador;
        spanNome.title = jogador;
        if (afetados.includes(jogador)) {
            spanNome.style.color = corAfetados;
        }
        trilha.appendChild(spanNome);

        for (let i = 0; i <= configs.casas; i++) {
            const casa = document.createElement('div');
            casa.className = 'casa-torre';

            if (i === posicaoJogador && imgUrl) {
                const img = document.createElement('img');
                img.src = imgUrl;
                img.className = 'tropa-tabuleiro';
                img.onerror = function() { this.src = 'https://cdn.royaleapi.com/static/img/ui/card-placeholder.png'; };
                casa.appendChild(img);
            } else if (i > 0) {
                if (i === configs.casas) {
                    const imgCoroa = document.createElement('img');
                    imgCoroa.src = '../imagens/coroa.png';
                    imgCoroa.className = 'img-coroa';
                    casa.appendChild(imgCoroa);
                } else {
                    const num = document.createElement('span');
                    num.className = 'numero-casa';
                    num.innerText = i;
                    casa.appendChild(num);
                }
            }
            trilha.appendChild(casa);
        }
        tabuleiro.appendChild(trilha);
    });
}

function configurarBotaoPrincipal(fase) {
    const btn = document.getElementById('btn-proximo-jogo');
    const vencedores = fase === 'resultado' ? obterVencedores() : [];

    if (fase === 'tabuleiro') {
        btn.innerText = "PRÓXIMO";
        btn.onclick = proximoTurno;
    } else if (vencedores.length > 0) {
        btn.innerText = "NOVO JOGO";
        btn.onclick = encerrarDeVez;
        mostrarModalVitoria(vencedores);
    } else {
        btn.innerText = "NOVA RODADA";
        btn.onclick = novaRodada;
    }
}

function mostrarModalVitoria(vencedores) {
    const titulo = document.getElementById('titulo-vitoria');
    const texto = document.getElementById('texto-vitoria');

    if (vencedores.length === 1) {
        titulo.innerText = "🏆 Vitória!";
        texto.innerText = `${vencedores[0]} chegou à coroa e venceu a Arena!`;
    } else {
        titulo.innerText = "🏆 Empate!";
        texto.innerText = `${vencedores.join(', ')} chegaram juntos à coroa!`;
    }
    document.getElementById('modal-vitoria').style.display = 'flex';
}

function fecharModalVitoria() {
    document.getElementById('modal-vitoria').style.display = 'none';
}

function mostrarTabuleiro(fase) {
    document.getElementById('tela-draft').style.display = 'none';
    document.getElementById('tela-jogo').style.display = 'flex';
    document.getElementById('titulo-jogo').innerText = `Arena de Batalha - Rodada ${rodadaAtual}`;

    const resultado = fase === 'resultado' ? lerJSON('draftRoyaleUltimoResultado', null) : null;

    renderizarSubtitulo(fase, resultado);
    renderizarTabuleiro(resultado);
    configurarBotaoPrincipal(fase);
}

function abrirModalEncerrar() {
    document.getElementById('modal-encerrar').style.display = 'flex';
}

function fecharModalEncerrar() {
    document.getElementById('modal-encerrar').style.display = 'none';
}

function encerrarDeVez() {
    CHAVES_JOGO.forEach(chave => localStorage.removeItem(chave));
    window.location.href = "index.html";
}

function proximoTurno() {
    localStorage.setItem('draftRoyaleCartasEscolhidas', JSON.stringify(escolhasDaRodada));
    localStorage.setItem('draftRoyaleFase', 'tabuleiro');
    window.location.href = "roleta.html";
}

function novaRodada() {
    rodadaAtual += 1;
    localStorage.setItem('draftRoyaleRodada', String(rodadaAtual));
    localStorage.setItem('draftRoyaleFase', 'draft');
    localStorage.removeItem('draftRoyaleCartasEscolhidas');
    localStorage.removeItem('draftRoyaleUltimoResultado');

    escolhasDaRodada = {};
    cartaSelecionadaId = null;

    document.getElementById('tela-jogo').style.display = 'none';
    document.getElementById('tela-draft').style.display = 'flex';

    sortearPrimeiroJogador();
    renderizarInterfaceTurno();
}
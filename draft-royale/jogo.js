let configs = JSON.parse(localStorage.getItem('draftRoyaleConfig')) || { jogadores: 4, casas: 10, modo: 'aleatorio' };
let nomesJogadores = JSON.parse(localStorage.getItem('draftRoyaleNomes')) || ["Jogador 1", "Jogador 2", "Jogador 3", "Jogador 4"];
let todasAsTropas = [];
let indiceJogadorAtual = 0;
let primeiroJogadorRodada = 0;
let cartaSelecionadaId = null;
let escolhasDaRodada = {};

const pesoRaridade = {
    "common": 1,
    "rare": 2,
    "epic": 3,
    "legendary": 4,
    "champion": 5
};

document.addEventListener("DOMContentLoaded", async () => {
    await carregarEClassificarTropas();
    sortearPrimeiroJogador();
    renderizarInterfaceTurno();
});

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
    
    let btn = document.getElementById('btn-acao-draft');
    let btnVoltar = document.getElementById('btn-voltar-draft');
    let totalEscolhidos = Object.keys(escolhasDaRodada).length;
    
    if (indiceJogadorAtual === primeiroJogadorRodada && totalEscolhidos === 0) {
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
    document.getElementById('tela-draft').style.display = 'none';
    document.getElementById('tela-jogo').style.display = 'flex';

    let subtitulo = document.getElementById('subtitulo-jogo');
    if (configs.modo === 'escolha') {
        subtitulo.innerText = `Vez de: ${nomesJogadores[primeiroJogadorRodada]}`;
    } else {
        subtitulo.innerText = "A sorte guiará a batalha!";
    }

    const tabuleiro = document.getElementById('tabuleiro-casas');
    tabuleiro.innerHTML = '';

    nomesJogadores.forEach(jogador => {
        const nomeCarta = escolhasDaRodada[jogador];
        const tropa = todasAsTropas.find(t => (t.name_pt || t.name) === nomeCarta);
        const imgUrl = tropa ? `https://cdn.royaleapi.com/static/img/cards-150/${tropa.key}.png` : '';

        const trilha = document.createElement('div');
        trilha.className = 'trilha-jogador';

        const spanNome = document.createElement('span');
        spanNome.className = 'nome-jogador-trilha';
        spanNome.innerText = jogador;
        trilha.appendChild(spanNome);

        for (let i = 0; i <= configs.casas; i++) {
            const casa = document.createElement('div');
            casa.className = 'casa-torre';

            if (i === 0 && imgUrl) {
                const img = document.createElement('img');
                img.src = imgUrl;
                img.className = 'tropa-tabuleiro';
                img.onerror = function() { this.src = 'https://cdn.royaleapi.com/static/img/ui/card-placeholder.png'; };
                casa.appendChild(img);
            }
            trilha.appendChild(casa);
        }
        tabuleiro.appendChild(trilha);
    });
}

function abrirModalEncerrar() {
    document.getElementById('modal-encerrar').style.display = 'flex';
}

function fecharModalEncerrar() {
    document.getElementById('modal-encerrar').style.display = 'none';
}

function encerrarDeVez() {
    window.location.href = "index.html";
}

function proximoTurno() {
    alert("Indo para a roleta...");
}
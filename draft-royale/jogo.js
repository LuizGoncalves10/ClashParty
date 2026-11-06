let configs = JSON.parse(localStorage.getItem('draftRoyaleConfig')) || { jogadores: 4, casas: 10 };
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
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }
        let dadosBrutos = await resposta.json();
        console.log("JSON carregado. Total de cartas:", dadosBrutos.length);

        // Filtra estritamente apenas cartas do tipo "Troop" (Tropas)
        todasAsTropas = dadosBrutos.filter(carta => carta.type && carta.type.toLowerCase() === 'troop');
        console.log("Tropas filtradas:", todasAsTropas.length);

        // Ordenação rigorosa: 1º Raridade, 2º Elixir, 3º Ordem Alfabética
        todasAsTropas.sort((a, b) => {
            let rarityA = a.rarity ? a.rarity.toLowerCase() : "";
            let rarityB = b.rarity ? b.rarity.toLowerCase() : "";

            let pesoA = pesoRaridade[rarityA] || 99;
            let pesoB = pesoRaridade[rarityB] || 99;
            if (pesoA !== pesoB) return pesoA - pesoB;

            let elixirA = a.elixir !== undefined ? a.elixir : 0;
            let elixirB = b.elixir !== undefined ? b.elixir : 0;
            if (elixirA !== elixirB) return elixirA - elixirB;

            return a.name.localeCompare(b.name);
        });

    } catch (erro) {
        console.error("Erro detalhado ao carregar cartas:", erro);
        alert("Erro ao carregar as tropas do jogo. Verifique o console (F12).");
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
        let jaEscolhidaPorOutro = cartasJaEscolhidas.includes(tropa.name);
        
        let cardDiv = document.createElement('div');
        cardDiv.className = `tropa-card ${jaEscolhidaPorOutro ? 'escolhida-outros' : ''}`;
        
        if (!jaEscolhidaPorOutro) {
            cardDiv.onclick = () => selecionarCarta(tropa.name, cardDiv);
        }

        let imgUrl = `https://cdn.royaleapi.com/static/img/cards-150/${tropa.key}.png`;
        let elixir = tropa.elixir !== undefined ? tropa.elixir : '?';

        cardDiv.innerHTML = `
            <div class="elixir-badge">${elixir}</div>
            <img src="${imgUrl}" alt="${tropa.name}" onerror="this.src='https://cdn.royaleapi.com/static/img/ui/card-placeholder.png'">
            <span>${tropa.name}</span>
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
        localStorage.setItem('draftRoyaleEscolhas', JSON.stringify(escolhasDaRodada));
        alert("Todas as tropas foram escolhidas com sucesso!");
    } else {
        renderizarInterfaceTurno();
    }
}

function voltarParaNomes() {
    window.location.href = "index.html";
}
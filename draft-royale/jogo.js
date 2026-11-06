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
        console.log("JSON carregado com sucesso. Total de cartas:", dadosBrutos.length);

        // Carrega todas as cartas do ficheiro para a selecção do draft
        todasAsTropas = dadosBrutos; 
        console.log("Tropas carregadas para o jogo:", todasAsTropas.length);

        todasAsTropas.sort((a, b) => {
            let pesoA = pesoRaridade[a.rarity] || 99;
            let pesoB = pesoRaridade[b.rarity] || 99;
            if (pesoA !== pesoB) return pesoA - pesoB;

            let elixirA = a.elixirCost !== undefined ? a.elixirCost : 0;
            let elixirB = b.elixirCost !== undefined ? b.elixirCost : 0;
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
        grid.innerHTML = "<p style='color: white; text-align: center; width: 100%; font-family: sans-serif;'>A carregar tropas ou ficheiro em falta...</p>";
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

        let imgUrl = tropa.iconUrls && tropa.iconUrls.medium ? tropa.iconUrls.medium : '';
        let elixir = tropa.elixirCost !== undefined ? tropa.elixirCost : '?';

        cardDiv.innerHTML = `
            <div class="elixir-badge">${elixir}</div>
            <img src="${imgUrl}" alt="${tropa.name}">
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
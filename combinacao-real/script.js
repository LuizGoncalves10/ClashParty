let todasAsCartasClash = [];
let todosOsBrawlers = [];

let universoAtual = 'clash';
let jogadores = { azul: '', vermelho: '' };
let pontuacao = { azul: 0, vermelho: 0 };

let turnoAtual = 'azul';
let cartasTabuleiro = [];
let cartasViradas = [];
let bloqueioTabuleiro = false;
let paresEncontrados = 0;

const TOTAL_PARES = 11;
const ESTRUTURA_FILEIRAS = [3, 4, 4, 4, 4, 3];

window.onload = async () => {
    try {
        const resClash = await fetch('../todas_as_cartas.json');
        const dataClash = await resClash.json();
        todasAsCartasClash = dataClash.items ? dataClash.items : dataClash;

        const resBrawl = await fetch('../todos_os_brawlers.json');
        const dataBrawl = await resBrawl.json();
        todosOsBrawlers = dataBrawl.list ? dataBrawl.list : dataBrawl;
    } catch (error) {
        console.error(error);
    }
};

function embaralhar(array) {
    let copia = [...array];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function obterImagem(personagem) {
    if (universoAtual === 'brawl' && personagem.imageUrl) {
        return personagem.imageUrl;
    }
    if (personagem.key) {
        return `https://royaleapi.github.io/cr-api-assets/cards/${personagem.key}.png`;
    }
    if (personagem.iconUrls && personagem.iconUrls.medium) {
        return personagem.iconUrls.medium;
    }
    return '';
}

function precarregarImagens(lista) {
    lista.forEach(item => {
        const img = new Image();
        img.src = obterImagem(item);
    });
}

function selecionarUniverso(universo) {
    universoAtual = universo;
    document.getElementById('btn-uni-clash').classList.remove('active');
    document.getElementById('btn-uni-brawl').classList.remove('active');
    document.getElementById(`btn-uni-${universo}`).classList.add('active');

    const label1 = document.getElementById('label-j1');
    const label2 = document.getElementById('label-j2');

    if (universo === 'clash') {
        label1.innerText = '👑 Rei Azul (Jogador 1)';
        label2.innerText = '👑 Rei Vermelho (Jogador 2)';
    } else {
        label1.innerText = '⭐ Brawler Azul (Jogador 1)';
        label2.innerText = '⭐ Brawler Vermelho (Jogador 2)';
    }
}

function validarNomes() {
    const nomeAzul = document.getElementById('nome-azul').value.trim();
    const nomeVermelho = document.getElementById('nome-vermelho').value.trim();
    document.getElementById('btn-jogar').disabled = !(nomeAzul !== '' && nomeVermelho !== '');
}

function mostrarTela(idTela) {
    document.querySelectorAll('.screen').forEach(tela => tela.classList.remove('active'));
    document.getElementById(idTela).classList.add('active');
}

function aplicarTema(cor) {
    document.body.classList.remove('tema-azul', 'tema-vermelho');
    if (cor) document.body.classList.add(`tema-${cor}`);
}

function iniciarJogo() {
    jogadores.azul = document.getElementById('nome-azul').value.trim();
    jogadores.vermelho = document.getElementById('nome-vermelho').value.trim();

    if (jogadores.azul === '' || jogadores.vermelho === '') return;

    const baseDados = universoAtual === 'clash' ? todasAsCartasClash : todosOsBrawlers;

    if (baseDados.length < TOTAL_PARES) {
        alert('Aguarde o carregamento das cartas e tente novamente.');
        return;
    }

    const selecionados = embaralhar(baseDados).slice(0, TOTAL_PARES);
    precarregarImagens(selecionados);

    const baralhoDuplicado = [...selecionados, ...selecionados].map((item, index) => ({
        uid: index,
        id: item.id,
        imagem: obterImagem(item)
    }));

    cartasTabuleiro = embaralhar(baralhoDuplicado);
    pontuacao = { azul: 0, vermelho: 0 };
    turnoAtual = 'azul';
    cartasViradas = [];
    bloqueioTabuleiro = false;
    paresEncontrados = 0;

    aplicarTema('azul');
    atualizarInterfaceTurno('Escolha duas cartas!');
    renderizarArena();
    mostrarTela('tela-jogo');
}

function atualizarInterfaceTurno(mensagemSubtitulo) {
    const containerPlacar = document.getElementById('placar-topo');
    const icone = universoAtual === 'clash' ? '👑' : '⭐';
    const classeAzul = turnoAtual === 'azul' ? 'ativo-azul' : '';
    const classeVermelho = turnoAtual === 'vermelho' ? 'ativo-vermelho' : '';

    containerPlacar.innerHTML = `
        <div class="placar-card ${classeAzul}">
            <span class="placar-nome label-azul">${icone} ${jogadores.azul}</span>
            <span class="placar-valor">${pontuacao.azul} pts</span>
        </div>
        <div class="placar-card ${classeVermelho}">
            <span class="placar-nome label-vermelho">${icone} ${jogadores.vermelho}</span>
            <span class="placar-valor">${pontuacao.vermelho} pts</span>
        </div>
    `;

    const nomeAtivo = turnoAtual === 'azul' ? jogadores.azul : jogadores.vermelho;
    document.getElementById('titulo-turno').innerText = `Vez de ${nomeAtivo}`;

    if (mensagemSubtitulo) {
        document.getElementById('subtitulo-turno').innerText = mensagemSubtitulo;
    }
}

function renderizarArena() {
    const arena = document.getElementById('arena-memoria');
    arena.innerHTML = '';

    if (universoAtual === 'brawl') {
        arena.classList.add('modo-brawl');
    } else {
        arena.classList.remove('modo-brawl');
    }

    let indiceCarta = 0;

    ESTRUTURA_FILEIRAS.forEach(qtdNaFileira => {
        const divFileira = document.createElement('div');
        divFileira.className = 'fileira-cartas';

        for (let i = 0; i < qtdNaFileira; i++) {
            const dadosCarta = cartasTabuleiro[indiceCarta];
            const elCarta = criarElementoCarta(dadosCarta, indiceCarta);
            divFileira.appendChild(elCarta);
            indiceCarta++;
        }

        arena.appendChild(divFileira);
    });
}

function criarElementoCarta(dadosCarta, indiceAnimacao) {
    const carta = document.createElement('div');
    carta.className = 'carta-memoria entrada';
    carta.style.animationDelay = `${indiceAnimacao * 25}ms`;
    carta.dataset.uid = dadosCarta.uid;
    carta.dataset.id = dadosCarta.id;

    carta.innerHTML = `
        <div class="carta-inner">
            <div class="carta-face carta-verso">
                <div class="circulo-interrogacao">?</div>
            </div>
            <div class="carta-face carta-frente">
                <img src="${dadosCarta.imagem}" alt="Carta">
            </div>
        </div>
    `;

    carta.addEventListener('animationend', () => {
        carta.classList.remove('entrada');
    }, { once: true });

    carta.onclick = () => clicarCarta(carta);
    return carta;
}

function clicarCarta(elCarta) {
    if (bloqueioTabuleiro) return;
    if (elCarta.classList.contains('virada') || elCarta.classList.contains('encontrada')) return;

    elCarta.classList.add('virada');
    cartasViradas.push(elCarta);

    if (cartasViradas.length === 1) {
        document.getElementById('subtitulo-turno').innerText = 'Escolha a segunda carta...';
        return;
    }

    if (cartasViradas.length === 2) {
        bloqueioTabuleiro = true;
        verificarPar();
    }
}

function verificarPar() {
    const [carta1, carta2] = cartasViradas;
    const ehPar = carta1.dataset.id === carta2.dataset.id;

    if (ehPar) {
        pontuacao[turnoAtual] += 1;
        paresEncontrados += 1;
        atualizarInterfaceTurno('Par encontrado! +1 ponto, jogue novamente!');

        setTimeout(() => {
            carta1.classList.add('encontrada');
            carta2.classList.add('encontrada');
            cartasViradas = [];
            bloqueioTabuleiro = false;

            if (paresEncontrados === TOTAL_PARES) {
                setTimeout(mostrarTelaFinal, 700);
            }
        }, 550);
    } else {
        document.getElementById('subtitulo-turno').innerText = 'Não combinou! Passando a vez...';

        setTimeout(() => {
            carta1.classList.add('erro');
            carta2.classList.add('erro');
        }, 450);

        setTimeout(() => {
            carta1.classList.remove('virada', 'erro');
            carta2.classList.remove('virada', 'erro');
            cartasViradas = [];

            turnoAtual = turnoAtual === 'azul' ? 'vermelho' : 'azul';
            aplicarTema(turnoAtual);
            atualizarInterfaceTurno('Sua vez! Escolha duas cartas.');
            bloqueioTabuleiro = false;
        }, 1250);
    }
}

function mostrarTelaFinal() {
    const tituloCampeao = document.getElementById('vitoria-campeao');
    const resumo = document.getElementById('resumo-placar-final');
    const tituloRole = universoAtual === 'clash' ? 'Rei' : 'Brawler';

    if (pontuacao.azul > pontuacao.vermelho) {
        aplicarTema('azul');
        tituloCampeao.innerText = `Campeão: ${tituloRole} Azul (${jogadores.azul})`;
    } else if (pontuacao.vermelho > pontuacao.azul) {
        aplicarTema('vermelho');
        tituloCampeao.innerText = `Campeão: ${tituloRole} Vermelho (${jogadores.vermelho})`;
    } else {
        aplicarTema(null);
        tituloCampeao.innerText = 'Empate Técnico!';
    }

    resumo.innerHTML = `
        <div class="linha-placar-final">
            <span class="label-azul">${jogadores.azul}</span>
            <span style="color: var(--dourado);">${pontuacao.azul} pts</span>
        </div>
        <div class="linha-placar-final">
            <span class="label-vermelho">${jogadores.vermelho}</span>
            <span style="color: var(--dourado);">${pontuacao.vermelho} pts</span>
        </div>
    `;

    mostrarTela('tela-vitoria');
}

function jogarNovamente() {
    aplicarTema(null);
    mostrarTela('tela-config');
}
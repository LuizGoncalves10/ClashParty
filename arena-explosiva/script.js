let todasAsCartasClash = [];
let todosOsBrawlers = [];

let universoAtual = 'clash';
let modoAtual = 'sabotagem';

let nomeReiAzul = 'Rei Azul';
let nomeReiVermelho = 'Rei Vermelho';

let etapaPlantio = 1;
let bombasSelecionadasTemp = new Set();

let tabuleiroParaAzul = [];
let tabuleiroParaVermelho = [];
let tabuleiroCompartilhado = [];

let vidasMaximas = 3;
let vidasAzul = 3;
let vidasVermelho = 3;
let turnoAtual = 'azul';
let animandoJogada = false;
let acaoAposPasse = null;

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

function obterNome(personagem) {
    if (universoAtual === 'clash' && personagem.name_pt) {
        return personagem.name_pt;
    }
    return personagem.name || '';
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

function mostrarTela(idTela) {
    document.querySelectorAll('.screen').forEach(tela => tela.classList.remove('active'));
    document.getElementById(idTela).classList.add('active');
}

function aplicarTemaTurno(time) {
    document.body.classList.remove('turno-azul', 'turno-vermelho');
    if (time === 'azul') document.body.classList.add('turno-azul');
    if (time === 'vermelho') document.body.classList.add('turno-vermelho');
}

function selecionarUniverso(universo) {
    universoAtual = universo;
    document.getElementById('btn-uni-clash').classList.remove('active');
    document.getElementById('btn-uni-brawl').classList.remove('active');
    document.getElementById(`btn-uni-${universo}`).classList.add('active');
}

function selecionarModo(modo) {
    modoAtual = modo;
    document.getElementById('btn-modo-sabotagem').classList.remove('active');
    document.getElementById('btn-modo-campo').classList.remove('active');
    document.getElementById(`btn-modo-${modo}`).classList.add('active');

    const desc = document.getElementById('descricao-modo');
    if (modo === 'sabotagem') {
        desc.innerText = 'Cada time esconde 3 bombas na mesma grade em tabuleiros separados. Quem perder 3 vidas primeiro perde!';
    } else {
        desc.innerText = 'Tabuleiro único com 4 bombas aleatórias. Quem perder 2 vidas primeiro perde!';
    }
}

function validarNomes() {
    const azul = document.getElementById('input-nome-azul').value.trim();
    const vermelho = document.getElementById('input-nome-vermelho').value.trim();
    const erroBox = document.getElementById('erro-nomes');
    const btnJogar = document.getElementById('btn-jogar');

    if (azul === '' || vermelho === '') {
        erroBox.style.display = 'none';
        btnJogar.disabled = true;
        return false;
    }

    if (azul.toLowerCase() === vermelho.toLowerCase()) {
        erroBox.innerText = 'Os dois jogadores não podem ter o mesmo nome!';
        erroBox.style.display = 'block';
        btnJogar.disabled = true;
        return false;
    }

    erroBox.style.display = 'none';
    btnJogar.disabled = false;
    return true;
}

function gerarDeck16(sorteadas) {
    return sorteadas.map((item, idx) => ({
        index: idx,
        id: item.id,
        nome: obterNome(item),
        imagem: obterImagem(item),
        temBomba: false,
        estado: 'fechada'
    }));
}

function iniciarPartida() {
    if (!validarNomes()) return;

    const baseDados = universoAtual === 'clash' ? todasAsCartasClash : todosOsBrawlers;
    if (baseDados.length < 16) {
        alert('Aguarde o carregamento das cartas e tente novamente.');
        return;
    }

    nomeReiAzul = document.getElementById('input-nome-azul').value.trim();
    nomeReiVermelho = document.getElementById('input-nome-vermelho').value.trim();

    animandoJogada = false;
    turnoAtual = 'azul';

    const cartasSorteadas16 = embaralhar(baseDados).slice(0, 16);

    if (modoAtual === 'sabotagem') {
        vidasMaximas = 3;
        vidasAzul = 3;
        vidasVermelho = 3;

        tabuleiroParaVermelho = gerarDeck16(cartasSorteadas16);
        tabuleiroParaAzul = gerarDeck16(cartasSorteadas16);

        etapaPlantio = 1;
        prepararTelaPlantar();
        mostrarTela('tela-plantar');
    } else {
        vidasMaximas = 2;
        vidasAzul = 2;
        vidasVermelho = 2;

        tabuleiroCompartilhado = gerarDeck16(cartasSorteadas16);
        const indicesBomba = embaralhar([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]).slice(0, 4);
        indicesBomba.forEach(i => {
            tabuleiroCompartilhado[i].temBomba = true;
        });

        iniciarFaseBatalha();
    }
}

function prepararTelaPlantar() {
    bombasSelecionadasTemp.clear();
    const btnConfirmar = document.getElementById('btn-confirmar-bombas');
    btnConfirmar.disabled = true;
    document.getElementById('contador-selecionadas').innerText = '0 / 3';

    const titulo = document.getElementById('plantar-titulo-time');
    const instrucao = document.getElementById('plantar-instrucao');
    const etapaBadge = document.getElementById('plantar-etapa');

    let deckAtual = [];

    if (etapaPlantio === 1) {
        aplicarTemaTurno('azul');
        etapaBadge.innerText = 'PREPARAÇÃO 1 de 2';
        titulo.innerText = nomeReiAzul;
        titulo.style.color = '#4da6ff';
        instrucao.innerText = `Escolha 3 cartas onde ${nomeReiVermelho} vai pisar!`;
        deckAtual = tabuleiroParaVermelho;
    } else {
        aplicarTemaTurno('vermelho');
        etapaBadge.innerText = 'PREPARAÇÃO 2 de 2';
        titulo.innerText = nomeReiVermelho;
        titulo.style.color = '#ff5252';
        instrucao.innerText = `Escolha 3 cartas onde ${nomeReiAzul} vai pisar!`;
        deckAtual = tabuleiroParaAzul;
    }

    const grade = document.getElementById('grade-plantar');
    grade.innerHTML = '';

    deckAtual.forEach((carta, index) => {
        const div = document.createElement('div');
        div.className = 'carta-arena';
        div.innerHTML = `
            <img src="${carta.imagem}" alt="${carta.nome}">
            <span class="nome-carta-grid">${carta.nome}</span>
        `;

        div.onclick = () => {
            if (bombasSelecionadasTemp.has(index)) {
                bombasSelecionadasTemp.delete(index);
                div.classList.remove('plantada-bomba');
            } else {
                if (bombasSelecionadasTemp.size >= 3) return;
                bombasSelecionadasTemp.add(index);
                div.classList.add('plantada-bomba');
            }

            document.getElementById('contador-selecionadas').innerText = `${bombasSelecionadasTemp.size} / 3`;
            btnConfirmar.disabled = bombasSelecionadasTemp.size !== 3;
        };

        grade.appendChild(div);
    });
}

function confirmarBombasPlantadas() {
    if (bombasSelecionadasTemp.size !== 3) return;

    if (etapaPlantio === 1) {
        bombasSelecionadasTemp.forEach(idx => {
            tabuleiroParaVermelho[idx].temBomba = true;
        });

        abrirTelaPasse('vermelho', `Agora ${nomeReiVermelho} vai esconder suas 3 bombas.`, () => {
            etapaPlantio = 2;
            prepararTelaPlantar();
            mostrarTela('tela-plantar');
        });
    } else {
        bombasSelecionadasTemp.forEach(idx => {
            tabuleiroParaAzul[idx].temBomba = true;
        });

        abrirTelaPasse('azul', `As bombas foram plantadas! ${nomeReiAzul} começa a partida.`, () => {
            turnoAtual = 'azul';
            iniciarFaseBatalha();
        });
    }
}

function abrirTelaPasse(proximoTime, mensagem, callback) {
    aplicarTemaTurno(proximoTime);
    acaoAposPasse = callback;

    const nomeEl = document.getElementById('passe-nome-time');
    if (proximoTime === 'azul') {
        nomeEl.innerText = nomeReiAzul;
        nomeEl.style.color = '#4da6ff';
    } else {
        nomeEl.innerText = nomeReiVermelho;
        nomeEl.style.color = '#ff5252';
    }

    document.getElementById('passe-instrucao').innerText = mensagem;
    mostrarTela('tela-passe');
}

function confirmarPasseTela() {
    if (typeof acaoAposPasse === 'function') {
        acaoAposPasse();
    }
}

function iniciarFaseBatalha() {
    document.getElementById('hud-nome-modo').innerText = modoAtual === 'sabotagem' ? 'SABOTAGEM' : 'CAMPO MINADO';
    document.getElementById('hud-nome-azul').innerText = nomeReiAzul.toUpperCase();
    document.getElementById('hud-nome-vermelho').innerText = nomeReiVermelho.toUpperCase();

    atualizarHudBatalha();
    renderizarGradeBatalha();
    mostrarTela('tela-batalha');
}

function gerarCoracoes(atual, maximo) {
    let texto = '';
    for (let i = 0; i < maximo; i++) {
        texto += i < atual ? '❤️' : '🖤';
    }
    return texto;
}

function atualizarHudBatalha() {
    aplicarTemaTurno(turnoAtual);

    document.getElementById('vidas-azul').innerText = gerarCoracoes(vidasAzul, vidasMaximas);
    document.getElementById('vidas-vermelho').innerText = gerarCoracoes(vidasVermelho, vidasMaximas);

    const hudAzul = document.getElementById('hud-time-azul');
    const hudVermelho = document.getElementById('hud-time-vermelho');
    const turnoTexto = document.getElementById('hud-turno-texto');
    const barraStatus = document.getElementById('status-batalha');

    if (turnoAtual === 'azul') {
        hudAzul.classList.add('ativo');
        hudVermelho.classList.remove('ativo');
        turnoTexto.innerText = 'VEZ DO AZUL';
        barraStatus.innerText = `${nomeReiAzul}: escolha uma carta para verificar!`;
        barraStatus.style.color = '#7cc0ff';
    } else {
        hudVermelho.classList.add('ativo');
        hudAzul.classList.remove('ativo');
        turnoTexto.innerText = 'VEZ DO VERMELHO';
        barraStatus.innerText = `${nomeReiVermelho}: escolha uma carta para verificar!`;
        barraStatus.style.color = '#ff8080';
    }
}

function obterDeckAtivoBatalha() {
    if (modoAtual === 'campo') {
        return tabuleiroCompartilhado;
    }
    return turnoAtual === 'azul' ? tabuleiroParaAzul : tabuleiroParaVermelho;
}

function renderizarGradeBatalha() {
    const grade = document.getElementById('grade-batalha');
    const deck = obterDeckAtivoBatalha();
    grade.innerHTML = '';

    deck.forEach((carta, index) => {
        const div = document.createElement('div');
        div.className = 'carta-arena';

        if (carta.estado === 'salva') {
            div.classList.add('salva', 'bloqueada');
        } else if (carta.estado === 'explodida') {
            div.classList.add('explodida', 'bloqueada');
        }

        div.innerHTML = `
            <img src="${carta.imagem}" alt="${carta.nome}">
            <span class="nome-carta-grid">${carta.nome}</span>
        `;

        div.onclick = () => clicarCartaBatalha(index, div);
        grade.appendChild(div);
    });
}

function clicarCartaBatalha(index, elementoCard) {
    if (animandoJogada) return;

    const deck = obterDeckAtivoBatalha();
    const carta = deck[index];

    if (!carta || carta.estado !== 'fechada') return;

    animandoJogada = true;
    const barraStatus = document.getElementById('status-batalha');
    barraStatus.innerText = `Verificando ${carta.nome}...`;
    barraStatus.style.color = 'var(--dourado)';

    elementoCard.classList.add('verificando', 'bloqueada');

    setTimeout(() => {
        elementoCard.classList.remove('verificando');

        if (carta.temBomba) {
            carta.estado = 'explodida';
            elementoCard.classList.add('explodida');

            const boxGrade = document.getElementById('box-grade-batalha');
            boxGrade.classList.remove('tremor-tabuleiro');
            void boxGrade.offsetWidth;
            boxGrade.classList.add('tremor-tabuleiro');

            if (turnoAtual === 'azul') {
                vidasAzul = Math.max(0, vidasAzul - 1);
            } else {
                vidasVermelho = Math.max(0, vidasVermelho - 1);
            }

            document.getElementById('vidas-azul').innerText = gerarCoracoes(vidasAzul, vidasMaximas);
            document.getElementById('vidas-vermelho').innerText = gerarCoracoes(vidasVermelho, vidasMaximas);

            barraStatus.innerText = `💥 BOMBA! ${carta.nome} explodiu! (-1 vida)`;
            barraStatus.style.color = '#ff4d4d';
        } else {
            carta.estado = 'salva';
            elementoCard.classList.add('salva');
            barraStatus.innerText = `✔ ${carta.nome} está limpa!`;
            barraStatus.style.color = '#69f0ae';
        }

        setTimeout(() => {
            animandoJogada = false;
            verificarFimOuProximoTurno();
        }, 900);
    }, 650);
}

function verificarFimOuProximoTurno() {
    if (vidasAzul <= 0) {
        mostrarResultadoFinal('vermelho');
        return;
    }
    if (vidasVermelho <= 0) {
        mostrarResultadoFinal('azul');
        return;
    }

    const deckAtual = obterDeckAtivoBatalha();
    const aindaTemSeguras = deckAtual.some(c => c.estado === 'fechada' && !c.temBomba);
    if (!aindaTemSeguras) {
        const vencedor = vidasAzul >= vidasVermelho ? 'azul' : 'vermelho';
        mostrarResultadoFinal(vencedor);
        return;
    }

    turnoAtual = turnoAtual === 'azul' ? 'vermelho' : 'azul';
    atualizarHudBatalha();
    renderizarGradeBatalha();
}

function mostrarResultadoFinal(vencedor) {
    aplicarTemaTurno(vencedor);

    const titulo = document.getElementById('resultado-titulo');
    const subtitulo = document.getElementById('resultado-subtitulo');
    const badgeModo = document.getElementById('resultado-badge-modo');
    const frase = document.getElementById('frase-final-arena');

    badgeModo.innerText = modoAtual === 'sabotagem' ? 'MODO SABOTAGEM' : 'MODO CAMPO MINADO';

    if (vencedor === 'azul') {
        titulo.innerText = `👑 VITÓRIA DE ${nomeReiAzul.toUpperCase()}! 👑`;
        titulo.style.color = '#4da6ff';
        subtitulo.innerText = `${nomeReiVermelho} ficou sem vidas na arena!`;
        frase.innerText = `Estratégia impecável de ${nomeReiAzul}!`;
    } else {
        titulo.innerText = `👑 VITÓRIA DE ${nomeReiVermelho.toUpperCase()}! 👑`;
        titulo.style.color = '#ff4d4d';
        subtitulo.innerText = `${nomeReiAzul} ficou sem vidas na arena!`;
        frase.innerText = `Domínio total de ${nomeReiVermelho}!`;
    }

    document.getElementById('final-label-azul').innerText = nomeReiAzul.toUpperCase();
    document.getElementById('final-label-vermelho').innerText = nomeReiVermelho.toUpperCase();
    document.getElementById('final-vidas-azul').innerText = gerarCoracoes(vidasAzul, vidasMaximas);
    document.getElementById('final-vidas-vermelho').innerText = gerarCoracoes(vidasVermelho, vidasMaximas);

    mostrarTela('tela-resultado');
}

function voltarConfig() {
    aplicarTemaTurno(null);
    validarNomes();
    mostrarTela('tela-config');
}
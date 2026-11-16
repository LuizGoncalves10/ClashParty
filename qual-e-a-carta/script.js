let todasAsCartasClash = [];
let todosOsBrawlers = [];

let universoAtual = 'clash';
let modoJogoAtual = 'dupla';
let totalRodadas = 5;

let jogadores = { azul: '', vermelho: '' };
let pontuacao = { azul: 0, vermelho: 0 };

let rodadaAtual = 1;
let turnoAtual = 'azul';
let nivelZoomIndex = 0;
let confirmacaoPassar = false;

let baralhoPartida = [];
let personagemAtual = null;
let focoZoom = { x: 50, y: 50 };

const NIVEIS_ZOOM = [
    { porcentagem: 90, escala: 6.5, pontos: 3 },
    { porcentagem: 75, escala: 3.8, pontos: 2 },
    { porcentagem: 50, escala: 2.1, pontos: 1 }
];

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

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

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

function selecionarModoJogo(modo) {
    modoJogoAtual = modo;
    document.getElementById('btn-modo-dupla').classList.remove('active');
    document.getElementById('btn-modo-sozinho').classList.remove('active');
    document.getElementById(`btn-modo-${modo}`).classList.add('active');

    const areaNomes = document.getElementById('area-nomes');
    document.getElementById('erro-nomes').style.display = 'none';

    areaNomes.style.display = modo === 'dupla' ? 'block' : 'none';
}

function selecionarRodadas(qtd, botao) {
    totalRodadas = qtd;
    document.querySelectorAll('.btn-rodada').forEach(btn => btn.classList.remove('active'));
    botao.classList.add('active');
}

function mostrarTela(idTela) {
    document.querySelectorAll('.screen').forEach(tela => tela.classList.remove('active'));
    document.getElementById(idTela).classList.add('active');
}

function aplicarTema(cor) {
    document.body.classList.remove('tema-azul', 'tema-vermelho');
    if (cor) document.body.classList.add(`tema-${cor}`);
}

function avancarConfig() {
    const erroNomes = document.getElementById('erro-nomes');
    erroNomes.style.display = 'none';

    if (modoJogoAtual === 'dupla') {
        jogadores.azul = document.getElementById('nome-azul').value.trim();
        jogadores.vermelho = document.getElementById('nome-vermelho').value.trim();

        if (jogadores.azul === '' || jogadores.vermelho === '') {
            erroNomes.style.display = 'block';
            return;
        }
    } else {
        jogadores.azul = 'Jogador';
        jogadores.vermelho = '';
    }

    iniciarPartida();
}

function iniciarPartida() {
    const baseDados = universoAtual === 'clash' ? todasAsCartasClash : todosOsBrawlers;
    const totalCartasNecessarias = modoJogoAtual === 'dupla' ? totalRodadas * 2 : totalRodadas;

    if (baseDados.length < totalCartasNecessarias) {
        alert('Aguarde o carregamento das cartas e tente novamente.');
        return;
    }

    baralhoPartida = embaralhar(baseDados).slice(0, totalCartasNecessarias);
    pontuacao = { azul: 0, vermelho: 0 };
    rodadaAtual = 1;
    turnoAtual = 'azul';

    const moldura = document.getElementById('moldura-carta');
    if (universoAtual === 'brawl') {
        moldura.classList.add('quadrada');
    } else {
        moldura.classList.remove('quadrada');
    }

    mostrarTela('tela-jogo');
    prepararTurno();
}

function prepararTurno() {
    personagemAtual = baralhoPartida.pop();
    nivelZoomIndex = 0;
    confirmacaoPassar = false;

    focoZoom = {
        x: Math.floor(Math.random() * 41) + 30,
        y: Math.floor(Math.random() * 41) + 30
    };

    const img = document.getElementById('img-carta-zoom');
    img.src = obterImagem(personagemAtual);

    if (modoJogoAtual === 'dupla') {
        aplicarTema(turnoAtual);
        const nomeAtivo = turnoAtual === 'azul' ? jogadores.azul : jogadores.vermelho;
        document.getElementById('titulo-turno').innerText = `Rodada ${rodadaAtual}/${totalRodadas} • ${nomeAtivo}`;
    } else {
        aplicarTema(null);
        document.getElementById('titulo-turno').innerText = `Rodada ${rodadaAtual} de ${totalRodadas}`;
    }

    resetarBotaoPassar();
    fecharBuscaChute();

    const feedback = document.getElementById('feedback-turno');
    feedback.style.display = 'none';
    feedback.className = 'feedback-box';

    document.getElementById('area-acoes-principais').style.display = 'flex';
    document.getElementById('area-proximo-turno').style.display = 'none';

    atualizarPlacar();
    atualizarVisualZoom();
}

function atualizarPlacar() {
    const container = document.getElementById('placar-topo');

    if (modoJogoAtual === 'dupla') {
        const classeAzul = turnoAtual === 'azul' ? 'ativo-azul' : '';
        const classeVermelho = turnoAtual === 'vermelho' ? 'ativo-vermelho' : '';
        const icone = universoAtual === 'clash' ? '👑' : '⭐';

        container.innerHTML = `
            <div class="placar-card ${classeAzul}">
                <span class="placar-nome label-azul">${icone} ${jogadores.azul}</span>
                <span class="placar-valor">${pontuacao.azul} pts</span>
            </div>
            <div class="placar-card ${classeVermelho}">
                <span class="placar-nome label-vermelho">${icone} ${jogadores.vermelho}</span>
                <span class="placar-valor">${pontuacao.vermelho} pts</span>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="placar-card" style="border-color: var(--dourado);">
                <span class="placar-nome">Pontuação Atual</span>
                <span class="placar-valor">${pontuacao.azul} pts</span>
            </div>
        `;
    }
}

function atualizarVisualZoom() {
    const configZoom = NIVEIS_ZOOM[nivelZoomIndex];
    const img = document.getElementById('img-carta-zoom');

    img.style.transformOrigin = `${focoZoom.x}% ${focoZoom.y}%`;
    img.style.transform = `scale(${configZoom.escala})`;

    document.getElementById('badge-zoom').innerText = `🔍 Zoom: ${configZoom.porcentagem}%`;
    document.getElementById('badge-pontos').innerText = `⭐ Valendo: ${configZoom.pontos} pts`;
}

function resetarBotaoPassar() {
    confirmacaoPassar = false;
    const btnPassar = document.getElementById('btn-passar');
    btnPassar.innerText = 'PASSAR ⏭️';
    btnPassar.classList.remove('confirmar');
}

function clicarPassar() {
    const btnPassar = document.getElementById('btn-passar');

    if (!confirmacaoPassar) {
        confirmacaoPassar = true;
        btnPassar.innerText = 'CONFIRMAR? ⚠️';
        btnPassar.classList.add('confirmar');
        return;
    }

    resetarBotaoPassar();

    if (nivelZoomIndex < NIVEIS_ZOOM.length - 1) {
        nivelZoomIndex++;
        atualizarVisualZoom();
    } else {
        revelarResposta('revelado', `Era: ${personagemAtual.name}! (0 pts)`);
    }
}

function abrirBuscaChute() {
    resetarBotaoPassar();
    document.getElementById('area-acoes-principais').style.display = 'none';
    document.getElementById('area-busca-chute').style.display = 'block';

    const input = document.getElementById('input-chute');
    input.value = '';
    document.getElementById('lista-sugestoes').innerHTML = '';
    input.focus();
}

function fecharBuscaChute() {
    document.getElementById('area-busca-chute').style.display = 'none';
    if (document.getElementById('area-proximo-turno').style.display === 'none') {
        document.getElementById('area-acoes-principais').style.display = 'flex';
    }
}

function filtrarOpcoes() {
    const termoDigitado = normalizarTexto(document.getElementById('input-chute').value);
    const lista = document.getElementById('lista-sugestoes');
    lista.innerHTML = '';

    if (termoDigitado.length < 2) {
        return;
    }

    const baseDados = universoAtual === 'clash' ? todasAsCartasClash : todosOsBrawlers;
    const filtrados = baseDados.filter(item => normalizarTexto(item.name).includes(termoDigitado));

    filtrados.slice(0, 15).forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'item-sugestao';
        btn.innerText = item.name;
        btn.onclick = () => confirmarChute(item);
        lista.appendChild(btn);
    });
}

function confirmarChute(itemEscolhido) {
    document.getElementById('area-busca-chute').style.display = 'none';

    if (itemEscolhido.id === personagemAtual.id) {
        const pontosGanhos = NIVEIS_ZOOM[nivelZoomIndex].pontos;
        pontuacao[turnoAtual] += pontosGanhos;
        atualizarPlacar();
        revelarResposta('acerto', `ACERTOU! +${pontosGanhos} pts (${personagemAtual.name})`);
    } else {
        revelarResposta('erro', `ERROU! Era: ${personagemAtual.name}`);
    }
}

function revelarResposta(tipo, mensagem) {
    const img = document.getElementById('img-carta-zoom');
    img.style.transformOrigin = '50% 50%';
    img.style.transform = 'scale(1)';

    document.getElementById('badge-zoom').innerText = '🔍 Zoom: 0%';
    document.getElementById('badge-pontos').innerText = 'Carta Revelada';

    const feedback = document.getElementById('feedback-turno');
    feedback.innerText = mensagem;
    feedback.className = `feedback-box feedback-${tipo}`;
    feedback.style.display = 'block';

    document.getElementById('area-acoes-principais').style.display = 'none';
    document.getElementById('area-busca-chute').style.display = 'none';

    const btnProximo = document.getElementById('btn-proximo');
    const ultimoTurnoDaPartida = (modoJogoAtual === 'sozinho' && rodadaAtual === totalRodadas) ||
                                 (modoJogoAtual === 'dupla' && rodadaAtual === totalRodadas && turnoAtual === 'vermelho');

    btnProximo.innerText = ultimoTurnoDaPartida ? 'VER RESULTADO 🏆' : 'PRÓXIMO ➡️';
    document.getElementById('area-proximo-turno').style.display = 'flex';
}

function avancarTurno() {
    if (modoJogoAtual === 'dupla') {
        if (turnoAtual === 'azul') {
            turnoAtual = 'vermelho';
            prepararTurno();
        } else {
            if (rodadaAtual < totalRodadas) {
                rodadaAtual++;
                turnoAtual = 'azul';
                prepararTurno();
            } else {
                mostrarTelaFinal();
            }
        }
    } else {
        if (rodadaAtual < totalRodadas) {
            rodadaAtual++;
            prepararTurno();
        } else {
            mostrarTelaFinal();
        }
    }
}

function mostrarTelaFinal() {
    const tituloCampeao = document.getElementById('vitoria-campeao');
    const resumo = document.getElementById('resumo-placar-final');
    const tituloRole = universoAtual === 'clash' ? 'Rei' : 'Brawler';

    if (modoJogoAtual === 'dupla') {
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
    } else {
        aplicarTema(null);
        const maxPontos = totalRodadas * 3;
        tituloCampeao.innerText = 'Desafio Concluído!';
        resumo.innerHTML = `
            <div class="linha-placar-final">
                <span>Sua Pontuação</span>
                <span style="color: var(--dourado);">${pontuacao.azul} / ${maxPontos} pts</span>
            </div>
        `;
    }

    mostrarTela('tela-vitoria');
}

function jogarNovamente() {
    aplicarTema(null);
    mostrarTela('tela-config');
}
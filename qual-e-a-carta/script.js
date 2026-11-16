let universoAtual = 'clash';
let modoJogoAtual = 'dupla';
let jogadores = { azul: '', vermelho: '' };

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
    const erroNomes = document.getElementById('erro-nomes');
    erroNomes.style.display = 'none';

    if (modo === 'dupla') {
        areaNomes.style.display = 'block';
    } else {
        areaNomes.style.display = 'none';
    }
}

function mostrarTela(idTela) {
    document.querySelectorAll('.screen').forEach(tela => tela.classList.remove('active'));
    document.getElementById(idTela).classList.add('active');
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
    const titulo = document.getElementById('titulo-jogo');
    const subtitulo = document.getElementById('subtitulo-jogo');
    const nomeUniverso = universoAtual === 'clash' ? 'Clash Royale' : 'Brawl Stars';

    if (modoJogoAtual === 'dupla') {
        titulo.innerText = `${jogadores.azul} vs ${jogadores.vermelho}`;
        subtitulo.innerText = `Universo: ${nomeUniverso}`;
    } else {
        titulo.innerText = 'Modo Solo';
        subtitulo.innerText = `Universo: ${nomeUniverso}`;
    }

    mostrarTela('tela-jogo');
}

function voltarConfig() {
    mostrarTela('tela-config');
}
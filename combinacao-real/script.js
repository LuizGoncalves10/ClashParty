let universoAtual = 'clash';
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

function validarNomes() {
    const nomeAzul = document.getElementById('nome-azul').value.trim();
    const nomeVermelho = document.getElementById('nome-vermelho').value.trim();
    const btnJogar = document.getElementById('btn-jogar');

    btnJogar.disabled = !(nomeAzul !== '' && nomeVermelho !== '');
}

function mostrarTela(idTela) {
    document.querySelectorAll('.screen').forEach(tela => tela.classList.remove('active'));
    document.getElementById(idTela).classList.add('active');
}

function iniciarJogo() {
    jogadores.azul = document.getElementById('nome-azul').value.trim();
    jogadores.vermelho = document.getElementById('nome-vermelho').value.trim();

    if (jogadores.azul === '' || jogadores.vermelho === '') return;

    const nomeUniverso = universoAtual === 'clash' ? 'Clash Royale' : 'Brawl Stars';
    document.getElementById('titulo-jogo').innerText = `${jogadores.azul} vs ${jogadores.vermelho}`;
    document.getElementById('subtitulo-jogo').innerText = `Universo: ${nomeUniverso}`;

    mostrarTela('tela-jogo');
}

function voltarConfig() {
    mostrarTela('tela-config');
}
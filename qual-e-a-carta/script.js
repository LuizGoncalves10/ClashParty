let modoJogoAtual = 'dupla';

function selecionarModoJogo(modo) {
    modoJogoAtual = modo;
    document.getElementById('btn-modo-dupla').classList.remove('active');
    document.getElementById('btn-modo-sozinho').classList.remove('active');
    document.getElementById(`btn-modo-${modo}`).classList.add('active');
}

function mostrarTela(idTela) {
    document.querySelectorAll('.screen').forEach(tela => tela.classList.remove('active'));
    document.getElementById(idTela).classList.add('active');
}

function avancarConfig() {
    const titulo = document.getElementById('titulo-jogo');
    titulo.innerText = modoJogoAtual === 'dupla' ? 'Modo: Em Dupla' : 'Modo: Sozinho';
    mostrarTela('tela-jogo');
}

function voltarConfig() {
    mostrarTela('tela-config');
}
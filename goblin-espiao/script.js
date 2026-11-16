let universoAtual = 'clash';
let listaNomes = ['', '', ''];

const MIN_JOGADORES = 3;
const MAX_JOGADORES = 10;

window.onload = () => {
    renderizarInputsJogadores();
};

function selecionarUniverso(universo) {
    universoAtual = universo;
    document.getElementById('btn-uni-clash').classList.remove('active');
    document.getElementById('btn-uni-brawl').classList.remove('active');
    document.getElementById(`btn-uni-${universo}`).classList.add('active');
}

function renderizarInputsJogadores() {
    const container = document.getElementById('lista-inputs-jogadores');
    container.innerHTML = '';

    listaNomes.forEach((nome, index) => {
        const linha = document.createElement('div');
        linha.className = 'linha-jogador';

        const badge = document.createElement('div');
        badge.className = 'badge-numero';
        badge.innerText = `${index + 1}º`;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'input-nome-jogador';
        input.placeholder = `Nome do Jogador ${index + 1}`;
        input.value = nome;
        input.autocomplete = 'off';
        input.maxLength = 18;
        input.oninput = (e) => {
            listaNomes[index] = e.target.value;
            validarJogadores();
        };

        linha.appendChild(badge);
        linha.appendChild(input);

        if (listaNomes.length > MIN_JOGADORES) {
            const btnRemover = document.createElement('button');
            btnRemover.type = 'button';
            btnRemover.className = 'btn-remover';
            btnRemover.innerText = '✖';
            btnRemover.onclick = () => removerJogador(index);
            linha.appendChild(btnRemover);
        }

        container.appendChild(linha);
    });

    document.getElementById('contador-jogadores').innerText = `Jogadores (${listaNomes.length}/${MAX_JOGADORES}):`;
    document.getElementById('btn-add-jogador').disabled = listaNomes.length >= MAX_JOGADORES;

    validarJogadores();
}

function adicionarJogador() {
    if (listaNomes.length >= MAX_JOGADORES) return;
    listaNomes.push('');
    renderizarInputsJogadores();

    const inputs = document.querySelectorAll('.input-nome-jogador');
    if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
    }
}

function removerJogador(index) {
    if (listaNomes.length <= MIN_JOGADORES) return;
    listaNomes.splice(index, 1);
    renderizarInputsJogadores();
}

function validarJogadores() {
    const erroBox = document.getElementById('erro-config');
    const btnJogar = document.getElementById('btn-jogar');
    const nomesLimpos = listaNomes.map(n => n.trim());

    const todosPreenchidos = nomesLimpos.every(n => n.length > 0);
    if (!todosPreenchidos) {
        erroBox.style.display = 'none';
        btnJogar.disabled = true;
        return false;
    }

    const nomesMinusculos = nomesLimpos.map(n => n.toLowerCase());
    const temDuplicado = new Set(nomesMinusculos).size !== nomesMinusculos.length;

    if (temDuplicado) {
        erroBox.innerText = 'Os jogadores não podem ter nomes iguais!';
        erroBox.style.display = 'block';
        btnJogar.disabled = true;
        return false;
    }

    erroBox.style.display = 'none';
    btnJogar.disabled = false;
    return true;
}

function mostrarTela(idTela) {
    document.querySelectorAll('.screen').forEach(tela => tela.classList.remove('active'));
    document.getElementById(idTela).classList.add('active');
}

function iniciarJogo() {
    if (!validarJogadores()) return;

    const jogadoresAtivos = listaNomes.map(n => n.trim());
    const nomeUniverso = universoAtual === 'clash' ? 'Clash Royale' : 'Brawl Stars';

    document.getElementById('titulo-preparacao').innerText = `1º Jogador: ${jogadoresAtivos[0]}`;
    document.getElementById('subtitulo-preparacao').innerText = `${jogadoresAtivos.length} jogadores • Universo: ${nomeUniverso}`;

    mostrarTela('tela-entrega');
}

function voltarConfigTemporario() {
    mostrarTela('tela-config');
}
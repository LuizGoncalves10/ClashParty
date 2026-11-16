let todasAsCartasClash = [];
let todosOsBrawlers = [];

let universoAtual = 'clash';
let listaNomes = ['', '', ''];

let jogadoresPartida = [];
let indiceImpostor = 0;
let indicePrimeiroDebate = 0;
let cartaSecreta = null;
let grade9Cartas = [];

let indiceEntregaAtual = 0;
let cartaReveladaNoTurno = false;

let indiceVotacaoAtual = 0;
let votosRecebidos = [];
let candidatoSelecionado = null;

let impostorFoiDescoberto = false;
let cartaEscolhidaGolpe = null;

const MIN_JOGADORES = 3;
const MAX_JOGADORES = 10;

window.onload = async () => {
    renderizarInputsJogadores();
    configurarSlider();

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

function precarregarImagens(lista) {
    lista.forEach(item => {
        const img = new Image();
        img.src = obterImagem(item);
    });
}

function sortearImpostorComPeso(totalJogadores, indiceIniciante) {
    const pesos = [];
    let somaPesos = 0;

    for (let i = 0; i < totalJogadores; i++) {
        const peso = i === indiceIniciante ? 0.5 : 1.0;
        pesos.push(peso);
        somaPesos += peso;
    }

    let sorteio = Math.random() * somaPesos;
    for (let i = 0; i < totalJogadores; i++) {
        sorteio -= pesos[i];
        if (sorteio <= 0) {
            return i;
        }
    }

    return totalJogadores - 1;
}

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

function aplicarTemaPapel(papel) {
    document.body.classList.remove('tema-aliado', 'tema-impostor');
    if (papel === 'aliado') document.body.classList.add('tema-aliado');
    if (papel === 'impostor') document.body.classList.add('tema-impostor');
}

function montarGrade9Cartas(baseDados, escolhida) {
    let parecidas = baseDados.filter(item => {
        if (item.id === escolhida.id) return false;
        if (universoAtual === 'clash') {
            return item.rarity === escolhida.rarity || item.elixir === escolhida.elixir;
        } else {
            const mesmaRaridade = item.rarity && escolhida.rarity && item.rarity.id === escolhida.rarity.id;
            const mesmaClasse = item.class && escolhida.class && item.class.id === escolhida.class.id;
            return mesmaRaridade || mesmaClasse;
        }
    });

    let iscas = embaralhar(parecidas).slice(0, 8);

    if (iscas.length < 8) {
        const idsUsados = new Set([escolhida.id, ...iscas.map(i => i.id)]);
        const restantes = embaralhar(baseDados.filter(item => !idsUsados.has(item.id)));
        iscas = [...iscas, ...restantes.slice(0, 8 - iscas.length)];
    }

    return embaralhar([escolhida, ...iscas]);
}

function iniciarJogo() {
    if (!validarJogadores()) return;

    const baseDados = universoAtual === 'clash' ? todasAsCartasClash : todosOsBrawlers;
    if (baseDados.length < 9) {
        alert('Aguarde o carregamento das cartas e tente novamente.');
        return;
    }

    jogadoresPartida = listaNomes.map(n => n.trim());
    indicePrimeiroDebate = Math.floor(Math.random() * jogadoresPartida.length);
    indiceImpostor = sortearImpostorComPeso(jogadoresPartida.length, indicePrimeiroDebate);

    cartaSecreta = baseDados[Math.floor(Math.random() * baseDados.length)];
    grade9Cartas = montarGrade9Cartas(baseDados, cartaSecreta);

    precarregarImagens(grade9Cartas);

    indiceEntregaAtual = 0;
    prepararTurnoEntrega();
    mostrarTela('tela-entrega');
}

function prepararTurnoEntrega() {
    cartaReveladaNoTurno = false;
    aplicarTemaPapel(null);

    const total = jogadoresPartida.length;
    const nomeAtual = jogadoresPartida[indiceEntregaAtual];

    document.getElementById('entrega-progresso').innerText = `${indiceEntregaAtual + 1} de ${total}`;
    document.getElementById('entrega-nome-jogador').innerText = nomeAtual;

    const badgePapel = document.getElementById('badge-papel');
    badgePapel.innerText = 'DESLIZE PARA VER';
    badgePapel.className = 'badge-papel oculto';

    const cobertura = document.getElementById('cobertura-grade');
    cobertura.classList.remove('revelada');
    document.getElementById('texto-cobertura').innerText = `Só ${nomeAtual} pode olhar!`;

    renderizarGradeEntrega();
    resetarSlider();

    document.getElementById('wrapper-slider').style.display = 'block';
    const btnProximo = document.getElementById('btn-proximo-entrega');
    btnProximo.style.display = 'none';

    if (indiceEntregaAtual < total - 1) {
        btnProximo.innerText = `OCULTAR E PASSAR PARA ${jogadoresPartida[indiceEntregaAtual + 1].toUpperCase()} ➡️`;
    } else {
        btnProximo.innerText = 'OCULTAR E INICIAR DISCUSSÃO 🗣️';
    }
}

function renderizarGradeEntrega() {
    const grade = document.getElementById('grade-entrega');
    const ehImpostor = indiceEntregaAtual === indiceImpostor;

    grade.innerHTML = '';
    grade.className = ehImpostor ? 'grade-cartas-9 modo-impostor' : 'grade-cartas-9 modo-aliado';

    grade9Cartas.forEach(item => {
        const card = document.createElement('div');
        card.className = 'mini-carta';

        if (!ehImpostor && item.id === cartaSecreta.id) {
            card.classList.add('carta-certa');
        }

        card.innerHTML = `
            <img src="${obterImagem(item)}" alt="${obterNome(item)}">
            <span class="nome-mini">${obterNome(item)}</span>
        `;

        grade.appendChild(card);
    });
}

function configurarSlider() {
    const trilha = document.getElementById('slider-trilha');
    const botao = document.getElementById('slider-botao');
    const progresso = document.getElementById('slider-progresso');

    let arrastando = false;
    let inicioX = 0;

    const iniciarArraste = (clientX) => {
        if (cartaReveladaNoTurno) return;
        arrastando = true;
        inicioX = clientX - botao.offsetLeft;
        botao.style.transition = 'none';
        progresso.style.transition = 'none';
    };

    const moverArraste = (clientX) => {
        if (!arrastando || cartaReveladaNoTurno) return;
        const maxDeslocamento = trilha.clientWidth - botao.offsetWidth - 8;
        let novoLeft = clientX - inicioX;

        if (novoLeft < 4) novoLeft = 4;
        if (novoLeft > maxDeslocamento) novoLeft = maxDeslocamento;

        botao.style.left = `${novoLeft}px`;
        const percentual = ((novoLeft - 4) / (maxDeslocamento - 4)) * 100;
        progresso.style.width = `${Math.min(100, Math.max(0, percentual))}%`;

        if (percentual >= 88) {
            arrastando = false;
            completarRevelacao();
        }
    };

    const finalizarArraste = () => {
        if (!arrastando || cartaReveladaNoTurno) return;
        arrastando = false;
        resetarSlider();
    };

    botao.addEventListener('mousedown', (e) => iniciarArraste(e.clientX));
    window.addEventListener('mousemove', (e) => moverArraste(e.clientX));
    window.addEventListener('mouseup', finalizarArraste);

    botao.addEventListener('touchstart', (e) => iniciarArraste(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchmove', (e) => moverArraste(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchend', finalizarArraste);
}

function resetarSlider() {
    const botao = document.getElementById('slider-botao');
    const progresso = document.getElementById('slider-progresso');

    botao.style.transition = 'left 0.25s ease';
    progresso.style.transition = 'width 0.25s ease';
    botao.style.left = '4px';
    progresso.style.width = '0%';
}

function completarRevelacao() {
    cartaReveladaNoTurno = true;
    const ehImpostor = indiceEntregaAtual === indiceImpostor;

    document.getElementById('cobertura-grade').classList.add('revelada');
    document.getElementById('wrapper-slider').style.display = 'none';
    document.getElementById('btn-proximo-entrega').style.display = 'block';

    aplicarTemaPapel('aliado');

    const badgePapel = document.getElementById('badge-papel');
    if (ehImpostor) {
        badgePapel.innerText = 'IMPOSTOR';
        badgePapel.className = 'badge-papel impostor';
    } else {
        badgePapel.innerText = 'ALIADO';
        badgePapel.className = 'badge-papel aliado';
    }
}

function avancarEntrega() {
    document.getElementById('cobertura-grade').classList.remove('revelada');
    aplicarTemaPapel(null);

    if (indiceEntregaAtual < jogadoresPartida.length - 1) {
        indiceEntregaAtual++;
        prepararTurnoEntrega();
    } else {
        document.getElementById('debate-primeiro-jogador').innerText = jogadoresPartida[indicePrimeiroDebate];
        mostrarTela('tela-debate');
    }
}

function iniciarFaseVotacao() {
    indiceVotacaoAtual = 0;
    votosRecebidos = new Array(jogadoresPartida.length).fill(0);
    prepararTurnoVotacao();
    mostrarTela('tela-votacao');
}

function prepararTurnoVotacao() {
    candidatoSelecionado = null;
    const total = jogadoresPartida.length;
    const nomeEleitor = jogadoresPartida[indiceVotacaoAtual];

    document.getElementById('votacao-progresso').innerText = `VOTO ${indiceVotacaoAtual + 1} de ${total}`;
    document.getElementById('votacao-nome-eleitor').innerText = nomeEleitor;
    document.getElementById('votacao-subtitulo').innerText = `Passe o aparelho para ${nomeEleitor} votar`;

    document.getElementById('votacao-passo-passe').style.display = 'flex';
    document.getElementById('votacao-passo-lista').style.display = 'none';
}

function abrirOpcoesVoto() {
    const nomeEleitor = jogadoresPartida[indiceVotacaoAtual];
    document.getElementById('votacao-subtitulo').innerText = `${nomeEleitor}, quem é o Goblin Espião?`;

    document.getElementById('votacao-passo-passe').style.display = 'none';
    document.getElementById('votacao-passo-lista').style.display = 'flex';

    const container = document.getElementById('lista-candidatos-voto');
    container.innerHTML = '';

    const btnConfirmar = document.getElementById('btn-confirmar-voto');
    btnConfirmar.disabled = true;

    jogadoresPartida.forEach((nome, index) => {
        if (index === indiceVotacaoAtual) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-candidato';
        btn.innerText = nome;
        btn.onclick = () => {
            document.querySelectorAll('.btn-candidato').forEach(b => b.classList.remove('selecionado'));
            btn.classList.add('selecionado');
            candidatoSelecionado = index;
            btnConfirmar.disabled = false;
        };

        container.appendChild(btn);
    });
}

function confirmarVotoAtual() {
    if (candidatoSelecionado === null) return;

    votosRecebidos[candidatoSelecionado] += 1;

    if (indiceVotacaoAtual < jogadoresPartida.length - 1) {
        indiceVotacaoAtual++;
        prepararTurnoVotacao();
    } else {
        exibirApuracaoVotos();
    }
}

function exibirApuracaoVotos() {
    const ranking = jogadoresPartida.map((nome, index) => ({
        index,
        nome,
        votos: votosRecebidos[index]
    })).sort((a, b) => b.votos - a.votos);

    const maiorVotacao = ranking[0].votos;
    const empatadosNoTopo = ranking.filter(item => item.votos === maiorVotacao);

    impostorFoiDescoberto = (empatadosNoTopo.length === 1 && empatadosNoTopo[0].index === indiceImpostor);

    const containerLista = document.getElementById('lista-resultado-votos');
    containerLista.innerHTML = '';

    ranking.forEach(item => {
        const linha = document.createElement('div');
        linha.className = 'linha-apuracao';
        if (item.votos === maiorVotacao && maiorVotacao > 0) {
            linha.classList.add('mais-votado');
        }

        const labelVoto = item.votos === 1 ? '1 voto' : `${item.votos} votos`;
        linha.innerHTML = `
            <span>${item.nome}</span>
            <span class="qtd-votos-badge">${labelVoto}</span>
        `;
        containerLista.appendChild(linha);
    });

    const boxVeredito = document.getElementById('box-veredito-votacao');
    const btnAcao = document.getElementById('btn-acao-apuracao');
    const nomeImpostor = jogadoresPartida[indiceImpostor];

    if (impostorFoiDescoberto) {
        aplicarTemaPapel('aliado');
        boxVeredito.className = 'box-veredito descoberto';
        boxVeredito.innerHTML = `<strong>${nomeImpostor}</strong> era o IMPOSTOR e foi descoberto! Mas ele ainda tem uma última chance...`;
        btnAcao.className = 'btn-supercell btn-votar-acao btn-full';
        btnAcao.innerText = 'CHANCE DO IMPOSTOR 🎯';
    } else {
        aplicarTemaPapel('impostor');
        boxVeredito.className = 'box-veredito escapou';
        const motivo = empatadosNoTopo.length > 1 ? 'Houve empate na votação!' : 'Votaram na pessoa errada!';
        boxVeredito.innerHTML = `${motivo} <strong>${nomeImpostor}</strong> era o IMPOSTOR e escapou!`;
        btnAcao.className = 'btn-supercell btn-iniciar btn-full';
        btnAcao.innerText = 'VER RESULTADO FINAL 🏆';
    }

    mostrarTela('tela-apuracao');
}

function acaoPosApuracao() {
    if (impostorFoiDescoberto) {
        prepararGolpeFinal();
        mostrarTela('tela-golpe-final');
    } else {
        mostrarTelaResultado('impostor');
    }
}

function prepararGolpeFinal() {
    cartaEscolhidaGolpe = null;
    aplicarTemaPapel('impostor');

    document.getElementById('golpe-nome-impostor').innerText = jogadoresPartida[indiceImpostor];
    const btnConfirmar = document.getElementById('btn-confirmar-golpe');
    btnConfirmar.disabled = true;

    const grade = document.getElementById('grade-golpe-final');
    grade.innerHTML = '';

    grade9Cartas.forEach(item => {
        const card = document.createElement('div');
        card.className = 'mini-carta';
        card.innerHTML = `
            <img src="${obterImagem(item)}" alt="${obterNome(item)}">
            <span class="nome-mini">${obterNome(item)}</span>
        `;

        card.onclick = () => {
            document.querySelectorAll('#grade-golpe-final .mini-carta').forEach(c => c.classList.remove('selecionada-golpe'));
            card.classList.add('selecionada-golpe');
            cartaEscolhidaGolpe = item;
            btnConfirmar.disabled = false;
        };

        grade.appendChild(card);
    });
}

function confirmarGolpeFinal() {
    if (!cartaEscolhidaGolpe) return;

    if (cartaEscolhidaGolpe.id === cartaSecreta.id) {
        mostrarTelaResultado('todos');
    } else {
        mostrarTelaResultado('aliados');
    }
}

function mostrarTelaResultado(vencedor) {
    const titulo = document.getElementById('resultado-titulo-principal');
    const subtitulo = document.getElementById('resultado-subtitulo');
    const nomeImpostorEl = document.getElementById('resultado-nome-impostor');

    nomeImpostorEl.innerText = jogadoresPartida[indiceImpostor];

    if (vencedor === 'todos') {
        aplicarTemaPapel('aliado');
        titulo.style.color = 'var(--dourado)';
        titulo.innerText = '🏆 TODOS VENCERAM! 🏆';
        subtitulo.innerText = 'O Impostor foi descoberto, mas identificou a carta secreta!';
    } else if (vencedor === 'aliados') {
        aplicarTemaPapel('aliado');
        titulo.style.color = '#4da6ff';
        titulo.innerText = '🛡️ VITÓRIA DOS ALIADOS! 🛡️';
        subtitulo.innerText = 'O Impostor foi descoberto e errou a carta secreta!';
    } else {
        aplicarTemaPapel('impostor');
        titulo.style.color = '#ff4d4d';
        titulo.innerText = '🕵️ VITÓRIA DO IMPOSTOR! 🕵️';
        subtitulo.innerText = 'O Goblin Espião enganou a arena e não foi removido!';
    }

    const showcase = document.getElementById('showcase-carta-final');
    if (universoAtual === 'brawl') {
        showcase.classList.add('quadrada');
    } else {
        showcase.classList.remove('quadrada');
    }

    document.getElementById('img-carta-secreta-final').src = obterImagem(cartaSecreta);
    document.getElementById('nome-carta-secreta-final').innerText = obterNome(cartaSecreta);

    mostrarTela('tela-resultado');
}

function jogarNovamente() {
    aplicarTemaPapel(null);
    renderizarInputsJogadores();
    mostrarTela('tela-config');
}
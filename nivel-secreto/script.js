let todasAsCartasClash = [];
let todosOsBrawlers = [];

let universoAtual = 'clash';
let nomesJogadores = ['', '', ''];
let rodadasJogadores = [];
let indiceTurnoAtual = 0;

let notaReveladaNoTurno = false;
let cartaSelecionadaNoTurno = '';

let arrastandoCobertura = false;
let inicioY = 0;
let deslocamentoAtualY = 0;

let indiceItemArrastado = null;

window.onload = async () => {
    renderizarInputsJogadores();

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

    configurarEventosCobertura();
};

function obterNomesUnicosDisponiveis() {
    const base = universoAtual === 'clash' ? todasAsCartasClash : todosOsBrawlers;
    const mapa = new Map();

    base.forEach(item => {
        const nome = (universoAtual === 'clash' && item.name_pt) ? item.name_pt : (item.name || '');
        const limpo = nome.trim();
        if (limpo !== '' && !mapa.has(limpo.toLowerCase())) {
            mapa.set(limpo.toLowerCase(), limpo);
        }
    });

    return Array.from(mapa.values()).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function mostrarTela(idTela) {
    document.querySelectorAll('.screen').forEach(tela => tela.classList.remove('active'));
    document.getElementById(idTela).classList.add('active');
}

function selecionarUniverso(universo) {
    universoAtual = universo;
    document.getElementById('btn-uni-clash').classList.remove('active');
    document.getElementById('btn-uni-brawl').classList.remove('active');
    document.getElementById(`btn-uni-${universo}`).classList.add('active');
    validarJogadores();
}

function renderizarInputsJogadores() {
    const container = document.getElementById('lista-inputs-jogadores');
    container.innerHTML = '';

    nomesJogadores.forEach((nome, index) => {
        const linha = document.createElement('div');
        linha.className = 'linha-jogador-input';

        const badge = document.createElement('span');
        badge.className = 'numero-jogador-badge';
        badge.innerText = `${index + 1}º`;

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Nome do ${index + 1}º jogador...`;
        input.value = nome;
        input.maxLength = 18;
        input.autocomplete = 'off';
        input.oninput = (e) => {
            nomesJogadores[index] = e.target.value;
            validarJogadores();
        };

        linha.appendChild(badge);
        linha.appendChild(input);

        if (nomesJogadores.length > 3) {
            const btnRemover = document.createElement('button');
            btnRemover.type = 'button';
            btnRemover.className = 'btn-remover-jogador';
            btnRemover.innerText = '✖';
            btnRemover.onclick = () => removerCampoJogador(index);
            linha.appendChild(btnRemover);
        }

        container.appendChild(linha);
    });

    const btnAdd = document.getElementById('btn-add-jogador');
    btnAdd.disabled = nomesJogadores.length >= 10;
    validarJogadores();
}

function adicionarCampoJogador() {
    if (nomesJogadores.length >= 10) return;
    nomesJogadores.push('');
    renderizarInputsJogadores();
}

function removerCampoJogador(index) {
    if (nomesJogadores.length <= 3) return;
    nomesJogadores.splice(index, 1);
    renderizarInputsJogadores();
}

function validarJogadores() {
    const erroBox = document.getElementById('erro-jogadores');
    const btnJogar = document.getElementById('btn-jogar');
    const limpos = nomesJogadores.map(n => n.trim());

    if (limpos.some(n => n === '')) {
        erroBox.style.display = 'none';
        btnJogar.disabled = true;
        return false;
    }

    const unicos = new Set(limpos.map(n => n.toLowerCase()));
    if (unicos.size !== limpos.length) {
        erroBox.innerText = 'Não pode haver jogadores com nomes iguais!';
        erroBox.style.display = 'block';
        btnJogar.disabled = true;
        return false;
    }

    erroBox.style.display = 'none';
    btnJogar.disabled = false;
    return true;
}

function gerarNotasUnicas(quantidade) {
    const notas = new Set();
    while (notas.size < quantidade) {
        notas.add(Math.floor(Math.random() * 100) + 1);
    }
    return Array.from(notas);
}

function iniciarPartida() {
    if (!validarJogadores()) return;

    const listaBase = obterNomesUnicosDisponiveis();
    if (listaBase.length < nomesJogadores.length) {
        alert('Aguarde o carregamento das cartas e tente novamente.');
        return;
    }

    const notasSorteadas = gerarNotasUnicas(nomesJogadores.length);
    rodadasJogadores = nomesJogadores.map((nome, idx) => ({
        jogador: nome.trim(),
        nota: notasSorteadas[idx],
        carta: ''
    }));

    indiceTurnoAtual = 0;
    abrirTurnoAtual();
}

function abrirTurnoAtual() {
    const total = rodadasJogadores.length;
    const atual = rodadasJogadores[indiceTurnoAtual];

    notaReveladaNoTurno = false;
    cartaSelecionadaNoTurno = '';

    document.getElementById('turno-progresso').innerText = `JOGADOR ${indiceTurnoAtual + 1} de ${total}`;
    document.getElementById('turno-nome-jogador').innerText = atual.jogador;
    document.getElementById('valor-nota-secreta').innerText = atual.nota;

    const cobertura = document.getElementById('cobertura-deslizante');
    cobertura.style.transition = 'none';
    cobertura.style.transform = 'translateY(0px)';
    deslocamentoAtualY = 0;

    const inputBusca = document.getElementById('input-busca-carta');
    inputBusca.value = '';
    inputBusca.disabled = true;

    const listaSug = document.getElementById('lista-sugestoes');
    listaSug.innerHTML = '';
    listaSug.classList.remove('aberta');

    document.getElementById('texto-carta-escolhida').innerText = '-';

    const btnProximo = document.getElementById('btn-proximo-jogador');
    btnProximo.disabled = true;
    btnProximo.innerText = indiceTurnoAtual === total - 1 ? 'IR PARA ORDENAÇÃO ➡️' : 'PASSAR PARA O PRÓXIMO ➡️';

    mostrarTela('tela-turno');
}

function configurarEventosCobertura() {
    const cobertura = document.getElementById('cobertura-deslizante');

    const iniciarArraste = (clientY) => {
        arrastandoCobertura = true;
        inicioY = clientY - deslocamentoAtualY;
        cobertura.style.transition = 'none';
    };

    const moverArraste = (clientY) => {
        if (!arrastandoCobertura) return;
        const delta = clientY - inicioY;
        const limite = -cobertura.offsetHeight;
        deslocamentoAtualY = Math.max(limite, Math.min(0, delta));
        cobertura.style.transform = `translateY(${deslocamentoAtualY}px)`;

        if (Math.abs(deslocamentoAtualY) > cobertura.offsetHeight * 0.42 && !notaReveladaNoTurno) {
            notaReveladaNoTurno = true;
            document.getElementById('input-busca-carta').disabled = false;
        }
    };

    const finalizarArraste = () => {
        if (!arrastandoCobertura) return;
        arrastandoCobertura = false;
        cobertura.style.transition = 'transform 0.25s ease-out';

        if (Math.abs(deslocamentoAtualY) > cobertura.offsetHeight * 0.42) {
            deslocamentoAtualY = -cobertura.offsetHeight;
            notaReveladaNoTurno = true;
            document.getElementById('input-busca-carta').disabled = false;
        } else {
            deslocamentoAtualY = 0;
        }
        cobertura.style.transform = `translateY(${deslocamentoAtualY}px)`;
    };

    cobertura.addEventListener('touchstart', (e) => iniciarArraste(e.touches[0].clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
        if (arrastandoCobertura) moverArraste(e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchend', finalizarArraste);

    cobertura.addEventListener('mousedown', (e) => iniciarArraste(e.clientY));
    window.addEventListener('mousemove', (e) => {
        if (arrastandoCobertura) moverArraste(e.clientY);
    });
    window.addEventListener('mouseup', finalizarArraste);
}

function normalizarTexto(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function filtrarSugestoes() {
    const input = document.getElementById('input-busca-carta');
    const listaSug = document.getElementById('lista-sugestoes');
    const termo = normalizarTexto(input.value);

    cartaSelecionadaNoTurno = '';
    document.getElementById('texto-carta-escolhida').innerText = '-';
    document.getElementById('btn-proximo-jogador').disabled = true;

    if (termo.length < 2) {
        listaSug.innerHTML = '';
        listaSug.classList.remove('aberta');
        return;
    }

    const jaEscolhidas = new Set(
        rodadasJogadores
            .slice(0, indiceTurnoAtual)
            .map(r => r.carta.toLowerCase())
    );

    const todasOpcoes = obterNomesUnicosDisponiveis();
    const filtradas = todasOpcoes.filter(nome => normalizarTexto(nome).includes(termo));

    listaSug.innerHTML = '';

    if (filtradas.length === 0) {
        listaSug.classList.remove('aberta');
        return;
    }

    filtradas.forEach(nome => {
        const div = document.createElement('div');
        div.className = 'item-sugestao';
        const bloqueada = jaEscolhidas.has(nome.toLowerCase());

        if (bloqueada) {
            div.classList.add('bloqueada');
            div.innerHTML = `<span>${nome}</span><span class="tag-bloqueada">JÁ ESCOLHIDA</span>`;
        } else {
            div.innerHTML = `<span>${nome}</span>`;
            div.onclick = () => selecionarCartaSugerida(nome);
        }

        listaSug.appendChild(div);
    });

    listaSug.classList.add('aberta');
}

function selecionarCartaSugerida(nomeCarta) {
    cartaSelecionadaNoTurno = nomeCarta;
    document.getElementById('input-busca-carta').value = nomeCarta;
    document.getElementById('texto-carta-escolhida').innerText = nomeCarta;

    const listaSug = document.getElementById('lista-sugestoes');
    listaSug.innerHTML = '';
    listaSug.classList.remove('aberta');

    document.getElementById('btn-proximo-jogador').disabled = false;
}

function confirmarEscolhaJogador() {
    if (!notaReveladaNoTurno || cartaSelecionadaNoTurno === '') return;

    rodadasJogadores[indiceTurnoAtual].carta = cartaSelecionadaNoTurno;
    indiceTurnoAtual++;

    if (indiceTurnoAtual < rodadasJogadores.length) {
        document.getElementById('passe-nome-proximo').innerText = rodadasJogadores[indiceTurnoAtual].jogador;
        mostrarTela('tela-passe');
    } else {
        abrirTelaOrdenacao();
    }
}

function abrirTelaOrdenacao() {
    renderizarListaOrdenacao();
    mostrarTela('tela-ordenar');
}

function renderizarListaOrdenacao() {
    const container = document.getElementById('lista-arrastavel');
    container.innerHTML = '';

    rodadasJogadores.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'item-ordenacao';
        card.dataset.index = index;

        card.innerHTML = `
            <div class="info-esquerda-item">
                <span class="posicao-badge-item">${index + 1}º</span>
                <div class="textos-item-ordenacao">
                    <span class="carta-item-nome">${item.carta}</span>
                    <span class="autor-item-nome">por ${item.jogador}</span>
                </div>
            </div>
            <div class="controles-mover-item">
                <button type="button" class="btn-seta-ordem" ${index === 0 ? 'disabled' : ''} onclick="moverItemPosicao(${index}, -1)">▲</button>
                <button type="button" class="btn-seta-ordem" ${index === rodadasJogadores.length - 1 ? 'disabled' : ''} onclick="moverItemPosicao(${index}, 1)">▼</button>
                <span class="icone-arraste-grip">☰</span>
            </div>
        `;

        configurarArrasteItemLista(card, index);
        container.appendChild(card);
    });
}

function moverItemPosicao(index, direcao) {
    const novoIndex = index + direcao;
    if (novoIndex < 0 || novoIndex >= rodadasJogadores.length) return;

    const temp = rodadasJogadores[index];
    rodadasJogadores[index] = rodadasJogadores[novoIndex];
    rodadasJogadores[novoIndex] = temp;

    renderizarListaOrdenacao();
}

function configurarArrasteItemLista(elemento, index) {
    elemento.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button')) return;

        indiceItemArrastado = index;
        elemento.classList.add('arrastando');
        elemento.setPointerCapture(e.pointerId);

        const onPointerMove = (moveEvent) => {
            if (indiceItemArrastado === null) return;
            const itens = Array.from(document.querySelectorAll('.item-ordenacao'));

            for (let i = 0; i < itens.length; i++) {
                if (i === indiceItemArrastado) continue;
                const rect = itens[i].getBoundingClientRect();
                const centroY = rect.top + rect.height / 2;

                if (
                    (indiceItemArrastado < i && moveEvent.clientY > centroY) ||
                    (indiceItemArrastado > i && moveEvent.clientY < centroY)
                ) {
                    const movido = rodadasJogadores.splice(indiceItemArrastado, 1)[0];
                    rodadasJogadores.splice(i, 0, movido);
                    indiceItemArrastado = i;
                    atualizarDomDuranteArraste();
                    break;
                }
            }
        };

        const onPointerUp = () => {
            elemento.removeEventListener('pointermove', onPointerMove);
            elemento.removeEventListener('pointerup', onPointerUp);
            elemento.removeEventListener('pointercancel', onPointerUp);
            indiceItemArrastado = null;
            renderizarListaOrdenacao();
        };

        elemento.addEventListener('pointermove', onPointerMove);
        elemento.addEventListener('pointerup', onPointerUp);
        elemento.addEventListener('pointercancel', onPointerUp);
    });
}

function atualizarDomDuranteArraste() {
    const container = document.getElementById('lista-arrastavel');
    const itensDom = Array.from(container.children);

    rodadasJogadores.forEach((item, idx) => {
        const el = itensDom[idx];
        if (!el) return;
        el.dataset.index = idx;
        el.querySelector('.posicao-badge-item').innerText = `${idx + 1}º`;
        el.querySelector('.carta-item-nome').innerText = item.carta;
        el.querySelector('.autor-item-nome').innerText = `por ${item.jogador}`;
        el.classList.toggle('arrastando', idx === indiceItemArrastado);
    });
}

function finalizarOrdenacao() {
    const ordemCorreta = [...rodadasJogadores].sort((a, b) => a.nota - b.nota);

    let venceu = true;
    for (let i = 0; i < rodadasJogadores.length; i++) {
        if (rodadasJogadores[i].nota !== ordemCorreta[i].nota) {
            venceu = false;
            break;
        }
    }

    const titulo = document.getElementById('resultado-titulo');
    const subtitulo = document.getElementById('resultado-subtitulo');

    if (venceu) {
        titulo.innerText = '👑 VITÓRIA DA EQUIPE! 👑';
        titulo.style.color = '#69f0ae';
        subtitulo.innerText = 'Ordem crescente perfeita do menor para o maior!';
    } else {
        titulo.innerText = '💥 ORDEM INCORRETA! 💥';
        titulo.style.color = '#ff5252';
        subtitulo.innerText = 'Algumas cartas ficaram fora da sequência!';
    }

    const colGrupo = document.getElementById('coluna-ordem-grupo');
    const colCorreta = document.getElementById('coluna-ordem-correta');
    colGrupo.innerHTML = '';
    colCorreta.innerHTML = '';

    rodadasJogadores.forEach((item, idx) => {
        const acertouPosicao = item.nota === ordemCorreta[idx].nota;
        const linha = document.createElement('div');
        linha.className = `linha-comparativo ${acertouPosicao ? 'acerto' : 'erro'}`;
        linha.innerHTML = `
            <div class="dados-linha-comp">
                <span class="carta-comp">${idx + 1}º ${item.carta}</span>
                <span class="jogador-comp">${item.jogador}</span>
            </div>
            <span class="badge-nota-comp">${item.nota}</span>
        `;
        colGrupo.appendChild(linha);
    });

    ordemCorreta.forEach((item, idx) => {
        const linha = document.createElement('div');
        linha.className = 'linha-comparativo gabarito';
        linha.innerHTML = `
            <div class="dados-linha-comp">
                <span class="carta-comp">${idx + 1}º ${item.carta}</span>
                <span class="jogador-comp">${item.jogador}</span>
            </div>
            <span class="badge-nota-comp">${item.nota}</span>
        `;
        colCorreta.appendChild(linha);
    });

    mostrarTela('tela-resultado');
}

function jogarNovamente() {
    renderizarInputsJogadores();
    mostrarTela('tela-config');
}
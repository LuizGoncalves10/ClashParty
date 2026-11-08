// VARIÁVEIS GLOBAIS DE ESTADO
let todasAsCartas = [];
let cartasDoJogo = [];
let reis = { azul: '', vermelho: '' };
let estado = {
    azul: { secreta: null, descartadas: new Set() },
    vermelho: { secreta: null, descartadas: new Set() }
};

let faseAtual = ''; // 'selecaoAzul', 'selecaoVermelho', 'turno'
let turnoAtual = 'azul'; 
let modoAcao = 'descartar'; // 'descartar' ou 'chutar'
let cartasSelecionadas = new Set();
let acaoPendenciaAviso = null; // Guarda o que fazer quando apertar "OK" no aviso

// FUNÇÕES DE UTILIDADE E INICIALIZAÇÃO
window.onload = async () => {
    try {
        const response = await fetch('../todas_as_cartas.json');
        const data = await response.json();
        // Garante que funciona tanto se o JSON for um array direto ou um objeto { items: [...] }
        todasAsCartas = data.items ? data.items : data; 
    } catch (error) {
        console.error("Erro ao carregar JSON das cartas:", error);
    }
};

function embaralhar(array) {
    let arrayCopia = [...array];
    for (let i = arrayCopia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayCopia[i], arrayCopia[j]] = [arrayCopia[j], arrayCopia[i]];
    }
    return arrayCopia;
}

function obterImagem(carta) {
    // RESOLVIDO: Usa a propriedade "key" (ex: "knight") do seu JSON 
    // para puxar a imagem exata do CDN de assets do Clash Royale!
    if (carta.key) {
        return `https://royaleapi.github.io/cr-api-assets/cards/${carta.key}.png`;
    }
    // Fallback de segurança
    if (carta.iconUrls && carta.iconUrls.medium) return carta.iconUrls.medium;
    return ''; 
}

function mostrarTela(idTela) {
    document.querySelectorAll('.screen').forEach(t => t.classList.remove('active'));
    document.getElementById(idTela).classList.add('active');
}

function aplicarTema(cor) {
    document.body.classList.remove('tema-azul', 'tema-vermelho');
    if (cor) document.body.classList.add(`tema-${cor}`);
}

// ----------------------------------------------------
// PASSO 1: INICIAR (Grava Nomes e Sorteia 30)
// ----------------------------------------------------
function iniciarJogo() {
    reis.azul = document.getElementById('nome-azul').value.trim();
    reis.vermelho = document.getElementById('nome-vermelho').value.trim();

    if (reis.azul === '' || reis.vermelho === '') {
        document.getElementById('erro-nomes').style.display = 'block';
        return;
    }

    if (todasAsCartas.length < 30) {
        alert("Aguarde o carregamento das cartas ou verifique o arquivo JSON.");
        return;
    }

    // Sorteia as 30 cartas para o Duelo
    cartasDoJogo = embaralhar(todasAsCartas).slice(0, 30);
    
    // Inicia fluxo de Seleção Secreta
    prepararAviso('azul', 'Esconda a tela!', `Passe o celular para o(a) ${reis.azul} e não olhe!`, iniciarSelecaoSecreta);
}

// ----------------------------------------------------
// TELAS DE AVISO (Passar Celular)
// ----------------------------------------------------
function prepararAviso(corTema, titulo, texto, callback) {
    aplicarTema(corTema);
    document.getElementById('aviso-titulo').innerText = titulo;
    document.getElementById('aviso-texto').innerText = texto;
    acaoPendenciaAviso = callback;
    mostrarTela('tela-aviso');
}

function avisoOk() {
    if (acaoPendenciaAviso) acaoPendenciaAviso();
}

// ----------------------------------------------------
// SELEÇÃO DAS CARTAS SECRETAS
// ----------------------------------------------------
function iniciarSelecaoSecreta() {
    faseAtual = (estado.azul.secreta === null) ? 'selecaoAzul' : 'selecaoVermelho';
    turnoAtual = (faseAtual === 'selecaoAzul') ? 'azul' : 'vermelho';
    
    document.getElementById('selecao-titulo').innerText = `Rei ${turnoAtual === 'azul' ? 'Azul' : 'Vermelho'}, escolha sua carta!`;
    cartasSelecionadas.clear();
    
    renderizarGridSelecao();
    mostrarTela('tela-selecao');
}

function renderizarGridSelecao() {
    const grid = document.getElementById('selecao-grid');
    grid.innerHTML = '';
    
    cartasDoJogo.forEach(carta => {
        const div = document.createElement('div');
        div.className = `carta ${cartasSelecionadas.has(carta.id) ? 'selecionada' : ''}`;
        div.onclick = () => {
            cartasSelecionadas.clear(); // Na seleção, só escolhe 1
            cartasSelecionadas.add(carta.id);
            renderizarGridSelecao();
            document.getElementById('btn-confirmar-secreta').disabled = false;
        };

        const img = document.createElement('img');
        img.src = obterImagem(carta);
        div.appendChild(img);
        grid.appendChild(div);
    });
}

function confirmarSecreta() {
    const cartaEscolhidaId = Array.from(cartasSelecionadas)[0];
    const cartaObj = cartasDoJogo.find(c => c.id === cartaEscolhidaId);

    if (turnoAtual === 'azul') {
        estado.azul.secreta = cartaObj;
        prepararAviso('vermelho', 'Sua vez!', `Passe o celular para o(a) ${reis.vermelho} e não olhe!`, iniciarSelecaoSecreta);
    } else {
        estado.vermelho.secreta = cartaObj;
        // Ambas escolhidas, começar o jogo!
        turnoAtual = 'azul'; // Azul sempre começa
        prepararAviso('azul', 'Que comece o duelo!', `Celular com o(a) ${reis.azul}. Prepare-se!`, iniciarTurnoTabuleiro);
    }
}

// ----------------------------------------------------
// O JOGO (TABULEIRO)
// ----------------------------------------------------
function iniciarTurnoTabuleiro() {
    aplicarTema(turnoAtual);
    document.getElementById('tabuleiro-titulo').innerText = `Turno: ${turnoAtual === 'azul' ? reis.azul : reis.vermelho}`;
    cartasSelecionadas.clear();
    mudarModo('descartar'); // Volta para descarte por padrão
    mostrarTela('tela-tabuleiro');
}

function mudarModo(novoModo) {
    modoAcao = novoModo;
    cartasSelecionadas.clear();
    
    document.getElementById('btn-modo-descarte').classList.remove('active');
    document.getElementById('btn-modo-chute').classList.remove('active');
    
    document.getElementById('tabuleiro-grid').className = `tabuleiro-grid modo-${modoAcao}`;

    if (modoAcao === 'descartar') {
        document.getElementById('btn-modo-descarte').classList.add('active');
        document.getElementById('instrucao-acao').innerText = "Selecione as cartas que deseja excluir.";
    } else {
        document.getElementById('btn-modo-chute').classList.add('active');
        document.getElementById('instrucao-acao').innerText = "Arrisque! Escolha UMA carta (pode ser uma já descartada).";
    }
    
    renderizarTabuleiro();
}

function renderizarTabuleiro() {
    const grid = document.getElementById('tabuleiro-grid');
    grid.innerHTML = '';
    
    const descartadasDoTurno = estado[turnoAtual].descartadas;

    cartasDoJogo.forEach(carta => {
        const div = document.createElement('div');
        const isDescartada = descartadasDoTurno.has(carta.id);
        const isSelecionada = cartasSelecionadas.has(carta.id);
        
        div.className = `carta ${isDescartada ? 'descartada' : ''} ${isSelecionada ? 'selecionada' : ''}`;
        
        div.onclick = () => cliqueCartaTabuleiro(carta.id, isDescartada);

        const img = document.createElement('img');
        img.src = obterImagem(carta);
        div.appendChild(img);
        grid.appendChild(div);
    });

    atualizarBotaoConfirmar();
}

function cliqueCartaTabuleiro(id, isDescartada) {
    if (modoAcao === 'descartar') {
        if (isDescartada) return; // Não pode re-descartar
        
        if (cartasSelecionadas.has(id)) {
            cartasSelecionadas.delete(id);
        } else {
            cartasSelecionadas.add(id);
        }
    } else if (modoAcao === 'chutar') {
        // No modo chute, limpa e escolhe apenas 1 (pode ser descartada)
        cartasSelecionadas.clear();
        cartasSelecionadas.add(id);
    }
    renderizarTabuleiro();
}

function atualizarBotaoConfirmar() {
    const btnConfirmar = document.getElementById('btn-confirmar-acao');
    const btnDescarte = document.getElementById('btn-modo-descarte');
    
    // Bloqueia o botão CONFIRMAR se nada foi selecionado
    btnConfirmar.disabled = cartasSelecionadas.size === 0;

    // Se o jogador já descartou quase tudo (sobrou 1 ou 0), bloqueia o botão DESCARTAR
    if (estado[turnoAtual].descartadas.size >= cartasDoJogo.length - 1) {
        btnDescarte.disabled = true;
        if (modoAcao === 'descartar') mudarModo('chutar'); // Força ele a chutar
    } else {
        btnDescarte.disabled = false;
    }
}

// Ação Final do Turno
function confirmarAcao() {
    if (modoAcao === 'descartar') {
        // Adiciona as cartas à lista de descartadas do Rei atual
        cartasSelecionadas.forEach(id => estado[turnoAtual].descartadas.add(id));
        passarTurno();
    } 
    else if (modoAcao === 'chutar') {
        const chuteId = Array.from(cartasSelecionadas)[0];
        const outroRei = turnoAtual === 'azul' ? 'vermelho' : 'azul';
        
        if (chuteId === estado[outroRei].secreta.id) {
            // Acertou!
            mostrarVitoria(turnoAtual);
        } else {
            // Errou! A carta que ele chutou fica escura pra ele no próximo turno (foi eliminada)
            estado[turnoAtual].descartadas.add(chuteId);
            passarTurno();
        }
    }
}

function passarTurno() {
    turnoAtual = (turnoAtual === 'azul') ? 'vermelho' : 'azul';
    const nomeProximo = turnoAtual === 'azul' ? reis.azul : reis.vermelho;
    prepararAviso(turnoAtual, 'Fim de turno', `Passe o celular para o(a) ${nomeProximo}`, iniciarTurnoTabuleiro);
}

// ----------------------------------------------------
// TELA DE CAMPEÃO
// ----------------------------------------------------
function mostrarVitoria(reiVencedor) {
    aplicarTema(reiVencedor); // A tela fica da cor do Rei que ganhou
    
    const nomeVencedor = reiVencedor === 'azul' ? reis.azul : reis.vermelho;
    document.getElementById('vitoria-nome').innerText = `Rei ${reiVencedor === 'azul' ? 'Azul' : 'Vermelho'} (${nomeVencedor})`;
    
    // Mostra as duas cartas
    document.getElementById('rev-nome-azul').innerText = reis.azul;
    document.getElementById('rev-img-azul').src = obterImagem(estado.azul.secreta);
    
    document.getElementById('rev-nome-vermelho').innerText = reis.vermelho;
    document.getElementById('rev-img-vermelho').src = obterImagem(estado.vermelho.secreta);

    mostrarTela('tela-vitoria');
}
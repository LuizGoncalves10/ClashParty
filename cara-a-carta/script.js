// VARIÁVEIS GLOBAIS DE ESTADO
let todasAsCartasClash = [];
let todosOsBrawlers = [];
let universoAtual = 'clash';
let personagensDoJogo = []; 

let jogadores = { azul: '', vermelho: '' };
let estado = {
    azul: { secreta: null, descartadas: new Set() },
    vermelho: { secreta: null, descartadas: new Set() }
};

let faseAtual = ''; 
let turnoAtual = 'azul'; 
let modoAcao = 'descartar'; 
let selecionadas = new Set();
let acaoPendenciaAviso = null; 

// CARREGAMENTO DOS DOIS JSONS
window.onload = async () => {
    try {
        const resClash = await fetch('../todas_as_cartas.json');
        const dataClash = await resClash.json();
        todasAsCartasClash = dataClash.items ? dataClash.items : dataClash; 

        const resBrawl = await fetch('../todos_os_brawlers.json');
        const dataBrawl = await resBrawl.json();
        todosOsBrawlers = dataBrawl.list ? dataBrawl.list : dataBrawl;
    } catch (error) {
        console.error("Erro ao carregar os arquivos JSON:", error);
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

function obterImagem(personagem) {
    if (universoAtual === 'brawl' && personagem.imageUrl) {
        return personagem.imageUrl;
    }
    if (personagem.key) {
        return `https://royaleapi.github.io/cr-api-assets/cards/${personagem.key}.png`;
    }
    if (personagem.iconUrls && personagem.iconUrls.medium) return personagem.iconUrls.medium;
    return ''; 
}

// NOVA FUNÇÃO: PRÉ-CARREGAMENTO DE IMAGENS NO CACHE
function precarregarImagens(personagens) {
    personagens.forEach(pers => {
        const imgPreload = new Image();
        imgPreload.src = obterImagem(pers);
    });
}

function selecionarUniverso(universo) {
    universoAtual = universo;
    
    document.getElementById('btn-uni-clash').classList.remove('active');
    document.getElementById('btn-uni-brawl').classList.remove('active');
    document.getElementById(`btn-uni-${universo}`).classList.add('active');

    const titulo = document.getElementById('titulo-registro');
    const label1 = document.getElementById('label-j1');
    const label2 = document.getElementById('label-j2');

    if (universo === 'clash') {
        titulo.innerText = "Registrar Reis";
        label1.innerText = "👑 Rei Azul (Jogador 1)";
        label2.innerText = "👑 Rei Vermelho (Jogador 2)";
    } else {
        titulo.innerText = "Registrar Brawlers";
        label1.innerText = "⭐ Brawler Azul (Jogador 1)";
        label2.innerText = "⭐ Brawler Vermelho (Jogador 2)";
    }
}

function obterTitulo() {
    return universoAtual === 'clash' ? 'Rei' : 'Brawler';
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
// PASSO 1: INICIAR
// ----------------------------------------------------
function iniciarJogo() {
    jogadores.azul = document.getElementById('nome-azul').value.trim();
    jogadores.vermelho = document.getElementById('nome-vermelho').value.trim();

    if (jogadores.azul === '' || jogadores.vermelho === '') {
        document.getElementById('erro-nomes').style.display = 'block';
        return;
    }

    const arrayBase = universoAtual === 'clash' ? todasAsCartasClash : todosOsBrawlers;

    if (arrayBase.length < 30) {
        alert("Aguarde o carregamento dos personagens ou verifique os arquivos JSON.");
        return;
    }

    personagensDoJogo = embaralhar(arrayBase).slice(0, 30);
    
    // ATIVA O PRÉ-CARREGAMENTO EM SEGUNDO PLANO
    precarregarImagens(personagensDoJogo);
    
    prepararAviso('azul', 'Esconda a tela!', `Passe o celular para o(a) ${jogadores.azul} e não olhe!`, iniciarSelecaoSecreta);
}

// ----------------------------------------------------
// TELAS DE AVISO E SELEÇÃO
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

function iniciarSelecaoSecreta() {
    faseAtual = (estado.azul.secreta === null) ? 'selecaoAzul' : 'selecaoVermelho';
    turnoAtual = (faseAtual === 'selecaoAzul') ? 'azul' : 'vermelho';
    
    document.getElementById('selecao-titulo').innerText = `${obterTitulo()} ${turnoAtual === 'azul' ? 'Azul' : 'Vermelho'}, escolha!`;
    selecionadas.clear();
    
    renderizarGridSelecao();
    mostrarTela('tela-selecao');
}

function renderizarGridSelecao() {
    const grid = document.getElementById('selecao-grid');
    grid.innerHTML = '';
    
    personagensDoJogo.forEach(pers => {
        const div = document.createElement('div');
        div.className = `carta ${selecionadas.has(pers.id) ? 'selecionada' : ''}`;
        
        if(universoAtual === 'brawl') div.style.aspectRatio = "1/1"; 

        div.onclick = () => {
            selecionadas.clear(); 
            selecionadas.add(pers.id);
            renderizarGridSelecao();
            document.getElementById('btn-confirmar-secreta').disabled = false;
        };

        const img = document.createElement('img');
        img.src = obterImagem(pers);
        div.appendChild(img);
        grid.appendChild(div);
    });
}

function confirmarSecreta() {
    const idEscolhido = Array.from(selecionadas)[0];
    const persObj = personagensDoJogo.find(c => c.id === idEscolhido);

    if (turnoAtual === 'azul') {
        estado.azul.secreta = persObj;
        prepararAviso('vermelho', 'Sua vez!', `Passe o celular para o(a) ${jogadores.vermelho} e não olhe!`, iniciarSelecaoSecreta);
    } else {
        estado.vermelho.secreta = persObj;
        turnoAtual = 'azul'; 
        prepararAviso('azul', 'Que comece o duelo!', `Celular com o(a) ${jogadores.azul}. Prepare-se!`, iniciarTurnoTabuleiro);
    }
}

// ----------------------------------------------------
// O JOGO (TABULEIRO)
// ----------------------------------------------------
function iniciarTurnoTabuleiro() {
    aplicarTema(turnoAtual);
    document.getElementById('tabuleiro-titulo').innerText = `Turno: ${turnoAtual === 'azul' ? jogadores.azul : jogadores.vermelho}`;
    selecionadas.clear();
    mudarModo('descartar'); 
    mostrarTela('tela-tabuleiro');
}

function mudarModo(novoModo) {
    modoAcao = novoModo;
    selecionadas.clear();
    
    document.getElementById('btn-modo-descarte').classList.remove('active');
    document.getElementById('btn-modo-chute').classList.remove('active');
    
    document.getElementById('tabuleiro-grid').className = `tabuleiro-grid modo-${modoAcao}`;

    if (modoAcao === 'descartar') {
        document.getElementById('btn-modo-descarte').classList.add('active');
        document.getElementById('instrucao-acao').innerText = "Selecione as opções que deseja excluir.";
    } else {
        document.getElementById('btn-modo-chute').classList.add('active');
        document.getElementById('instrucao-acao').innerText = "Arrisque! Escolha UM personagem.";
    }
    
    renderizarTabuleiro();
}

function renderizarTabuleiro() {
    const grid = document.getElementById('tabuleiro-grid');
    grid.innerHTML = '';
    
    const descartadasDoTurno = estado[turnoAtual].descartadas;

    personagensDoJogo.forEach(pers => {
        const div = document.createElement('div');
        const isDescartada = descartadasDoTurno.has(pers.id);
        const isSelecionada = selecionadas.has(pers.id);
        
        div.className = `carta ${isDescartada ? 'descartada' : ''} ${isSelecionada ? 'selecionada' : ''}`;
        if(universoAtual === 'brawl') div.style.aspectRatio = "1/1"; 
        
        div.onclick = () => cliqueCartaTabuleiro(pers.id, isDescartada);

        const img = document.createElement('img');
        img.src = obterImagem(pers);
        div.appendChild(img);
        grid.appendChild(div);
    });

    atualizarBotaoConfirmar();
}

function cliqueCartaTabuleiro(id, isDescartada) {
    if (modoAcao === 'descartar') {
        if (isDescartada) return; 
        if (selecionadas.has(id)) selecionadas.delete(id);
        else selecionadas.add(id);
    } else if (modoAcao === 'chutar') {
        selecionadas.clear();
        selecionadas.add(id);
    }
    renderizarTabuleiro();
}

function atualizarBotaoConfirmar() {
    const btnConfirmar = document.getElementById('btn-confirmar-acao');
    const btnDescarte = document.getElementById('btn-modo-descarte');
    
    btnConfirmar.disabled = selecionadas.size === 0;

    if (estado[turnoAtual].descartadas.size >= personagensDoJogo.length - 1) {
        btnDescarte.disabled = true;
        if (modoAcao === 'descartar') mudarModo('chutar');
    } else {
        btnDescarte.disabled = false;
    }
}

function confirmarAcao() {
    if (modoAcao === 'descartar') {
        selecionadas.forEach(id => estado[turnoAtual].descartadas.add(id));
        passarTurno();
    } 
    else if (modoAcao === 'chutar') {
        const chuteId = Array.from(selecionadas)[0];
        const outroJogador = turnoAtual === 'azul' ? 'vermelho' : 'azul';
        
        if (chuteId === estado[outroJogador].secreta.id) {
            mostrarVitoria(turnoAtual);
        } else {
            estado[turnoAtual].descartadas.add(chuteId);
            passarTurno();
        }
    }
}

function passarTurno() {
    turnoAtual = (turnoAtual === 'azul') ? 'vermelho' : 'azul';
    const nomeProximo = turnoAtual === 'azul' ? jogadores.azul : jogadores.vermelho;
    prepararAviso(turnoAtual, 'Fim de turno', `Passe o celular para o(a) ${nomeProximo}`, iniciarTurnoTabuleiro);
}

// ----------------------------------------------------
// TELA DE CAMPEÃO
// ----------------------------------------------------
function mostrarVitoria(vencedor) {
    aplicarTema(vencedor); 
    
    const nomeVencedor = vencedor === 'azul' ? jogadores.azul : jogadores.vermelho;
    document.getElementById('vitoria-nome').innerText = `${obterTitulo()} ${vencedor === 'azul' ? 'Azul' : 'Vermelho'} (${nomeVencedor})`;
    
    document.getElementById('rev-nome-azul').innerText = jogadores.azul;
    document.getElementById('rev-img-azul').src = obterImagem(estado.azul.secreta);
    
    document.getElementById('rev-nome-vermelho').innerText = jogadores.vermelho;
    document.getElementById('rev-img-vermelho').src = obterImagem(estado.vermelho.secreta);

    if(universoAtual === 'brawl') {
        document.getElementById('rev-img-azul').style.aspectRatio = "1/1";
        document.getElementById('rev-img-vermelho').style.aspectRatio = "1/1";
    }

    mostrarTela('tela-vitoria');
}
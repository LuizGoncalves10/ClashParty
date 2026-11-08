function lerJSON(chave, padrao) {
    try {
        const bruto = localStorage.getItem(chave);
        if (bruto === null) return padrao;
        const valor = JSON.parse(bruto);
        return valor === null ? padrao : valor;
    } catch (erro) {
        return padrao;
    }
}

const configs = lerJSON('draftRoyaleConfig', {});
const nomesJogadores = lerJSON('draftRoyaleNomes', []);
const escolhas = lerJSON('draftRoyaleCartasEscolhidas', {});
const casasTotal = Number(configs.casas) || 10;
const faseJogo = localStorage.getItem('draftRoyaleFase');
const modoEscolha = configs.modo === 'escolha';

const jogoValido = (faseJogo === 'tabuleiro' || faseJogo === 'escolhendo')
    && Array.isArray(nomesJogadores)
    && nomesJogadores.length > 0
    && nomesJogadores.every(nome => typeof escolhas[nome] === 'string' && escolhas[nome] !== "");

if (!jogoValido) {
    window.location.replace('tabuleiro.html');
}

let regras = { avanco: true, recuo: true, grupo: true };
let posicoes = {};
let liberouRecuo = false;
let fatias = [];
let cartasDosJogadores = [];
let girando = false;
let pendenteAtual = null;
let escolhaConfirmada = false;

function obterRegras() {
    let resultado = { avanco: true, recuo: true, grupo: true };

    if (Array.isArray(configs.tiposPergunta)) {
        resultado = {
            avanco: configs.tiposPergunta.includes('individual_avanco'),
            recuo: configs.tiposPergunta.includes('individual_recuo'),
            grupo: configs.tiposPergunta.includes('coletiva')
        };
    } else if (configs.regras && typeof configs.regras === 'object') {
        resultado = {
            avanco: configs.regras.avanco !== false,
            recuo: configs.regras.recuo !== false,
            grupo: configs.regras.grupo !== false
        };
    }

    if (!resultado.avanco && !resultado.grupo) {
        resultado.avanco = true;
    }
    return resultado;
}

function carregarPosicoes() {
    const salvas = lerJSON('draftRoyalePosicoes', {});
    const resultado = {};
    nomesJogadores.forEach(nome => {
        const valor = Number(salvas[nome]);
        resultado[nome] = Number.isFinite(valor) ? Math.max(0, Math.min(casasTotal, Math.round(valor))) : 0;
    });
    return resultado;
}

function obterIndiceVez() {
    const valor = parseInt(localStorage.getItem('draftRoyaleVez'), 10);
    if (!Number.isFinite(valor) || valor < 0) return 0;
    return valor % nomesJogadores.length;
}

function podeRecuar() {
    return regras.recuo && liberouRecuo;
}

function repetirFatia(tipo, quantidade) {
    return new Array(quantidade).fill(tipo);
}

function distribuicaoBase() {
    if (regras.avanco && regras.recuo && regras.grupo) {
        return [...repetirFatia('A', 4), ...repetirFatia('R', 2), ...repetirFatia('C', 4)];
    }
    if (regras.avanco && regras.grupo && !regras.recuo) {
        return [...repetirFatia('A', 6), ...repetirFatia('C', 4)];
    }
    if (regras.recuo && regras.grupo && !regras.avanco) {
        return [...repetirFatia('R', 2), ...repetirFatia('C', 8)];
    }
    if (regras.avanco && regras.recuo && !regras.grupo) {
        return [...repetirFatia('A', 8), ...repetirFatia('R', 2)];
    }
    if (regras.avanco) {
        return repetirFatia('A', 10);
    }
    return repetirFatia('C', 10);
}

function montarFatias() {
    let base = distribuicaoBase();
    if (!liberouRecuo) {
        const substituta = regras.avanco ? 'A' : 'C';
        base = base.map(fatia => fatia === 'R' ? substituta : fatia);
    }
    return embaralhar(base);
}

function embaralhar(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temporario = copia[i];
        copia[i] = copia[j];
        copia[j] = temporario;
    }
    return copia;
}

function chanceAvancoColetivo() {
    if (!podeRecuar()) return 1;
    return regras.avanco ? 0.625 : 0.8125;
}

function desenharRoda() {
    const roda = document.getElementById('roda');
    const passo = 360 / fatias.length;
    const cores = { A: '#4CAF50', R: '#F44336', C: '#2196F3' };
    const partes = fatias.map((tipo, indice) => `${cores[tipo]} ${indice * passo}deg ${(indice + 1) * passo}deg`);
    roda.style.background = `conic-gradient(from ${-passo / 2}deg, ${partes.join(', ')})`;
}

function pendenteEhValido(pendente) {
    if (!pendente || typeof pendente !== 'object') return false;
    if (!Array.isArray(pendente.fatias) || pendente.fatias.length === 0) return false;
    if (!Array.isArray(pendente.opcoes) || pendente.opcoes.length === 0) return false;
    if (typeof pendente.rotacao !== 'number' || typeof pendente.tipoFatia !== 'string') return false;
    if (!Number.isInteger(pendente.indiceVez) || typeof pendente.jogador !== 'string') return false;
    return pendente.opcoes.every(opcao => opcao
        && typeof opcao.texto === 'string'
        && Array.isArray(opcao.afetados)
        && (opcao.direcao === 'avanco' || opcao.direcao === 'recuo'));
}

function prepararRoleta() {
    regras = obterRegras();
    posicoes = carregarPosicoes();

    let progressoMaximo = 0;
    nomesJogadores.forEach(nome => {
        if (posicoes[nome] > progressoMaximo) progressoMaximo = posicoes[nome];
    });
    liberouRecuo = (progressoMaximo * 10) >= (casasTotal * 3);

    if (faseJogo === 'escolhendo') {
        const pendenteSalvo = lerJSON('draftRoyalePendente', null);
        if (modoEscolha && pendenteEhValido(pendenteSalvo)) {
            restaurarEscolha(pendenteSalvo);
            return;
        }
        localStorage.removeItem('draftRoyalePendente');
        localStorage.setItem('draftRoyaleFase', 'tabuleiro');
    }

    fatias = montarFatias();
    desenharRoda();
}

document.addEventListener("DOMContentLoaded", () => {
    if (!jogoValido) return;
    prepararRoleta();
});

async function carregarCartas() {
    if (cartasDosJogadores.length === nomesJogadores.length) return true;

    try {
        const resposta = await fetch('../../todas_as_cartas.json');
        if (!resposta.ok) return false;
        const dados = await resposta.json();
        const lista = [];

        for (const jogador of nomesJogadores) {
            const nomeCarta = escolhas[jogador];
            const candidatas = dados.filter(carta => (carta.name_pt || carta.name) === nomeCarta);
            const carta = candidatas.find(c => c.type && c.type.toLowerCase() === 'troop') || candidatas[0];
            if (!carta) return false;
            const cartaAjustada = typeof ajustarCartaParaPerguntas === 'function' ? ajustarCartaParaPerguntas(carta) : carta;
            lista.push({ jogador: jogador, carta: cartaAjustada });
        }

        cartasDosJogadores = lista;
        return true;
    } catch (erro) {
        return false;
    }
}

function camposNecessarios(pergunta) {
    const codigo = pergunta.checar.toString();
    const campos = new Set();
    const expressao = /(?:\bc|\.carta)\.([A-Za-z_][A-Za-z0-9_]*)/g;
    let correspondencia;
    while ((correspondencia = expressao.exec(codigo)) !== null) {
        campos.add(correspondencia[1]);
    }
    return Array.from(campos);
}

const CAMPOS_POSITIVOS = ['hp', 'damage', 'dps', 'hit_speed', 'speed', 'troop_count', 'elixir'];

function campoEhValido(carta, campo) {
    const valor = carta[campo];
    if (valor === undefined || valor === null) return false;
    if (typeof valor === 'number' && !Number.isFinite(valor)) return false;
    if (CAMPOS_POSITIVOS.includes(campo)) return Number(valor) > 0;
    return true;
}

function cartasTemCampos(campos) {
    return cartasDosJogadores.every(item => campos.every(campo => campoEhValido(item.carta, campo)));
}

function coletarValidas(lista, individual) {
    const validas = [];

    for (const pergunta of embaralhar(lista)) {
        if (!cartasTemCampos(camposNecessarios(pergunta))) continue;

        let afetados;
        try {
            afetados = pergunta.checar(cartasDosJogadores);
        } catch (erro) {
            continue;
        }
        if (!Array.isArray(afetados)) continue;

        afetados = afetados.filter((nome, indice, todos) => nomesJogadores.includes(nome) && todos.indexOf(nome) === indice);
        if (afetados.length === 0) continue;
        if (individual && nomesJogadores.length > 1 && afetados.length === nomesJogadores.length) continue;

        validas.push({ texto: pergunta.texto, afetados: afetados });
    }

    return validas;
}

function perguntaSemEfeito(lista) {
    const sorteada = lista[Math.floor(Math.random() * lista.length)];
    return { texto: sorteada.texto, afetados: [] };
}

function rotuloEfeito(individual, direcao) {
    if (individual) {
        return direcao === 'avanco' ? "+ AVANÇO INDIVIDUAL +" : "- RECUO INDIVIDUAL -";
    }
    return direcao === 'avanco' ? "+ AVANÇO COLETIVO +" : "- RECUO COLETIVO -";
}

function sortearResultado(tipoFatia) {
    const individual = tipoFatia !== 'C';
    let direcao = 'avanco';

    if (tipoFatia === 'R') {
        direcao = 'recuo';
    } else if (tipoFatia === 'C') {
        direcao = Math.random() < chanceAvancoColetivo() ? 'avanco' : 'recuo';
    }

    if (direcao === 'recuo' && !podeRecuar()) {
        direcao = 'avanco';
    }

    const lista = individual ? perguntasIndividuais : perguntasColetivas;
    const escolhida = coletarValidas(lista, individual)[0] || perguntaSemEfeito(lista);

    return {
        escopo: individual ? 'individual' : 'coletiva',
        direcao: direcao,
        efeito: rotuloEfeito(individual, direcao),
        pergunta: escolhida.texto,
        afetados: escolhida.afetados
    };
}

function definirDirecoesDasOpcoes(tipoFatia, quantidade) {
    if (tipoFatia === 'A') return new Array(quantidade).fill('avanco');
    if (tipoFatia === 'R') return new Array(quantidade).fill('recuo');
    if (!podeRecuar() || quantidade < 2) return new Array(quantidade).fill('avanco');
    if (quantidade === 2) return ['avanco', 'recuo'];
    return ['avanco', 'avanco', 'recuo'];
}

function gerarOpcoes(tipoFatia) {
    const individual = tipoFatia !== 'C';
    const lista = individual ? perguntasIndividuais : perguntasColetivas;
    let candidatas = coletarValidas(lista, individual).slice(0, 3);

    if (candidatas.length === 0) {
        candidatas = [perguntaSemEfeito(lista)];
    }

    const direcoes = definirDirecoesDasOpcoes(tipoFatia, candidatas.length);
    const opcoes = candidatas.map((candidata, indice) => ({
        texto: candidata.texto,
        afetados: candidata.afetados,
        direcao: direcoes[indice]
    }));

    return embaralhar(opcoes);
}

function salvarResultado(resultado, novaVez) {
    const variacao = resultado.direcao === 'avanco' ? 1 : -1;
    const novasPosicoes = {};

    nomesJogadores.forEach(nome => {
        novasPosicoes[nome] = posicoes[nome];
    });

    resultado.afetados.forEach(nome => {
        novasPosicoes[nome] = Math.max(0, Math.min(casasTotal, novasPosicoes[nome] + variacao));
    });

    localStorage.setItem('draftRoyalePosicoes', JSON.stringify(novasPosicoes));
    localStorage.setItem('draftRoyaleUltimoResultado', JSON.stringify(resultado));
    localStorage.setItem('draftRoyaleFase', 'resultado');
    localStorage.removeItem('draftRoyalePendente');

    if (novaVez !== null) {
        localStorage.setItem('draftRoyaleVez', String(novaVez));
    }
}

function calcularRotacaoFinal(indice) {
    const passo = 360 / fatias.length;
    const desvio = (Math.random() - 0.5) * (passo - 8);
    return (360 * 6) - (indice * passo) + desvio;
}

async function girarRoleta() {
    if (girando || !jogoValido) return;
    girando = true;

    const btn = document.getElementById('btn-girar');
    const roda = document.getElementById('roda');
    btn.disabled = true;
    btn.innerText = "GIRANDO...";

    const carregou = await carregarCartas();
    if (!carregou) {
        alert("Erro ao carregar as cartas do jogo.");
        girando = false;
        btn.disabled = false;
        btn.innerText = "GIRAR A ROLETA";
        return;
    }

    const indiceVencedor = Math.floor(Math.random() * fatias.length);
    const tipoFatia = fatias[indiceVencedor];
    const rotacaoFinal = calcularRotacaoFinal(indiceVencedor);

    if (modoEscolha) {
        const indiceVez = obterIndiceVez();
        pendenteAtual = {
            tipoFatia: tipoFatia,
            fatias: fatias.slice(),
            rotacao: rotacaoFinal,
            indiceVez: indiceVez,
            jogador: nomesJogadores[indiceVez],
            opcoes: gerarOpcoes(tipoFatia)
        };
        localStorage.setItem('draftRoyalePendente', JSON.stringify(pendenteAtual));
        localStorage.setItem('draftRoyaleFase', 'escolhendo');

        roda.style.transform = `rotate(${rotacaoFinal}deg)`;
        setTimeout(() => {
            revelarEscolha(pendenteAtual);
        }, 5000);
        return;
    }

    const resultado = sortearResultado(tipoFatia);
    salvarResultado(resultado, null);

    roda.style.transform = `rotate(${rotacaoFinal}deg)`;
    setTimeout(() => {
        revelarResultado(resultado);
    }, 5000);
}

function classeDoTipo(tipoFatia) {
    if (tipoFatia === 'A') return 'efeito-avanco';
    if (tipoFatia === 'R') return 'efeito-recuo';
    return 'efeito-coletivo';
}

function rotuloDoTipo(tipoFatia) {
    if (tipoFatia === 'A') return "+ AVANÇO INDIVIDUAL +";
    if (tipoFatia === 'R') return "- RECUO INDIVIDUAL -";
    return "PERGUNTA COLETIVA";
}

function restaurarEscolha(pendente) {
    girando = true;
    pendenteAtual = pendente;
    fatias = pendente.fatias;
    desenharRoda();

    const roda = document.getElementById('roda');
    roda.style.transition = 'none';
    roda.style.transform = `rotate(${pendente.rotacao}deg)`;

    revelarEscolha(pendente);
}

function revelarEscolha(pendente) {
    const caixa = document.getElementById('caixa-resultado');
    const txtPergunta = document.getElementById('texto-pergunta');
    const txtEfeito = document.getElementById('texto-efeito');
    const btn = document.getElementById('btn-girar');
    const containerOpcoes = document.getElementById('opcoes-pergunta');
    const listaOpcoes = document.getElementById('lista-opcoes');

    caixa.className = 'resultado-box';
    caixa.classList.add(classeDoTipo(pendente.tipoFatia));
    txtPergunta.innerText = `Vez de ${pendente.jogador} escolher a pergunta!`;
    txtEfeito.innerText = rotuloDoTipo(pendente.tipoFatia);
    btn.style.display = 'none';

    document.getElementById('titulo-opcoes').innerText = `${pendente.jogador}, escolha uma das opções abaixo:`;
    listaOpcoes.innerHTML = '';

    pendente.opcoes.forEach((opcao, indice) => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = `opcao-pergunta ${opcao.direcao === 'avanco' ? 'opcao-avanco' : 'opcao-recuo'}`;

        const etiqueta = document.createElement('span');
        etiqueta.className = 'opcao-tag';
        etiqueta.textContent = opcao.direcao === 'avanco' ? "+ AVANÇA" : "- RECUA";

        const texto = document.createElement('span');
        texto.className = 'opcao-texto';
        texto.textContent = opcao.texto;

        botao.appendChild(etiqueta);
        botao.appendChild(texto);
        botao.onclick = () => confirmarEscolha(indice);
        listaOpcoes.appendChild(botao);
    });

    containerOpcoes.style.display = 'block';
}

function confirmarEscolha(indice) {
    if (escolhaConfirmada || !pendenteAtual) return;
    const opcao = pendenteAtual.opcoes[indice];
    if (!opcao) return;
    escolhaConfirmada = true;

    document.querySelectorAll('.opcao-pergunta').forEach(botao => {
        botao.disabled = true;
    });

    const individual = pendenteAtual.tipoFatia !== 'C';
    const resultado = {
        escopo: individual ? 'individual' : 'coletiva',
        direcao: opcao.direcao,
        efeito: rotuloEfeito(individual, opcao.direcao),
        pergunta: opcao.texto,
        afetados: opcao.afetados,
        escolhidoPor: pendenteAtual.jogador
    };

    salvarResultado(resultado, (pendenteAtual.indiceVez + 1) % nomesJogadores.length);
    document.getElementById('opcoes-pergunta').style.display = 'none';
    revelarResultado(resultado);
}

function revelarResultado(resultado) {
    const caixa = document.getElementById('caixa-resultado');
    const txtPergunta = document.getElementById('texto-pergunta');
    const txtEfeito = document.getElementById('texto-efeito');
    const btn = document.getElementById('btn-girar');

    caixa.className = 'resultado-box';
    caixa.classList.add(resultado.direcao === 'avanco' ? 'efeito-avanco' : 'efeito-recuo');
    txtPergunta.innerText = resultado.pergunta;
    txtEfeito.innerText = resultado.efeito;

    let txtAfetados = document.getElementById('texto-afetados');
    if (!txtAfetados) {
        txtAfetados = document.createElement('p');
        txtAfetados.id = 'texto-afetados';
        txtAfetados.style.color = '#fff';
        txtAfetados.style.fontWeight = 'bold';
        txtAfetados.style.marginTop = '12px';
        txtAfetados.style.whiteSpace = 'pre-line';
        txtAfetados.style.textShadow = '1px 1px 2px #000';
        caixa.appendChild(txtAfetados);
    }

    let linhas = "";
    if (resultado.escolhidoPor) {
        linhas += `Pergunta escolhida por ${resultado.escolhidoPor}\n`;
    }
    if (resultado.afetados.length === 0) {
        linhas += "Ninguém se encaixou nesta pergunta.";
    } else {
        const rotulo = resultado.direcao === 'avanco' ? "Avançam" : "Recuam";
        linhas += `${rotulo}: ${resultado.afetados.join(', ')}`;
    }
    txtAfetados.innerText = linhas;

    btn.style.display = '';
    btn.disabled = false;
    btn.innerText = "VER TABULEIRO";
    btn.onclick = () => {
        window.location.href = "tabuleiro.html";
    };
}
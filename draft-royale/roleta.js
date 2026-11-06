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

const jogoValido = faseJogo === 'tabuleiro'
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
    if (!regras.recuo || !liberouRecuo) return 1;
    return regras.avanco ? 0.625 : 0.8125;
}

function desenharRoda() {
    const roda = document.getElementById('roda');
    const passo = 360 / fatias.length;
    const cores = { A: '#4CAF50', R: '#F44336', C: '#2196F3' };
    const partes = fatias.map((tipo, indice) => `${cores[tipo]} ${indice * passo}deg ${(indice + 1) * passo}deg`);
    roda.style.background = `conic-gradient(from ${-passo / 2}deg, ${partes.join(', ')})`;
}

function prepararRoleta() {
    regras = obterRegras();
    posicoes = carregarPosicoes();

    let progressoMaximo = 0;
    nomesJogadores.forEach(nome => {
        if (posicoes[nome] > progressoMaximo) progressoMaximo = posicoes[nome];
    });
    liberouRecuo = (progressoMaximo * 10) >= (casasTotal * 3);

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
            lista.push({ jogador: jogador, carta: carta });
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

function cartasTemCampos(campos) {
    return cartasDosJogadores.every(item => campos.every(campo => item.carta[campo] !== undefined && item.carta[campo] !== null));
}

function escolherPergunta(lista, individual) {
    const embaralhadas = embaralhar(lista);

    for (const pergunta of embaralhadas) {
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

        return { texto: pergunta.texto, afetados: afetados };
    }

    const sorteada = lista[Math.floor(Math.random() * lista.length)];
    return { texto: sorteada.texto, afetados: [] };
}

function sortearResultado(tipoFatia) {
    let individual = tipoFatia !== 'C';
    let direcao = 'avanco';

    if (tipoFatia === 'R') {
        direcao = 'recuo';
    } else if (tipoFatia === 'C') {
        direcao = Math.random() < chanceAvancoColetivo() ? 'avanco' : 'recuo';
    }

    if (direcao === 'recuo' && (!liberouRecuo || !regras.recuo)) {
        direcao = 'avanco';
    }

    const lista = individual ? perguntasIndividuais : perguntasColetivas;
    const escolhida = escolherPergunta(lista, individual);

    let efeito;
    if (individual) {
        efeito = direcao === 'avanco' ? "+ AVANÇO INDIVIDUAL +" : "- RECUO INDIVIDUAL -";
    } else {
        efeito = direcao === 'avanco' ? "+ AVANÇO COLETIVO +" : "- RECUO COLETIVO -";
    }

    return {
        escopo: individual ? 'individual' : 'coletiva',
        direcao: direcao,
        efeito: efeito,
        pergunta: escolhida.texto,
        afetados: escolhida.afetados
    };
}

function salvarResultado(resultado) {
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
    const resultado = sortearResultado(fatias[indiceVencedor]);
    salvarResultado(resultado);

    const passo = 360 / fatias.length;
    const desvio = (Math.random() - 0.5) * (passo - 8);
    const rotacaoFinal = (360 * 6) - (indiceVencedor * passo) + desvio;
    roda.style.transform = `rotate(${rotacaoFinal}deg)`;

    setTimeout(() => {
        revelarResultado(resultado);
    }, 5000);
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
        txtAfetados.style.textShadow = '1px 1px 2px #000';
        caixa.appendChild(txtAfetados);
    }

    if (resultado.afetados.length === 0) {
        txtAfetados.innerText = "Ninguém se encaixou nesta pergunta.";
    } else {
        const rotulo = resultado.direcao === 'avanco' ? "Avançam" : "Recuam";
        txtAfetados.innerText = `${rotulo}: ${resultado.afetados.join(', ')}`;
    }

    btn.disabled = false;
    btn.innerText = "VER TABULEIRO";
    btn.onclick = () => {
        window.location.href = "tabuleiro.html";
    };
}
// Objeto que guardará as configurações da partida
const configs = {
    jogadores: 4,
    casas: 10,
    modo: 'aleatorio',
    regras: {
        avanco: true,   // Regra de avanço 1
        recuo: true,    // Regra de recuo (opcional)
        grupo: true     // Regra de avanço 2 (grupo)
    }
};

// Limites estabelecidos
const LIMITES = {
    jogadores: { min: 2, max: 10 },
    casas: { min: 3, max: 15 }
};

// Executa assim que a página carrega para atualizar o estado inicial dos botões
document.addEventListener("DOMContentLoaded", () => {
    atualizarBotoesLimites();
});

// Função para aumentar ou diminuir Jogadores e Casas com controle de extremos
function alterarValor(tipo, variacao) {
    let novoValor = configs[tipo] + variacao;
    
    // Verifica se está dentro dos limites permitidos
    if (novoValor >= LIMITES[tipo].min && novoValor <= LIMITES[tipo].max) {
        configs[tipo] = novoValor;
        document.getElementById(`valor-${tipo}`).innerText = configs[tipo];
        atualizarBotoesLimites();
    }
}

// Atualiza a opacidade/estado disabled dos botões de + e - nos extremos
function atualizarBotoesLimites() {
    // Para Jogadores
    const btnMenosJog = document.querySelector('.config-box:nth-child(1) .btn-counter:nth-child(1)');
    const btnMaisJog = document.querySelector('.config-box:nth-child(1) .btn-counter:nth-child(3)');
    
    btnMenosJog.disabled = configs.jogadores <= LIMITES.jogadores.min;
    btnMaisJog.disabled = configs.jogadores >= LIMITES.jogadores.max;

    // Para Casas
    const btnMenosCasas = document.querySelector('.config-box:nth-child(2) .btn-counter:nth-child(1)');
    const btnMaisCasas = document.querySelector('.config-box:nth-child(2) .btn-counter:nth-child(3)');
    
    btnMenosCasas.disabled = configs.casas <= LIMITES.casas.min;
    btnMaisCasas.disabled = configs.casas >= LIMITES.casas.max;
}

// Função para trocar o modo de jogo
function selecionarModo(modo) {
    configs.modo = modo;
    document.getElementById('modo-aleatorio').classList.remove('selected');
    document.getElementById('modo-escolha').classList.remove('selected');
    document.getElementById(`modo-${modo}`).classList.add('selected');
}

// Função para ativar/desativar as regras com validação silenciosa de avanço
function alternarRegra(regra) {
    // Se o usuário tentar desativar o 'avanco' e o 'grupo' também estiver desativado, bloqueia silenciosamente
    if (regra === 'avanco' && configs.regras.avanco && !configs.regras.grupo) {
        return; 
    }
    if (regra === 'grupo' && configs.regras.grupo && !configs.regras.avanco) {
        return; 
    }

    configs.regras[regra] = !configs.regras[regra];
    
    const elemento = document.getElementById(`regra-${regra}`);
    if (configs.regras[regra]) {
        elemento.classList.add('active');
    } else {
        elemento.classList.remove('active');
    }
}

// Salva os dados no navegador e avança para o jogo
function salvarEAvancar() {
    localStorage.setItem('draftRoyaleConfig', JSON.stringify(configs));
    alert("Configurações salvas com sucesso! Pronto para montar a Arena.");
}
const pesoRaridade = {
    "common": 1,
    "rare": 2,
    "epic": 3,
    "legendary": 4,
    "champion": 5
};

function compararCartas(cartasDosJogadores, extratorValor, buscarMaior = true) {
    let vencedores = [];
    let melhorValor = null;

    cartasDosJogadores.forEach(item => {
        const valor = extratorValor(item.carta);

        if (melhorValor === null) {
            melhorValor = valor;
            vencedores = [item.jogador];
        } else {
            const condicao = buscarMaior ? (valor > melhorValor) : (valor < melhorValor);
            if (condicao) {
                melhorValor = valor;
                vencedores = [item.jogador];
            } else if (valor === melhorValor) {
                vencedores.push(item.jogador);
            }
        }
    });

    return vencedores;
}

function chaveAlfabetica(carta) {
    return carta.name_pt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function contarLetras(carta) {
    return carta.name_pt.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, '').length;
}

const perguntasIndividuais = [
    { texto: "Quem tiver a carta com MAIOR Dano por golpe", checar: (cartas) => compararCartas(cartas, c => c.damage, true) },
    { texto: "Quem tiver a carta com MENOR Dano por golpe", checar: (cartas) => compararCartas(cartas, c => c.damage, false) },
    { texto: "Quem tiver a carta com a MAIOR Vida (de uma tropa)", checar: (cartas) => compararCartas(cartas, c => c.hp, true) },
    { texto: "Quem tiver a carta com a MENOR Vida (de uma tropa)", checar: (cartas) => compararCartas(cartas, c => c.hp, false) },
    { texto: "Quem tiver o MAIOR Dano Por Segundo (DPS)", checar: (cartas) => compararCartas(cartas, c => c.dps, true) },
    { texto: "Quem tiver o MENOR Dano Por Segundo (DPS)", checar: (cartas) => compararCartas(cartas, c => c.dps, false) },
    { texto: "Quem tiver o ataque mais RÁPIDO (menor tempo entre golpes)", checar: (cartas) => compararCartas(cartas, c => c.hit_speed, false) },
    { texto: "Quem tiver o ataque mais LENTO (maior tempo entre golpes)", checar: (cartas) => compararCartas(cartas, c => c.hit_speed, true) },
    { texto: "Quem tiver a MAIOR Velocidade de Movimento", checar: (cartas) => compararCartas(cartas, c => c.speed, true) },
    { texto: "Quem tiver a MENOR Velocidade de Movimento", checar: (cartas) => compararCartas(cartas, c => c.speed, false) },
    { texto: "Quem tiver o MAIOR Alcance de ataque", checar: (cartas) => compararCartas(cartas, c => c.attack_range, true) },
    { texto: "Quem tiver o MENOR Alcance de ataque", checar: (cartas) => compararCartas(cartas, c => c.attack_range, false) },
    { texto: "Quem invocar a MAIOR quantidade de tropas", checar: (cartas) => compararCartas(cartas, c => c.troop_count, true) },
    { texto: "Quem invocar a MENOR quantidade de tropas", checar: (cartas) => compararCartas(cartas, c => c.troop_count, false) },
    { texto: "Quem tiver a carta com o MAIOR custo de Elixir", checar: (cartas) => compararCartas(cartas, c => c.elixir, true) },
    { texto: "Quem tiver a carta com o MENOR custo de Elixir", checar: (cartas) => compararCartas(cartas, c => c.elixir, false) },
    { texto: "Quem tiver a MAIOR relação de Vida total por Elixir", checar: (cartas) => compararCartas(cartas, c => (c.hp * c.troop_count) / c.elixir, true) },
    { texto: "Quem tiver a MENOR relação de Vida total por Elixir", checar: (cartas) => compararCartas(cartas, c => (c.hp * c.troop_count) / c.elixir, false) },
    { texto: "Quem tiver a MAIOR relação de Dano total por Elixir", checar: (cartas) => compararCartas(cartas, c => (c.damage * c.troop_count) / c.elixir, true) },
    { texto: "Quem tiver a MENOR relação de Dano total por Elixir", checar: (cartas) => compararCartas(cartas, c => (c.damage * c.troop_count) / c.elixir, false) },
    { texto: "Quem tiver a MAIOR relação de DPS total por Elixir", checar: (cartas) => compararCartas(cartas, c => (c.dps * c.troop_count) / c.elixir, true) },
    { texto: "Quem tiver a MENOR relação de DPS total por Elixir", checar: (cartas) => compararCartas(cartas, c => (c.dps * c.troop_count) / c.elixir, false) },
    { texto: "Quem tiver a carta de MAIOR Raridade", checar: (cartas) => compararCartas(cartas, c => pesoRaridade[c.rarity.toLowerCase()] || 0, true) },
    { texto: "Quem tiver a carta de MENOR Raridade", checar: (cartas) => compararCartas(cartas, c => pesoRaridade[c.rarity.toLowerCase()] || 0, false) },
    { texto: "Quem tiver a carta liberada na MAIOR Arena", checar: (cartas) => compararCartas(cartas, c => c.arena, true) },
    { texto: "Quem tiver a carta liberada na MENOR Arena", checar: (cartas) => compararCartas(cartas, c => c.arena, false) },
    { texto: "Quem tiver o nome em português com MAIS letras", checar: (cartas) => compararCartas(cartas, c => contarLetras(c), true) },
    { texto: "Quem tiver o nome em português com MENOS letras", checar: (cartas) => compararCartas(cartas, c => contarLetras(c), false) },
    { texto: "Quem tiver a MAIOR soma de Vida e Dano", checar: (cartas) => compararCartas(cartas, c => c.hp + c.damage, true) },
    { texto: "Quem tiver a MENOR soma de Vida e Dano", checar: (cartas) => compararCartas(cartas, c => c.hp + c.damage, false) },
    { texto: "A carta que vier PRIMEIRO na ordem alfabética", checar: (cartas) => compararCartas(cartas, c => chaveAlfabetica(c), false) },
    { texto: "A carta que vier POR ÚLTIMO na ordem alfabética", checar: (cartas) => compararCartas(cartas, c => chaveAlfabetica(c), true) },
    { texto: "Quem tiver o MAIOR dano total (Dano x Quantidade de Tropas)", checar: (cartas) => compararCartas(cartas, c => c.damage * c.troop_count, true) },
    { texto: "Quem tiver o MENOR dano total (Dano x Quantidade de Tropas)", checar: (cartas) => compararCartas(cartas, c => c.damage * c.troop_count, false) },
    { texto: "Quem tiver a MAIOR vida total (Vida x Quantidade de Tropas)", checar: (cartas) => compararCartas(cartas, c => c.hp * c.troop_count, true) },
    { texto: "Quem tiver a MENOR vida total (Vida x Quantidade de Tropas)", checar: (cartas) => compararCartas(cartas, c => c.hp * c.troop_count, false) }
];
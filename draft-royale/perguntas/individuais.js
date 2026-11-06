// Dicionário de pesos para comparar raridades
const pesoRaridade = {
    "common": 1,
    "rare": 2,
    "epic": 3,
    "legendary": 4,
    "champion": 5
};

// Função base para checar o maior ou menor valor entre os jogadores, incluindo empates
function compararCartas(cartasDosJogadores, extratorValor, buscarMaior = true) {
    let vencedores = [];
    let melhorValor = null;

    cartasDosJogadores.forEach(item => {
        // item.jogador é a string com o nome do jogador
        // item.carta é o objeto da carta com os status
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

const perguntasIndividuais = [
    { texto: "Quem tiver a carta com MAIOR Dano", checar: (cartas) => compararCartas(cartas, c => c.damage, true) },
    { texto: "Quem tiver a carta com MENOR Dano", checar: (cartas) => compararCartas(cartas, c => c.damage, false) },
    { texto: "Quem tiver a carta com a MAIOR Vida", checar: (cartas) => compararCartas(cartas, c => c.hp, true) },
    { texto: "Quem tiver a carta com a MENOR Vida", checar: (cartas) => compararCartas(cartas, c => c.hp, false) },
    { texto: "Quem tiver o MAIOR Dano Por Segundo (DPS)", checar: (cartas) => compararCartas(cartas, c => c.dps, true) },
    { texto: "Quem tiver o MENOR Dano Por Segundo (DPS)", checar: (cartas) => compararCartas(cartas, c => c.dps, false) },
    { texto: "Quem tiver o MENOR tempo de ataque", checar: (cartas) => compararCartas(cartas, c => c.hit_speed, false) },
    { texto: "Quem tiver o MAIOR tempo de ataque", checar: (cartas) => compararCartas(cartas, c => c.hit_speed, true) },
    { texto: "Quem tiver a MAIOR Velocidade de Movimento", checar: (cartas) => compararCartas(cartas, c => c.speed, true) },
    { texto: "Quem tiver a MENOR Velocidade de Movimento", checar: (cartas) => compararCartas(cartas, c => c.speed, false) },
    { texto: "Quem tiver o MAIOR Alcance", checar: (cartas) => compararCartas(cartas, c => c.range, true) },
    { texto: "Quem tiver o MENOR Alcance", checar: (cartas) => compararCartas(cartas, c => c.range, false) },
    { texto: "Quem invocar a MAIOR quantidade de tropas", checar: (cartas) => compararCartas(cartas, c => c.troop_count, true) },
    { texto: "Quem invocar a MENOR quantidade de tropas", checar: (cartas) => compararCartas(cartas, c => c.troop_count, false) },
    { texto: "Quem tiver a carta com o MAIOR custo de Elixir", checar: (cartas) => compararCartas(cartas, c => c.elixir, true) },
    { texto: "Quem tiver a carta com o MENOR custo de Elixir", checar: (cartas) => compararCartas(cartas, c => c.elixir, false) },
    { texto: "Quem tiver a MAIOR relação de Vida por Elixir", checar: (cartas) => compararCartas(cartas, c => c.elixir > 0 ? (c.hp / c.elixir) : c.hp, true) },
    { texto: "Quem tiver a MENOR relação de Vida por Elixir", checar: (cartas) => compararCartas(cartas, c => c.elixir > 0 ? (c.hp / c.elixir) : c.hp, false) },
    { texto: "Quem tiver a MAIOR relação de Dano por Elixir", checar: (cartas) => compararCartas(cartas, c => c.elixir > 0 ? (c.damage / c.elixir) : c.damage, true) },
    { texto: "Quem tiver a MENOR relação de Dano por Elixir", checar: (cartas) => compararCartas(cartas, c => c.elixir > 0 ? (c.damage / c.elixir) : c.damage, false) },
    { texto: "Quem tiver a MAIOR relação de DPS por Elixir", checar: (cartas) => compararCartas(cartas, c => c.elixir > 0 ? (c.dps / c.elixir) : c.dps, true) },
    { texto: "Quem tiver a MENOR relação de DPS por Elixir", checar: (cartas) => compararCartas(cartas, c => c.elixir > 0 ? (c.dps / c.elixir) : c.dps, false) },
    { texto: "Quem tiver a carta de MAIOR Raridade", checar: (cartas) => compararCartas(cartas, c => pesoRaridade[c.rarity.toLowerCase()] || 0, true) },
    { texto: "Quem tiver a carta de MENOR Raridade", checar: (cartas) => compararCartas(cartas, c => pesoRaridade[c.rarity.toLowerCase()] || 0, false) },
    { texto: "Quem tiver a carta liberada na MAIOR Arena", checar: (cartas) => compararCartas(cartas, c => c.arena, true) },
    { texto: "Quem tiver a carta liberada na MENOR Arena", checar: (cartas) => compararCartas(cartas, c => c.arena, false) },
    { texto: "Quem tiver o nome em português com MAIS letras", checar: (cartas) => compararCartas(cartas, c => c.name_pt.replace(/\s+/g, '').length, true) },
    { texto: "Quem tiver o nome em português com MENOS letras", checar: (cartas) => compararCartas(cartas, c => c.name_pt.replace(/\s+/g, '').length, false) },
    { texto: "Quem tiver a MAIOR soma de Vida e Dano", checar: (cartas) => compararCartas(cartas, c => c.hp + c.damage, true) },
    { texto: "Quem tiver a MENOR soma de Vida e Dano", checar: (cartas) => compararCartas(cartas, c => c.hp + c.damage, false) },
    { texto: "A carta que vier PRIMEIRO na ordem alfabética", checar: (cartas) => compararCartas(cartas, c => c.name_pt, false) },
    { texto: "A carta que vier POR ÚLTIMO na ordem alfabética", checar: (cartas) => compararCartas(cartas, c => c.name_pt, true) },
    { texto: "Quem tiver o MAIOR dano total (Dano x Quantidade de Tropas)", checar: (cartas) => compararCartas(cartas, c => c.damage * c.troop_count, true) },
    { texto: "Quem tiver o MENOR dano total (Dano x Quantidade de Tropas)", checar: (cartas) => compararCartas(cartas, c => c.damage * c.troop_count, false) },
    { texto: "Quem tiver a MAIOR vida total (Vida x Quantidade de Tropas)", checar: (cartas) => compararCartas(cartas, c => c.hp * c.troop_count, true) },
    { texto: "Quem tiver a MENOR vida total (Vida x Quantidade de Tropas)", checar: (cartas) => compararCartas(cartas, c => c.hp * c.troop_count, false) }
];
const TROPAS_VOADORAS = [
    "minions", "minion-horde", "mega-minion", "baby-dragon",
    "inferno-dragon", "electro-dragon", "skeleton-dragons", "lava-hound",
    "super-lava-hound", "balloon", "bats", "flying-machine",
    "skeleton-barrel", "phoenix"
];

const TROPAS_COM_EVOLUCAO = [
    "knight", "archers", "barbarians", "skeletons",
    "bats", "bomber", "baby-dragon", "battle-ram",
    "dart-goblin", "electro-dragon", "executioner", "firecracker",
    "goblin-giant", "hunter", "ice-spirit", "inferno-dragon",
    "lumberjack", "musketeer", "royal-ghost", "royal-giant",
    "royal-hogs", "royal-recruits", "skeleton-army", "skeleton-barrel",
    "valkyrie", "wall-breakers", "witch", "wizard",
    "pekka", "mega-knight", "elite-barbarians", "princess",
    "minion-horde", "electro-giant", "giant"
];

const TROPAS_COM_HEROI = [
    "knight", "giant", "mini-pekka", "musketeer",
    "wizard", "ice-golem", "goblins", "mega-minion",
    "magic-archer", "balloon", "dark-prince", "bowler",
    "valkyrie", "berserker", "ice-wizard", "electro-wizard"
];

const TROPAS_QUE_ATACAM_DE_LONGE = [
    "archers", "minions", "witch", "bomber",
    "musketeer", "baby-dragon", "wizard", "spear-goblins",
    "minion-horde", "ice-wizard", "royal-giant", "princess",
    "three-musketeers", "lava-hound", "sparky", "bowler",
    "inferno-dragon", "dart-goblin", "electro-wizard", "hunter",
    "executioner", "zappies", "cannon-cart", "flying-machine",
    "magic-archer", "electro-dragon", "firecracker", "super-witch",
    "super-lava-hound", "super-magic-archer", "archer-queen", "super-archers",
    "skeleton-dragons", "mother-witch"
];

const TROPAS_QUE_ATACAM_DE_PERTO = [
    "goblins", "balloon", "barbarians", "golem",
    "skeletons", "skeleton-army", "mini-pekka", "giant-skeleton",
    "hog-rider", "lumberjack", "battle-ram", "ice-golem",
    "bandit", "skeleton-barrel", "wall-breakers", "royal-hogs",
    "elixir-golem", "santa-hog-rider", "super-ice-golem", "super-mini-pekka",
    "knight", "giant", "pekka", "valkyrie",
    "dark-prince", "miner", "elite-barbarians", "bats",
    "royal-ghost", "mega-knight", "skeleton-king", "golden-knight",
    "monk", "electro-giant", "prince", "guards",
    "mega-minion", "royal-recruits", "night-witch", "mighty-miner",
    "battle-healer", "phoenix", "raging-prince"
];

const QUANTIDADE_DE_TROPAS = {
    "goblin-gang": 6,
    "rascals": 3
};

const ESTATISTICAS_NIVEL_11 = {
    "knight": { hp: 1766, damage: 202, dps: 168 },
    "archers": { hp: 304, damage: 112, dps: 124 },
    "goblins": { hp: 202, damage: 125, dps: 113 },
    "giant": { hp: 3968, damage: 253, dps: 168 },
    "pekka": { hp: 3760, damage: 842, dps: 467 },
    "minions": { hp: 230, damage: 107, dps: 89 },
    "balloon": { hp: 1676, damage: 640, dps: 320 },
    "witch": { hp: 839, damage: 135, dps: 122 },
    "barbarians": { hp: 716, damage: 192, dps: 137 },
    "golem": { hp: 5120, damage: 312, dps: 124 },
    "skeletons": { hp: 81, damage: 81, dps: 73 },
    "valkyrie": { hp: 1907, damage: 266, dps: 177 },
    "skeleton-army": { hp: 81, damage: 81, dps: 73 },
    "bomber": { hp: 304, damage: 212, dps: 117 },
    "musketeer": { hp: 721, damage: 217, dps: 217 },
    "baby-dragon": { hp: 1152, damage: 168, dps: 112 },
    "prince": { hp: 1920, damage: 391, dps: 279 },
    "wizard": { hp: 755, damage: 304, dps: 217 },
    "mini-pekka": { hp: 1390, damage: 755, dps: 471 },
    "spear-goblins": { hp: 133, damage: 81, dps: 50 },
    "giant-skeleton": { hp: 3361, damage: 276, dps: 212 },
    "hog-rider": { hp: 1697, damage: 317, dps: 198 },
    "minion-horde": { hp: 230, damage: 107, dps: 89 },
    "ice-wizard": { hp: 688, damage: 89, dps: 52 },
    "royal-giant": { hp: 3164, damage: 307, dps: 170 },
    "guards": { hp: 337, damage: 117, dps: 117 },
    "princess": { hp: 261, damage: 168, dps: 56 },
    "dark-prince": { hp: 1440, damage: 266, dps: 190 },
    "three-musketeers": { hp: 906, damage: 204, dps: 156 },
    "lava-hound": { hp: 3581, damage: 71, dps: 47 },
    "ice-spirit": { hp: 215, damage: 110 },
    "fire-spirit": { hp: 215, damage: 215 },
    "miner": { hp: 1210, damage: 192, dps: 147 },
    "sparky": { hp: 1451, damage: 1331, dps: 332 },
    "bowler": { hp: 2081, damage: 289, dps: 115 },
    "lumberjack": { hp: 1282, damage: 256, dps: 320 },
    "battle-ram": { hp: 967, damage: 286 },
    "inferno-dragon": { hp: 1295 },
    "ice-golem": { hp: 1228, damage: 84, dps: 33 },
    "mega-minion": { hp: 837, damage: 312, dps: 208 },
    "dart-goblin": { hp: 261, damage: 143, dps: 178 },
    "goblin-gang": { hp: 167.5, damage: 103, dps: 81.5 },
    "electro-wizard": { hp: 714, damage: 235, dps: 130 },
    "elite-barbarians": { hp: 1341, damage: 384, dps: 274 },
    "hunter": { hp: 885, damage: 832, dps: 378 },
    "executioner": { hp: 1280, damage: 179, dps: 74 },
    "bandit": { hp: 906, damage: 194, dps: 194 },
    "royal-recruits": { hp: 787, damage: 133, dps: 102 },
    "night-witch": { hp: 906, damage: 314, dps: 241 },
    "bats": { hp: 81, damage: 81, dps: 67 },
    "royal-ghost": { hp: 1152, damage: 263, dps: 146 },
    "ram-rider": { hp: 1766 },
    "zappies": { hp: 529, damage: 117, dps: 50 },
    "cannon-cart": { hp: 1809, damage: 202, dps: 224 },
    "mega-knight": { hp: 3993, damage: 268, dps: 157 },
    "skeleton-barrel": { hp: 532 },
    "flying-machine": { hp: 614, damage: 179, dps: 162 },
    "wall-breakers": { hp: 330, damage: 302 },
    "royal-hogs": { hp: 837, damage: 74, dps: 61 },
    "goblin-giant": { hp: 3110, damage: 176, dps: 117 },
    "fisherman": { hp: 870, damage: 194, dps: 149 },
    "magic-archer": { hp: 529, damage: 135, dps: 122 },
    "electro-dragon": { hp: 1049, damage: 192, dps: 91 },
    "firecracker": { hp: 304, damage: 320, dps: 106 },
    "mighty-miner": { hp: 2250, damage: 43, dps: 107 },
    "elixir-golem": { hp: 1569, damage: 253, dps: 229 },
    "battle-healer": { hp: 1920, damage: 268, dps: 134 },
    "skeleton-king": { hp: 2298, damage: 204, dps: 127 },
    "archer-queen": { hp: 1000, damage: 232, dps: 193 },
    "golden-knight": { hp: 1799, damage: 168, dps: 186 },
    "monk": { hp: 2214, damage: 140, dps: 175 },
    "skeleton-dragons": { hp: 560, damage: 151, dps: 75 },
    "mother-witch": { hp: 529, damage: 133, dps: 133 },
    "electro-spirit": { hp: 215, damage: 99 },
    "electro-giant": { hp: 3952, damage: 184, dps: 102 },
    "phoenix": { hp: 1052, damage: 217, dps: 217 },
    "heal-spirit": { hp: 215, damage: 110 }
};

const VELOCIDADE_COMPLEMENTAR = {
    "goblins": 120,
    "minions": 90,
    "barbarians": 60,
    "skeletons": 90,
    "skeleton-army": 90,
    "spear-goblins": 120,
    "minion-horde": 90,
    "guards": 90,
    "three-musketeers": 60,
    "goblin-gang": 120,
    "elite-barbarians": 90,
    "royal-recruits": 60,
    "bats": 120,
    "zappies": 60,
    "rascals": 60,
    "wall-breakers": 120,
    "royal-hogs": 120,
    "elixir-golem": 45,
    "skeleton-dragons": 90,
    "heal-spirit": 120
};

function ajustarCartaParaPerguntas(carta) {
    const ajustada = Object.assign({}, carta);
    const estatisticas = ESTATISTICAS_NIVEL_11[carta.key];

    ajustada.hp = estatisticas ? estatisticas.hp : undefined;
    ajustada.damage = estatisticas ? estatisticas.damage : undefined;
    ajustada.dps = estatisticas ? estatisticas.dps : undefined;
    ajustada.hit_speed = estatisticas && estatisticas.damage && estatisticas.dps
        ? Math.round((estatisticas.damage / estatisticas.dps) * 10) * 100
        : undefined;

    ajustada.speed = carta.speed > 0 ? carta.speed : VELOCIDADE_COMPLEMENTAR[carta.key];

    if (QUANTIDADE_DE_TROPAS[carta.key] !== undefined) {
        ajustada.troop_count = QUANTIDADE_DE_TROPAS[carta.key];
    }

    ajustada.is_flying = carta.is_flying === true || TROPAS_VOADORAS.includes(carta.key);
    ajustada.tem_evolucao = TROPAS_COM_EVOLUCAO.includes(carta.key)
        || (typeof carta.evolved_spells_sc_key === 'string' && carta.evolved_spells_sc_key !== "");
    ajustada.tem_heroi = TROPAS_COM_HEROI.includes(carta.key);

    if (TROPAS_QUE_ATACAM_DE_LONGE.includes(carta.key)) {
        ajustada.ataca_de_longe = true;
    } else if (TROPAS_QUE_ATACAM_DE_PERTO.includes(carta.key)) {
        ajustada.ataca_de_longe = false;
    } else {
        ajustada.ataca_de_longe = undefined;
    }

    return ajustada;
}
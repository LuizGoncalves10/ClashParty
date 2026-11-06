import json

print("Lendo os arquivos locais ('cartas_status.json' e 'todas_as_cartas.json')...")

try:
    with open("cartas_status.json", "r", encoding="utf-8") as f:
        status_raw = json.load(f)

    with open("todas_as_cartas.json", "r", encoding="utf-8") as f:
        todas_cartas = json.load(f)
except Exception as e:
    print("Erro ao ler os arquivos locais:", e)
    exit()

troops_data = status_raw.get("troop", {})
chars_data = status_raw.get("characters", {})

if isinstance(troops_data, list):
    troops_dict = {item.get("key", item.get("name")): item for item in troops_data}
else:
    troops_dict = troops_data

if isinstance(chars_data, list):
    chars_dict = {item.get("name", item.get("key")): item for item in chars_data}
else:
    chars_dict = chars_data

cartas_finais = []

for carta in todas_cartas:
    tipo = str(carta.get("type", "")).lower()
    if tipo == "troop":
        key = carta.get("key")
        name = carta.get("name")
        sc_key = carta.get("sc_key", name)

        info_tropa = troops_dict.get(key, {}) if isinstance(troops_dict, dict) else {}
        info_char = chars_dict.get(sc_key, {}) if isinstance(chars_dict, dict) else {}

        if not info_char and isinstance(chars_dict, dict):
            info_char = chars_dict.get(name, {})

        hp = info_char.get("hitpoints", 0) or info_tropa.get("hitpoints", 0)
        damage = info_char.get("damage", 0) or info_tropa.get("damage", 0)
        hit_speed = info_char.get("hit_speed", 0) or info_tropa.get("hit_speed", 0)
        speed = info_char.get("speed", 0) or info_tropa.get("speed", 0)
        sight_range = info_char.get("sight_range", 0) or info_tropa.get("sight_range", 0)
        is_flying = info_char.get("flying", False) or info_tropa.get("flying", False)
        
        summon_num = info_tropa.get("summon_number", 1)
        troop_count = summon_num if (isinstance(summon_num, int) and summon_num > 0) else 1

        dps = 0
        if hit_speed and hit_speed > 0:
            dps = round((damage / (hit_speed / 1000.0)), 1)

        # Mescla TUDO do arquivo original com os novos dados de combate
        carta_completa = {
            **carta,
            "hp": hp,
            "damage": damage,
            "hit_speed": hit_speed,
            "speed": speed,
            "range": sight_range,
            "is_flying": is_flying,
            "troop_count": troop_count,
            "dps": dps
        }
        cartas_finais.append(carta_completa)

with open("cartas_prontas.json", "w", encoding="utf-8") as f:
    json.dump(cartas_finais, f, indent=4, ensure_ascii=False)

print("✅ Arquivo 'cartas_prontas.json' atualizado com SUCESSO e contendo TUDO!")

cavaleiro = next((c for c in cartas_finais if c["key"] == "knight"), None)
if cavaleiro:
    print("\n--- Resultado do Cavaleiro (Knight) ---")
    print(json.dumps(cavaleiro, indent=4, ensure_ascii=False))
import urllib.request
import json

# Endpoint público e estático com todos os dados do RoyaleAPI
URL_API = "https://royaleapi.github.io/cr-api-data/json/cards.json"
ARQUIVO_SAIDA = "todas_as_cartas.json"

print("📡 Conectando ao servidor da comunidade RoyaleAPI...")

try:
    # Criando a requisição HTTP (o User-Agent evita bloqueios básicos)
    req = urllib.request.Request(URL_API, headers={'User-Agent': 'Mozilla/5.0'})
    
    # Abrindo a conexão e lendo os dados
    with urllib.request.urlopen(req) as resposta:
        dados_brutos = resposta.read().decode('utf-8')
        
    # Convertendo a string JSON para uma lista/dicionário Python
    cartas = json.loads(dados_brutos)
    
    # Salvando o banco completo localmente
    with open(ARQUIVO_SAIDA, 'w', encoding='utf-8') as arquivo:
        json.dump(cartas, arquivo, ensure_ascii=False, indent=4)
        
    print(f"✅ Sucesso absoluto! Extraímos {len(cartas)} cartas.")
    print(f"💾 O banco de dados completo foi salvo em: {ARQUIVO_SAIDA}")

except Exception as e:
    print(f"❌ Falha na conexão ou extração: {e}")
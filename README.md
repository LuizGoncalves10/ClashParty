# Clash Party

## Sobre o Projeto
Clash Party e um hub de minijogos de navegador focado nos universos de Clash Royale e Brawl Stars. O projeto foi arquitetado para oferecer uma experiencia imersiva e interativa no modelo "hot-seat", onde os participantes interagem no mesmo dispositivo, passando o controle a cada turno.

O sistema opera sob o conceito de Single Page Application (SPA) em cada um de seus modos, permitindo transicoes fluidas de interface sem a necessidade de recarregar a pagina, garantindo assim a retencao do estado do jogo e das variaveis de turno.

## Acesso ao Jogo
A aplicacao esta hospedada em ambiente de producao e pode ser acessada gratuitamente atraves do link abaixo:

**[Jogar Clash Party](https://clash-party.vercel.app)**

## Modos de Jogo

**Draft Royale**
Modo baseado em sorte, configuracao de regras e duelos de status. Os jogadores definem a extensao do tabuleiro e a quantidade de participantes. O motor do jogo sorteia cartas aleatorias do banco de dados e utiliza uma roleta interativa para determinar a condicao de duelo (Dano, Vida ou Velocidade). O vencedor de cada embate avanca no tabuleiro.

**Carta a Carta**
Um duelo de deducao competitivo. O Rei Azul e o Rei Vermelho selecionam secretamente uma carta alvo em um grid gerado aleatoriamente com trinta tropas. A cada turno, o jogador ativo analisa o tabuleiro, realiza deducoes e descarta opcoes inviaveis. O objetivo final e utilizar o botao de acao para chutar e acertar a carta oponente antes de ser descoberto.

**Qual e a Carta?**
Desafio de percepcao visual disponivel nos modos solo e em dupla, com suporte aos universos de Clash Royale e Brawl Stars. Uma imagem e exibida com nivel elevado de aproximacao e foco aleatorio, exigindo que o jogador identifique o personagem atraves de um sistema de busca inteligente ou reduza o zoom em troca de menos pontos por rodada.

**Combinacao Real**
Jogo da memoria competitivo em dupla com alternancia dinamica de turnos e temas visuais. O tabuleiro organiza vinte e duas cartas em seis fileiras simetricas contendo onze pares sorteados. Ao encontrar uma combinacao, o jogador pontua e mantem a posse do turno ate que todos os pares sejam eliminados da arena.

**Goblin Espiao**
Jogo social de blefe e deducao para grupos de tres a dez participantes. Cada jogador desliza a cobertura secreta para visualizar uma grade de nove cartas: os aliados veem a carta secreta destacada, enquanto o impostor visualiza todas as opcoes de forma neutra. Apos a rodada de dicas e a votacao secreta, o impostor vence se escapar ou se acertar a carta secreta no golpe final apos ser descoberto.

**Arena Explosiva**
Jogo de estrategia, psicologia e sobrevivencia em dupla com suporte aos universos de Clash Royale e Brawl Stars em uma grade aberta de dezesseis cartas. No modo Sabotagem, cada jogador esconde secretamente tres bombas na mesma formacao de tabuleiro em grades independentes, disputando turnos com tres vidas cada. No modo Campo Minado, ambos compartilham uma unica grade com quatro bombas aleatorias e duas vidas para decidir quem sobrevive ate o final.

**Nivel Secreto**
Jogo cooperativo de ordenacao em grupo para tres a dez participantes com suporte aos universos de Clash Royale e Brawl Stars. Cada jogador desliza a cobertura para revelar um numero secreto de um a cem e escolhe uma carta exclusiva por meio de busca inteligente. Ao final da rodada, a equipe reorganiza a lista em conjunto do maior para o menor nivel e compara a ordem escolhida com o gabarito real.

## Tecnologias e Ferramentas Utilizadas
O projeto foi inteiramente construido com tecnologias web nativas, priorizando a performance e a simplicidade arquitetural.

- **HTML5:** Responsavel pela estruturacao semantica das telas, particionamento de componentes e acessibilidade.
- **CSS3:** Estilizacao avancada utilizando Flexbox, Grid Layout e animacoes 3D para responsividade absoluta entre dispositivos moveis e desktops, alem do uso de variaveis globais para alternancia de temas dinamicos.
- **JavaScript (Vanilla):** Motor principal da aplicacao. Gerencia a logica de turnos, interacoes de interface, gestos de deslize, embaralhamento matematico de arrays e leitura assincrona de dados.
- **JSON:** Bancos de dados locais estaticos que armazenam os atributos, traducoes, identificadores e status precisos de todas as tropas e brawlers.
- **Git e GitHub:** Ferramentas essenciais para o versionamento de codigo e controle de alteracoes.
- **Vercel:** Plataforma de hospedagem escalavel que gerencia a integracao e a entrega continua do projeto.
- **RoyaleAPI:** Rede provedora (CDN) responsavel pelo fornecimento em tempo real das artes e icones oficiais das cartas.

## Estrutura do Projeto
A arvore de arquivos foi desenhada para separar claramente o escopo de cada jogo e os recursos globais.

- **/css:** Contem os estilos globais de botoes, tipografia e cores padronizadas da interface principal.
- **/imagens:** Diretorio focado em logotipos e recursos visuais do menu.
- **/draft-royale:** Modulo independente contendo a estrutura visual e logica do jogo de tabuleiro.
- **/cara-a-carta:** Modulo independente abrigando o sistema de turnos e ocultacao do jogo de deducao.
- **/qual-e-a-carta:** Modulo independente do desafio visual com niveis progressivos de zoom e autocompletar.
- **/combinacao-real:** Modulo independente do jogo da memoria em dupla com animacoes de rotacao em grade simetrica.
- **/goblin-espiao:** Modulo independente do jogo de blefe em grupo com revelacao por deslize, votacao secreta e golpe final.
- **/arena-explosiva:** Modulo independente contendo os modos Sabotagem e Campo Minado em grade aberta com animacoes de verificacao e explosao.
- **/nivel-secreto:** Modulo independente do desafio cooperativo de ordenacao com nivel oculto deslizante, busca com bloqueio e comparativo final.
- **todas_as_cartas.json:** Fonte de dados unificada das cartas do Clash Royale consumida pelos modulos.
- **todos_os_brawlers.json:** Fonte de dados unificada dos personagens do Brawl Stars consumida pelos modulos.

## Como Executar Localmente
Para inspecionar ou executar o codigo em seu ambiente de desenvolvimento, siga as instrucoes abaixo:

1. Clone o repositorio do projeto atraves do terminal.
2. Acesse a pasta raiz do projeto.
3. Para garantir que as requisicoes assincronas de leitura dos arquivos JSON funcionem corretamente e nao sejam bloqueadas pelas politicas de seguranca do navegador, inicie um servidor local (como o Live Server do Visual Studio Code ou um servidor Python basico).
4. Abra o arquivo principal index no seu navegador padrao.

## Deploy Automatizado
O ambiente de producao esta integrado diretamente com a ramificacao principal do repositorio. Qualquer atualizacao de codigo submetida ao GitHub engatilha uma nova construcao na Vercel, atualizando a versao em tempo real para os usuarios finais.
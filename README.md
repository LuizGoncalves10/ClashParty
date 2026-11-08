# Clash Party

## Sobre o Projeto
Clash Party e um hub de minijogos de navegador focado no universo do Clash Royale. O projeto foi arquitetado para oferecer uma experiencia imersiva e interativa no modelo "hot-seat", onde os participantes interagem no mesmo dispositivo, passando o controle a cada turno.

O sistema opera sob o conceito de Single Page Application (SPA) em cada um de seus modos, permitindo transicoes fluidas de interface sem a necessidade de recarregar a pagina, garantindo assim a retencao do estado do jogo e das variaveis de turno.

## Acesso ao Jogo
A aplicacao esta hospedada em ambiente de producao e pode ser acessada gratuitamente atraves do link abaixo:

**[Jogar Clash Party](https://clash-party.vercel.app)**

## Modos de Jogo

**Draft Royale**
Modo baseado em sorte, configuracao de regras e duelos de status. Os jogadores definem a extensao do tabuleiro e a quantidade de participantes. O motor do jogo sorteia cartas aleatorias do banco de dados e utiliza uma roleta interativa para determinar a condicao de duelo (Dano, Vida ou Velocidade). O vencedor de cada embate avanca no tabuleiro.

**Carta a Carta**
Um duelo de deducao competitivo. O Rei Azul e o Rei Vermelho selecionam secretamente uma carta alvo em um grid gerado aleatoriamente com trinta tropas. A cada turno, o jogador ativo analisa o tabuleiro, realiza deducoes e descarta opcoes inviaveis. O objetivo final e utilizar o botao de acao para chutar e acertar a carta oponente antes de ser descoberto.

## Tecnologias e Ferramentas Utilizadas
O projeto foi inteiramente construído com tecnologias web nativas, priorizando a performance e a simplicidade arquitetural.

* **HTML5:** Responsavel pela estruturacao semantica das telas, particionamento de componentes e acessibilidade.
* **CSS3:** Estilizacao avancada utilizando Flexbox e Grid Layout para responsividade absoluta entre dispositivos moveis e desktops, alem do uso de variaveis globais para alternancia de temas dinamicos.
* **JavaScript (Vanilla):** Motor principal da aplicacao. Gerencia a logica de turnos, interacoes de interface, embaralhamento matematico de arrays e leitura assincrona de dados.
* **JSON:** Banco de dados local estatico que armazena os atributos, identificadores e status precisos de todas as tropas.
* **Git e GitHub:** Ferramentas essenciais para o versionamento de codigo e controle de alteracoes.
* **Vercel:** Plataforma de hospedagem escalavel que gerencia a integracao e a entrega continua do projeto.
* **RoyaleAPI:** Rede provedora (CDN) responsavel pelo fornecimento em tempo real das artes e icones oficiais das cartas.

## Estrutura do Projeto
A arvore de arquivos foi desenhada para separar claramente o escopo de cada jogo e os recursos globais.

* **/css:** Contem os estilos globais de botoes, tipografia e cores padronizadas da interface principal.
* **/imagens:** Diretorio focado em logotipos e recursos visuais do menu.
* **/draft-royale:** Modulo independente contendo a estrutura visual e logica do jogo de tabuleiro.
* **/cara-a-carta:** Modulo independente abrigando o sistema de turnos e ocultacao do jogo de deducao.
* **todas_as_cartas.json:** Fonte de dados unificada consumida pelos modulos para gerar as interacoes.

## Como Executar Localmente
Para inspecionar ou executar o codigo em seu ambiente de desenvolvimento, siga as instrucoes abaixo:

1. Clone o repositorio do projeto atraves do terminal.
2. Acesse a pasta raiz do projeto.
3. Para garantir que as requisicoes assincronas de leitura do arquivo JSON funcionem corretamente e nao sejam bloqueadas pelas politicas de seguranca do navegador, inicie um servidor local (como o Live Server do Visual Studio Code ou um servidor Python basico).
4. Abra o arquivo principal index no seu navegador padrao.

## Deploy Automatizado
O ambiente de producao esta integrado diretamente com a ramificacao principal do repositorio. Qualquer atualizacao de codigo submetida ao GitHub engatilha uma nova construcao na Vercel, atualizando a versao em tempo real para os usuarios finais.
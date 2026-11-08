function iniciarDuelo() {
    const inputAzul = document.getElementById('nome-azul');
    const inputVermelho = document.getElementById('nome-vermelho');
    const erroMsg = document.getElementById('erro-nomes');

    const nomeAzul = inputAzul.value.trim();
    const nomeVermelho = inputVermelho.value.trim();

    // Validação: Ambos os campos precisam estar preenchidos
    if (nomeAzul === '' || nomeVermelho === '') {
        erroMsg.style.display = 'block';
        // Tremidinha nos inputs para chamar atenção (opcional, visual agradável)
        inputAzul.style.transform = "translateX(5px)";
        inputVermelho.style.transform = "translateX(-5px)";
        setTimeout(() => {
            inputAzul.style.transform = "translateX(0)";
            inputVermelho.style.transform = "translateX(0)";
        }, 150);
        return;
    }

    erroMsg.style.display = 'none';

    // Salva os nomes no LocalStorage (Memória do Navegador)
    // Assim não precisamos de banco de dados para lembrar quem é quem nas próximas telas
    localStorage.setItem('cc_reiAzul', nomeAzul);
    localStorage.setItem('cc_reiVermelho', nomeVermelho);

    // Passo 1 Concluído! Para testar, damos um alerta de sucesso.
    // Na próxima fase, trocaremos esse alert pelo link da próxima tela.
    alert(`Duelo Preparado!\n\n👑 Rei Azul: ${nomeAzul}\n👑 Rei Vermelho: ${nomeVermelho}\n\nO Passo 1 está concluído. Quando fizermos a Tela 2, você será redirecionado para lá automaticamente!`);
}
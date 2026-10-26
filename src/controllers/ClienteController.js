const ClienteController = {
    // Roda quando a página abre (o "main")
    iniciar() {
        ClienteView.aoSalvar(() => this.salvar());
        this.atualizarTabela();
    },

    // Chamado quando o usuário clica em "Salvar cliente"
    salvar() {
        const dados = ClienteView.obterDadosFormulario();
        const cliente = new Cliente(dados.id, dados.nome, dados.telefone, dados.email, dados.rg, dados.cpf);
        StorageService.salvar('clientes', cliente);
        ClienteView.mostrarMensagem('Cliente salvo: ' + cliente.nome);
        ClienteView.limparFormulario();
        this.atualizarTabela();
    },

    // Lê os clientes salvos e manda a View desenhar
    atualizarTabela() {
        ClienteView.renderizarTabela(StorageService.listar('clientes'));
    }
};

document.addEventListener('DOMContentLoaded', () => ClienteController.iniciar());

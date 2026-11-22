const ClienteController = {
    clientes: [],

    iniciar() {
        ClienteView.ativarMascaras();
        ClienteView.aoSalvar(dados => this.salvar(dados));
        ClienteView.aoBuscar(() => this.filtrar());
        ClienteView.aoAlterar((id, linha) => this.alterar(id, linha));
        ClienteView.aoRemover(id => this.remover(id));

        this.carregar();
    },

    async carregar() {
        try {
            this.clientes = await Cliente.listar();
        } catch (erro) {
            this.clientes = [];
            ClienteView.mostrarMensagem(erro.message, 'danger');
        }
        this.filtrar();
    },

    filtrar() {
        const termo = Utils.normalizarTexto(ClienteView.obterBusca());
        const digitos = Utils.somenteDigitos(termo);

        const lista = this.clientes.filter(cliente =>
            Utils.normalizarTexto(cliente.nome).includes(termo)
            || (digitos !== '' && Utils.somenteDigitos(cliente.cpf).includes(digitos))
        );

        ClienteView.renderizarTabela(lista, termo ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.');
    },

    async salvar(dados) {
        ClienteView.limparCamposInvalidos();

        const erros = this.validar(dados);
        if (erros.length > 0) {
            this.mostrarErros(erros);
            return;
        }

        const alterando = dados.id !== '';
        ClienteView.travarBotaoSalvar(true);

        try {
            const cliente = await Cliente.salvar({
                id: Number(dados.id) || null,
                nome: dados.nome.trim(),
                telefone: Utils.formatarTelefone(dados.telefone),
                email: dados.email.trim(),
                rg: Utils.formatarRg(dados.rg),
                cpf: Utils.formatarCpf(dados.cpf)
            });

            ClienteView.limparFormulario();
            ClienteView.mostrarMensagem(`${alterando ? 'Cliente alterado' : 'Cliente salvo'}: ${cliente.nome}`);
            await this.carregar();
        } catch (erro) {
            if (erro.erros?.length > 0) {
                this.mostrarErros(erro.erros);
            } else {
                ClienteView.mostrarMensagem(erro.message, 'danger');
            }
        } finally {
            ClienteView.travarBotaoSalvar(false);
        }
    },

    mostrarErros(erros) {
        ClienteView.marcarCamposInvalidos(erros.map(erro => erro.campo));
        ClienteView.mostrarMensagem(
            erros.length === 1 ? erros[0].mensagem : 'Corrija os campos destacados.',
            'danger'
        );
    },

    validar(dados) {
        const erros = [];

        if (!Validacoes.preenchido(dados.nome)) {
            erros.push({ campo: 'nome', mensagem: 'Informe o nome do cliente.' });
        }

        if (!Validacoes.preenchido(dados.telefone)) {
            erros.push({ campo: 'telefone', mensagem: 'Informe o telefone do cliente.' });
        } else if (!Validacoes.telefone(dados.telefone)) {
            erros.push({ campo: 'telefone', mensagem: 'Telefone incompleto: informe o DDD e o número.' });
        }

        if (Validacoes.preenchido(dados.email) && !Validacoes.email(dados.email)) {
            erros.push({ campo: 'email', mensagem: 'E-mail inválido.' });
        }

        if (!Validacoes.preenchido(dados.cpf)) {
            erros.push({ campo: 'cpf', mensagem: 'Informe o CPF do cliente.' });
        } else if (!Validacoes.cpf(dados.cpf)) {
            erros.push({ campo: 'cpf', mensagem: 'CPF inválido.' });
        }

        return erros;
    },

    encontrar(id) {
        return this.clientes.find(cliente => String(cliente.id) === String(id));
    },

    alterar(id, linha) {
        const cliente = this.encontrar(id);
        if (!cliente) return;

        ClienteView.esconderMensagem();
        ClienteView.entrarEdicao(cliente, linha);
    },

    async remover(id) {
        const cliente = this.encontrar(id);
        if (!cliente) return;

        if (!(await ClienteView.confirmarRemocao(cliente.nome))) return;

        try {
            await Cliente.remover(id);
        } catch (erro) {
            ClienteView.mostrarMensagem(erro.message, 'danger');
            return;
        }

        if (ClienteView.obterIdEmEdicao() === String(id)) {
            ClienteView.limparFormulario();
        }

        ClienteView.mostrarMensagem(`Cliente removido: ${cliente.nome}`);
        await this.carregar();
    }
};

document.addEventListener('DOMContentLoaded', () => ClienteController.iniciar());

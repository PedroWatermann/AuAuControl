const ClienteController = {
    iniciar() {
        ClienteView.ativarMascaras();
        ClienteView.aoSalvar(dados => this.salvar(dados));
        ClienteView.aoBuscar(() => this.carregar());
        ClienteView.aoAlterar((id, linha) => this.alterar(id, linha));
        ClienteView.aoRemover(id => this.remover(id));

        this.carregar();
    },

    carregar() {
        const termo = Utils.normalizarTexto(ClienteView.obterBusca());
        const digitos = Utils.somenteDigitos(termo);

        const lista = Cliente.listar().filter(cliente =>
            Utils.normalizarTexto(cliente.nome).includes(termo)
            || (digitos !== '' && Utils.somenteDigitos(cliente.cpf).includes(digitos))
        );

        ClienteView.renderizarTabela(lista, termo ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.');
    },

    salvar(dados) {
        ClienteView.limparCamposInvalidos();

        const erros = this.validar(dados);
        if (erros.length > 0) {
            ClienteView.marcarCamposInvalidos(erros.map(erro => erro.campo));
            ClienteView.mostrarMensagem(
                erros.length === 1 ? erros[0].mensagem : 'Corrija os campos destacados.',
                'danger'
            );
            return;
        }

        const alterando = dados.id !== '';
        const cliente = Cliente.salvar({
            id: Number(dados.id) || null,
            nome: dados.nome.trim(),
            telefone: Utils.formatarTelefone(dados.telefone),
            email: dados.email.trim(),
            rg: Utils.formatarRg(dados.rg),
            cpf: Utils.formatarCpf(dados.cpf)
        });

        ClienteView.limparFormulario();
        ClienteView.mostrarMensagem(`${alterando ? 'Cliente alterado' : 'Cliente salvo'}: ${cliente.nome}`);
        this.carregar();
    },

    validar(dados) {
        const erros = [];

        if (!Validacoes.preenchido(dados.nome)) {
            erros.push({ campo: 'nome', mensagem: 'Informe o nome do cliente.' });
        }

        if (Validacoes.preenchido(dados.telefone) && !Validacoes.telefone(dados.telefone)) {
            erros.push({ campo: 'telefone', mensagem: 'Telefone incompleto: informe o DDD e o número.' });
        }

        if (Validacoes.preenchido(dados.email) && !Validacoes.email(dados.email)) {
            erros.push({ campo: 'email', mensagem: 'E-mail inválido.' });
        }

        if (!Validacoes.preenchido(dados.cpf)) {
            erros.push({ campo: 'cpf', mensagem: 'Informe o CPF do cliente.' });
        } else if (!Validacoes.cpf(dados.cpf)) {
            erros.push({ campo: 'cpf', mensagem: 'CPF inválido.' });
        } else if (Cliente.cpfEmUso(dados.cpf, dados.id)) {
            erros.push({ campo: 'cpf', mensagem: 'Já existe um cliente com este CPF.' });
        }

        return erros;
    },

    alterar(id, linha) {
        const cliente = Cliente.buscar(id);
        if (!cliente) return;

        ClienteView.esconderMensagem();
        ClienteView.entrarEdicao(cliente, linha);
    },

    async remover(id) {
        const cliente = Cliente.buscar(id);
        if (!cliente) return;

        const atendimentos = Cliente.contarAtendimentos(id);
        if (atendimentos > 0) {
            const texto = atendimentos === 1 
                ? '1 atendimento' 
                : `${atendimentos} atendimentos`;
            ClienteView.mostrarMensagem(`${cliente.nome} tem ${texto} e não pode ser removido.`, 'danger');
            return;
        }

        if (!(await ClienteView.confirmarRemocao(cliente.nome))) return;

        Cliente.remover(id);

        if (ClienteView.obterIdEmEdicao() === String(id)) {
            ClienteView.limparFormulario();
        }

        ClienteView.mostrarMensagem(`Cliente removido: ${cliente.nome}`);
        this.carregar();
    }
};

document.addEventListener('DOMContentLoaded', () => ClienteController.iniciar());

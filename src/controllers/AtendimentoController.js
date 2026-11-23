const AtendimentoController = {
    atendimentos: [],
    clientes: [],
    animais: [],
    funcionarios: [],

    async iniciar() {
        AtendimentoView.aoSalvar(dados => this.salvar(dados));
        AtendimentoView.aoBuscar(() => this.filtrar());
        AtendimentoView.aoAlterar((id, linha) => this.alterar(id, linha));
        AtendimentoView.aoRemover(id => this.remover(id));

        await this.carregarOpcoes();
        this.carregar();
    },

    async carregarOpcoes() {
        try {
            const [clientes, animais, funcionarios] = await Promise.all([
                Cliente.listar(),
                Animal.listar(),
                Funcionario.listar()
            ]);
            this.clientes = clientes;
            this.animais = animais;
            this.funcionarios = funcionarios;
        } catch (erro) {
            AtendimentoView.mostrarMensagem(erro.message, 'danger');
        }

        AtendimentoView.preencherOpcoes('cliente', this.clientes);
        AtendimentoView.preencherOpcoes('animal', this.animais);
        AtendimentoView.preencherOpcoes('funcionario', this.funcionarios);
    },

    nome(lista, id) {
        const item = lista.find(item => String(item.id) === String(id));
        return item ? item.nome : '(removido)';
    },

    async carregar() {
        try {
            this.atendimentos = await Atendimento.listar();
        } catch (erro) {
            this.atendimentos = [];
            AtendimentoView.mostrarMensagem(erro.message, 'danger');
        }
        this.filtrar();
    },

    filtrar() {
        const termo = Utils.normalizarTexto(AtendimentoView.obterBusca());

        const lista = this.atendimentos
            .map(atendimento => ({
                id: atendimento.id,
                data: atendimento.data,
                cliente: this.nome(this.clientes, atendimento.cliente),
                animal: this.nome(this.animais, atendimento.animal),
                funcionario: this.nome(this.funcionarios, atendimento.funcionario)
            }))
            .filter(atendimento =>
                String(atendimento.id).includes(termo) ||
                Utils.normalizarTexto(atendimento.cliente).includes(termo) ||
                Utils.normalizarTexto(atendimento.animal).includes(termo) ||
                Utils.normalizarTexto(atendimento.funcionario).includes(termo) ||
                Utils.formatarDataRelatorio(atendimento.data).includes(termo)
            );

        AtendimentoView.renderizarTabela(lista, termo ? 'Nenhum atendimento encontrado.' : 'Nenhum atendimento cadastrado.');
    },

    async salvar(dados) {
        AtendimentoView.limparCamposInvalidos();

        const erros = this.validar(dados);
        if (erros.length > 0) {
            this.mostrarErros(erros);
            return;
        }

        const alterando = dados.id !== '';
        AtendimentoView.travarBotaoSalvar(true);

        try {
            const atendimento = await Atendimento.salvar({
                id: Number(dados.id) || null,
                data: dados.data,
                cliente: Number(dados.cliente),
                animal: Number(dados.animal),
                funcionario: Number(dados.funcionario)
            });

            AtendimentoView.limparFormulario();
            AtendimentoView.mostrarMensagem(`${alterando ? 'Atendimento alterado' : 'Atendimento salvo'}: ${Utils.formatarDataRelatorio(atendimento.data)}`);
            await this.carregar();
        } catch (erro) {
            if (erro.erros?.length > 0) {
                this.mostrarErros(erro.erros);
            } else {
                AtendimentoView.mostrarMensagem(erro.message, 'danger');
            }
        } finally {
            AtendimentoView.travarBotaoSalvar(false);
        }
    },

    mostrarErros(erros) {
        AtendimentoView.marcarCamposInvalidos(erros.map(erro => erro.campo));
        AtendimentoView.mostrarMensagem(
            erros.length === 1 ? erros[0].mensagem : 'Corrija os campos destacados.',
            'danger'
        );
    },

    validar(dados) {
        const erros = [];

        if (!Validacoes.preenchido(dados.data)) {
            erros.push({ campo: 'data', mensagem: 'Informe a data do atendimento.' });
        }
        
        if (!Validacoes.preenchido(dados.cliente)) {
            erros.push({ campo: 'cliente', mensagem: 'Informe o cliente atendido.' });
        }

        if (!Validacoes.preenchido(dados.animal)) {
            erros.push({ campo: 'animal', mensagem: 'Informe o animal atendido.' });
        }
        if (!Validacoes.preenchido(dados.funcionario)) {
            erros.push({ campo: 'funcionario', mensagem: 'Informe o funcionário que realizou o atendimento.' });
        }

        return erros;
    },

    encontrar(id) {
        return this.atendimentos.find(atendimento => String(atendimento.id) === String(id));
    },

    alterar(id, linha) {
        const atendimento = this.encontrar(id);
        if (!atendimento) return;

        AtendimentoView.esconderMensagem();
        AtendimentoView.entrarEdicao(atendimento, linha);
    },

    async remover(id) {
        const atendimento = this.encontrar(id);
        if (!atendimento) return;

        if (!(await AtendimentoView.confirmarRemocao(atendimento.id))) return;

        try {
            await Atendimento.remover(id);
        } catch (erro) {
            AtendimentoView.mostrarMensagem(erro.message, 'danger');
            return;
        }

        if (AtendimentoView.obterIdEmEdicao() === String(id)) {
            AtendimentoView.limparFormulario();
        }

        AtendimentoView.mostrarMensagem(`Atendimento removido: ${Utils.formatarDataRelatorio(atendimento.data)}`);
        await this.carregar();
    }
};

document.addEventListener('DOMContentLoaded', () => AtendimentoController.iniciar());

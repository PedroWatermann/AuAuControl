const FuncionarioController = {
    funcionarios: [],

    iniciar() {
        FuncionarioView.aoSalvar(dados => this.salvar(dados));
        FuncionarioView.aoBuscar(() => this.filtrar());
        FuncionarioView.aoAlterar((id, linha) => this.alterar(id, linha));
        FuncionarioView.aoRemover(id => this.remover(id));

        this.carregar();
    },

    async carregar() {
        try {
            this.funcionarios = await Funcionario.listar();
        } catch (erro) {
            this.funcionarios = [];
            FuncionarioView.mostrarMensagem(erro.message, 'danger');
        }
        this.filtrar();
    },

    filtrar() {
        const termo = Utils.normalizarTexto(FuncionarioView.obterBusca());

        const lista = this.funcionarios.filter(funcionario =>
            Utils.normalizarTexto(funcionario.nome).includes(termo) ||
            Utils.normalizarTexto(funcionario.numeroMatricula).includes(termo)
        );

        FuncionarioView.renderizarTabela(lista, termo ? 'Nenhum funcionário encontrado.' : 'Nenhum funcionário cadastrado.');
    },

    async salvar(dados) {
        FuncionarioView.limparCamposInvalidos();

        const erros = this.validar(dados);
        if (erros.length > 0) {
            this.mostrarErros(erros);
            return;
        }

        const alterando = dados.id !== '';
        FuncionarioView.travarBotaoSalvar(true);

        try {
            const funcionario = await Funcionario.salvar({
                id: Number(dados.id) || null,
                nome: dados.nome.trim(),
                matricula: dados.matricula.trim(),
                qualificacao: dados.qualificacao.trim(),
                funcao: dados.funcao.trim(),
                cargaHoraria: Number(dados.cargaHoraria)
            });

            FuncionarioView.limparFormulario();
            FuncionarioView.mostrarMensagem(`${alterando ? 'Funcionário alterado' : 'Funcionário salvo'}: ${funcionario.nome}`);
            await this.carregar();
        } catch (erro) {
            if (erro.erros?.length > 0) {
                this.mostrarErros(erro.erros);
            } else {
                FuncionarioView.mostrarMensagem(erro.message, 'danger');
            }
        } finally {
            FuncionarioView.travarBotaoSalvar(false);
        }
    },

    mostrarErros(erros) {
        FuncionarioView.marcarCamposInvalidos(erros.map(erro => erro.campo));
        FuncionarioView.mostrarMensagem(
            erros.length === 1 ? erros[0].mensagem : 'Corrija os campos destacados.', 'danger'
        );
    },

    validar(dados) {
        const erros = [];

        if (!Validacoes.preenchido(dados.nome)) {
            erros.push({ campo: 'nome', mensagem: 'Informe o nome do funcionário.' });
        }

        if (!Validacoes.preenchido(dados.matricula)) {
            erros.push({ campo: 'matricula', mensagem: 'Informe o número de matrícula do funcionário.' });
        }

        if (!Validacoes.preenchido(dados.qualificacao)) {
            erros.push({ campo: 'qualificacao', mensagem: 'Informe a qualificação do funcionário.' });
        }

        if (!Validacoes.preenchido(dados.funcao)) {
            erros.push({ campo: 'funcao', mensagem: 'Informe a descrição da função do funcionário.' });
        }

        if (!Validacoes.preenchido(dados.cargaHoraria)) {
            erros.push({ campo: 'cargaHoraria', mensagem: 'Informe a carga horária semanal do funcionário.' });
        } else if (!Validacoes.numeroPositivo(dados.cargaHoraria)) {
            erros.push({ campo: 'cargaHoraria', mensagem: 'A carga horária semanal deve ser maior que zero.' });
        }

        return erros;
    },
    
    encontrar(id) {
        return this.funcionarios.find(funcionario => String(funcionario.id) === String(id));
    },

    alterar(id, linha) {
        const funcionario = this.encontrar(id);
        if (!funcionario) return;

        FuncionarioView.esconderMensagem();
        FuncionarioView.entrarEdicao(funcionario, linha);
    },


    async remover(id) {
        const funcionario = this.encontrar(id);
        if (!funcionario) return;

        if (!(await FuncionarioView.confirmarRemocao(funcionario.nome))) return;

        try {
            await Funcionario.remover(id);
        } catch (erro) {
            FuncionarioView.mostrarMensagem(erro.message, 'danger');
            return;
        }

        if (FuncionarioView.obterIdEmEdicao() === String(id)) {
            FuncionarioView.limparFormulario();
        }

        FuncionarioView.mostrarMensagem(`Funcionário removido: ${funcionario.nome}`);
        await this.carregar();
    }
};

document.addEventListener('DOMContentLoaded', () => FuncionarioController.iniciar());

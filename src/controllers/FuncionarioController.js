const FuncionarioController = {
    iniciar() {
        FuncionarioView.aoSalvar(dados => this.salvar(dados));
        FuncionarioView.aoBuscar(() => this.carregar());
        FuncionarioView.aoAlterar((id, linha) => this.alterar(id, linha));
        FuncionarioView.aoRemover(id => this.remover(id));

        this.carregar();
    },

    carregar() {
        const termo = Utils.normalizarTexto(FuncionarioView.obterBusca());

        const lista = Funcionario.listar().filter(funcionario => Utils.normalizarTexto(funcionario.nome).includes(termo) || Utils.normalizarTexto(funcionario.numeroMatricula).includes(termo));

        FuncionarioView.renderizarTabela(lista, termo ? 'Nenhum funcionário encontrado.' : 'Nenhum funcionário cadastrado.');
    },

    salvar(dados) {
        FuncionarioView.limparCamposInvalidos();

        const erros = this.validar(dados);
        if (erros.length > 0) {
            FuncionarioView.marcarCamposInvalidos(erros.map(erro => erro.campo));
            FuncionarioView.mostrarMensagem(
                erros.length === 1 ? erros[0].mensagem : 'Corrija os campos destacados.',
                'danger'
            );
            return;
        }

        const alterando = dados.id !== '';
        const funcionario = Funcionario.salvar({
            id: Number(dados.id) || null,
            nome: dados.nome.trim(),
            numeroMatricula: dados.matricula.trim(),
            qualificacao: dados.qualificacao.trim(),
            descricaoFuncao: dados.funcao.trim(),
            cargaHorariaSemanal: Number(dados.cargaHoraria)
        });

        FuncionarioView.limparFormulario();
        FuncionarioView.mostrarMensagem(`${alterando ? 'Funcionário alterado' : 'Funcionário salvo'}: ${funcionario.nome}`);
        this.carregar();
    },

    validar(dados) {
        const erros = [];

        if (!Validacoes.preenchido(dados.nome)) {
            erros.push({ campo: 'nome', mensagem: 'Informe o nome do funcionário.' });
        }

        if (!Validacoes.preenchido(dados.matricula)) {
            erros.push({ campo: 'matricula', mensagem: 'Informe o número de matrícula do funcionário.' });
        }

        if (Funcionario.matriculaEmUso(dados.matricula, dados.id)) {
            erros.push({ campo: 'matricula', mensagem: 'Número de matrícula já está em uso por outro funcionário.' });
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

    alterar(id, linha) {
        const funcionario = Funcionario.buscar(id);
        if (!funcionario) return;

        FuncionarioView.esconderMensagem();
        FuncionarioView.entrarEdicao(funcionario, linha);
    },

    async remover(id) {
        const funcionario = Funcionario.buscar(id);
        if (!funcionario) return;

        const atendimentos = Funcionario.contarAtendimentos(id);
        if (atendimentos > 0) {
            const texto = atendimentos === 1 
                ? '1 atendimento' 
                : `${atendimentos} atendimentos`;
            FuncionarioView.mostrarMensagem(`${funcionario.nome} tem ${texto} e não pode ser removido.`, 'danger');
            return;
        }

        if (!(await FuncionarioView.confirmarRemocao(funcionario.nome))) return;

        Funcionario.remover(id);

        if (FuncionarioView.obterIdEmEdicao() === String(id)) {
            FuncionarioView.limparFormulario();
        }

        FuncionarioView.mostrarMensagem(`Funcionário removido: ${funcionario.nome}`);
        this.carregar();
    }
};

document.addEventListener('DOMContentLoaded', () => FuncionarioController.iniciar());

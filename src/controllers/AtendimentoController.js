const AtendimentoController = {
    iniciar() {
        AtendimentoView.aoSalvar(dados => this.salvar(dados));
        AtendimentoView.aoBuscar(() => this.carregar());
        AtendimentoView.aoAlterar((id, linha) => this.alterar(id, linha));
        AtendimentoView.aoRemover(id => this.remover(id));
        AtendimentoView.preencherOpcoes('cliente', Cliente.listar(), 'cliente-vazio');
        AtendimentoView.preencherOpcoes('animal', Animal.listar(), 'animal-vazio');
        AtendimentoView.preencherOpcoes('funcionario', Funcionario.listar(), 'funcionario-vazio');

        this.carregar();
    },

    mapaNomes(lista) {
        return new Map(lista.map(item => [String(item.id), item.nome]));
    },

    carregar() {
        const termo = Utils.normalizarTexto(AtendimentoView.obterBusca());

        const clientes = this.mapaNomes(Cliente.listar());
        const animais = this.mapaNomes(Animal.listar());
        const funcionarios = this.mapaNomes(Funcionario.listar());

        const lista = Atendimento.listar()
            .map(a => ({
                id: a.id,
                data: a.data,
                cliente: clientes.get(String(a.cliente)) ?? '(removido)',
                animal: animais.get(String(a.animal)) ?? '(removido)',
                funcionario: funcionarios.get(String(a.funcionario)) ?? '(removido)'
            }))
            .filter(a => String(a.id).includes(termo) || Utils.normalizarTexto(a.cliente).includes(termo));

        AtendimentoView.renderizarTabela(lista, termo ? 'Nenhum atendimento encontrado.' : 'Nenhum atendimento cadastrado.');
    },

    salvar(dados) {
        AtendimentoView.limparCamposInvalidos();

        const erros = this.validar(dados);
        if (erros.length > 0) {
            AtendimentoView.marcarCamposInvalidos(erros.map(erro => erro.campo));
            AtendimentoView.mostrarMensagem(
                erros.length === 1 ? erros[0].mensagem : 'Corrija os campos destacados.',
                'danger'
            );
            return;
        }

        const alterando = dados.id !== '';
        const atendimento = Atendimento.salvar({
            id: Number(dados.id) || null,
            data: dados.data.trim(),
            cliente: dados.cliente.trim(),
            animal: dados.animal.trim(),
            funcionario: dados.funcionario.trim(),
        });

        AtendimentoView.limparFormulario();
        AtendimentoView.mostrarMensagem(`${alterando ? 'Atendimento alterado' : 'Atendimento salvo'}: ${atendimento.data}`);
        this.carregar();
    },

    validar(dados) {
        const erros = [];

        if (!Validacoes.preenchido(dados.data)) {
            erros.push({ campo: 'data', mensagem: 'Informe a data do atendimento.' });
        }
        
        if (!Validacoes.preenchido(dados.cliente)) {
            erros.push({ campo: 'cliente', mensagem: 'Informe o cliente atendido.' });
        } else if (!Cliente.buscar(dados.cliente)) {
            erros.push({ campo: 'cliente', mensagem: 'Cliente não encontrado.' });
        }

        if (!Validacoes.preenchido(dados.animal)) {
            erros.push({ campo: 'animal', mensagem: 'Informe o animal atendido.' });
        } else if (!Animal.buscar(dados.animal)) {
            erros.push({ campo: 'animal', mensagem: 'Animal não encontrado.' });
        }

        if (!Validacoes.preenchido(dados.funcionario)) {
            erros.push({ campo: 'funcionario', mensagem: 'Informe o funcionário que realizou o atendimento.' });
        } else if (!Funcionario.buscar(dados.funcionario)) {
            erros.push({ campo: 'funcionario', mensagem: 'Funcionário não encontrado.' });
        }

        return erros;
    },

    alterar(id, linha) {
        const atendimento = Atendimento.buscar(id);
        if (!atendimento) return;

        AtendimentoView.esconderMensagem();
        AtendimentoView.entrarEdicao(atendimento, linha);
    },

    async remover(id) {
        const atendimento = Atendimento.buscar(id);
        if (!atendimento) return;

        if (!(await AtendimentoView.confirmarRemocao(atendimento.id))) return;

        Atendimento.remover(id);

        if (AtendimentoView.obterIdEmEdicao() === String(id)) {
            AtendimentoView.limparFormulario();
        }

        AtendimentoView.mostrarMensagem(`Atendimento removido: ${atendimento.data}`);
        this.carregar();
    }
};

document.addEventListener('DOMContentLoaded', () => AtendimentoController.iniciar());

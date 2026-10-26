const AnimalController = {
    iniciar() {
        AnimalView.aoSalvar(dados => this.salvar(dados));
        AnimalView.aoBuscar(() => this.carregar());
        AnimalView.aoAlterar((id, linha) => this.alterar(id, linha));
        AnimalView.aoRemover(id => this.remover(id));

        this.carregar();
    },

    carregar() {
        const termo = Utils.normalizarTexto(AnimalView.obterBusca());

        const lista = Animal.listar().filter(animal => Utils.normalizarTexto(animal.nome).includes(termo));

        AnimalView.renderizarTabela(lista, termo ? 'Nenhum animal encontrado.' : 'Nenhum animal cadastrado.');
    },

    salvar(dados) {
        AnimalView.limparCamposInvalidos();

        const erros = this.validar(dados);
        if (erros.length > 0) {
            AnimalView.marcarCamposInvalidos(erros.map(erro => erro.campo));
            AnimalView.mostrarMensagem(
                erros.length === 1 ? erros[0].mensagem : 'Corrija os campos destacados.',
                'danger'
            );
            return;
        }

        const alterando = dados.id !== '';
        const animal = Animal.salvar({
            id: Number(dados.id) || null,
            nome: dados.nome.trim(),
            peso: Number(dados.peso),
            altura: Number(dados.altura)
        });

        AnimalView.limparFormulario();
        AnimalView.mostrarMensagem(`${alterando ? 'Animal alterado' : 'Animal salvo'}: ${animal.nome}`);
        this.carregar();
    },

    validar(dados) {
        const erros = [];

        if (!Validacoes.preenchido(dados.nome)) {
            erros.push({ campo: 'nome', mensagem: 'Informe o nome do animal.' });
        }

        if (!Validacoes.preenchido(dados.peso)) {
            erros.push({ campo: 'peso', mensagem: 'Informe o peso do animal.' });
        } else if (!Validacoes.numeroPositivo(dados.peso)) {
            erros.push({ campo: 'peso', mensagem: 'O peso deve ser maior que zero.' });
        }

        if (!Validacoes.preenchido(dados.altura)) {
            erros.push({ campo: 'altura', mensagem: 'Informe a altura do animal.' });
        } else if (!Validacoes.numeroPositivo(dados.altura)) {
            erros.push({ campo: 'altura', mensagem: 'A altura deve ser maior que zero.' });
        }

        return erros;
    },

    alterar(id, linha) {
        const animal = Animal.buscar(id);
        if (!animal) return;

        AnimalView.esconderMensagem();
        AnimalView.entrarEdicao(animal, linha);
    },

    async remover(id) {
        const animal = Animal.buscar(id);
        if (!animal) return;

        const atendimentos = Animal.contarAtendimentos(id);
        if (atendimentos > 0) {
            const texto = atendimentos === 1 
                ? '1 atendimento' 
                : `${atendimentos} atendimentos`;
            AnimalView.mostrarMensagem(`${animal.nome} tem ${texto} e não pode ser removido.`, 'danger');
            return;
        }

        if (!(await AnimalView.confirmarRemocao(animal.nome))) return;

        Animal.remover(id);

        if (AnimalView.obterIdEmEdicao() === String(id)) {
            AnimalView.limparFormulario();
        }

        AnimalView.mostrarMensagem(`Animal removido: ${animal.nome}`);
        this.carregar();
    }
};

document.addEventListener('DOMContentLoaded', () => AnimalController.iniciar());

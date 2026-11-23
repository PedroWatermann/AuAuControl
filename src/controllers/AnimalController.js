const AnimalController = {
    animais: [],

    iniciar() {
        AnimalView.aoSalvar(dados => this.salvar(dados));
        AnimalView.aoBuscar(() => this.filtrar());
        AnimalView.aoAlterar((id, linha) => this.alterar(id, linha));
        AnimalView.aoRemover(id => this.remover(id));

        this.carregar();
    },

    async carregar() {
        try {
            this.animais = await Animal.listar();
        } catch (erro) {
            this.animais = [];
            AnimalView.mostrarMensagem(erro.message, 'danger');
        }
        this.filtrar();
    },

    filtrar() {
        const termo = Utils.normalizarTexto(AnimalView.obterBusca());

        const lista = this.animais.filter(animal =>
            Utils.normalizarTexto(animal.nome).includes(termo)
        );

        AnimalView.renderizarTabela(lista, termo ? 'Nenhum animal encontrado.' : 'Nenhum animal cadastrado.');
    },

    async salvar(dados) {
        AnimalView.limparCamposInvalidos();

        const erros = this.validar(dados);
        if (erros.length > 0) {
            this.mostrarErros(erros);
            return;
        }

        const alterando = dados.id !== '';
        AnimalView.travarBotaoSalvar(true);

        try {
            const animal = await Animal.salvar({
                id: Number(dados.id) || null,
                nome: dados.nome.trim(),
                peso: Number(dados.peso),
                altura: Number(dados.altura)
            });

            AnimalView.limparFormulario();
            AnimalView.mostrarMensagem(`${alterando ? 'Animal alterado' : 'Animal salvo'}: ${animal.nome}`);
            await this.carregar();
        } catch (erro) {
            if (erro.erros?.length > 0) {
                this.mostrarErros(erro.erros);
            } else {
                AnimalView.mostrarMensagem(erro.message, 'danger');
            }
        } finally {
            AnimalView.travarBotaoSalvar(false);
        }
    },

    mostrarErros(erros) {
        AnimalView.marcarCamposInvalidos(erros.map(erro => erro.campo));
        AnimalView.mostrarMensagem(
            erros.length === 1 ? erros[0].mensagem : 'Corrija os campos destacados.',
            'danger'
        );
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

    encontrar(id) {
        return this.animais.find(animal => String(animal.id) === String(id));
    },

    alterar(id, linha) {
        const animal = this.encontrar(id);
        if (!animal) return;

        AnimalView.esconderMensagem();
        AnimalView.entrarEdicao(animal, linha);
    },

    async remover(id) {
        const animal = this.encontrar(id);
        if (!animal) return;

        if (!(await AnimalView.confirmarRemocao(animal.nome))) return;

        try {
            await Animal.remover(id);
        } catch (erro) {
            AnimalView.mostrarMensagem(erro.message, 'danger');
            return;
        }

        if (AnimalView.obterIdEmEdicao() === String(id)) {
            AnimalView.limparFormulario();
        }

        AnimalView.mostrarMensagem(`Animal removido: ${animal.nome}`);
        await this.carregar();
    }
};

document.addEventListener('DOMContentLoaded', () => AnimalController.iniciar());

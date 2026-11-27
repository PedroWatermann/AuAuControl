const RelatorioController = {
    iniciar() {
        RelatorioView.preencherTipos();
        RelatorioView.selecionarTipo(this.lerTipoDaUrl() || this.lerUltimoTipo());

        RelatorioView.aoTrocarTipo(() => this.carregar());
        RelatorioView.aoClicarImprimir(() => RelatorioView.imprimir());
        RelatorioView.aoPrepararImpressao(() =>
            RelatorioView.atualizarEmissao(`Emitido em ${Utils.formatarDataHora(new Date())}`)
        );

        window.addEventListener('hashchange', () => {
            if (this.lerTipoDaUrl() !== RelatorioView.obterTipoSelecionado()) {
                RelatorioView.selecionarTipo(this.lerTipoDaUrl());
                this.carregar();
            }
        });

        this.carregar();
    },

    async carregar() {
        const tipo = RelatorioView.obterTipoSelecionado();
        this.alterarTipoNaUrl(tipo);
        this.gravarUltimoTipo(tipo);

        try {
            let lista = await this.lerLista(tipo);
            if (tipo === 'atendimentos') lista = this.prepararAtendimentos(lista);
            RelatorioView.renderizar(tipo, lista);
        } catch (erro) {
            RelatorioView.mostrarErro(tipo, erro.message);
        }
    },

    lerTipoDaUrl() {
        return decodeURIComponent(location.hash.slice(1));
    },

    alterarTipoNaUrl(tipo) {
        location.replace('#' + tipo);
    },

    lerUltimoTipo() {
        try {
            return sessionStorage.getItem('relatorio-tipo');
        } catch {
            return null;
        }
    },

    gravarUltimoTipo(tipo) {
        try {
            sessionStorage.setItem('relatorio-tipo', tipo);
        } catch { }
    },

    lerLista(chave) {
        const models = {
            clientes: Cliente,
            animais: Animal,
            funcionarios: Funcionario,
            atendimentos: Atendimento
        };
        return models[chave].listar();
    },

    prepararAtendimentos(atendimentos) {
        return atendimentos.map(at => ({
            id: at.id,
            data: at.data,
            cliente: at.clienteNome,
            animal: at.animalNome,
            funcionario: at.funcionarioNome
        }));
    },
};

document.addEventListener('DOMContentLoaded', () => RelatorioController.iniciar());

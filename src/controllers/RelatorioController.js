const RelatorioController = {
    iniciar() {
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

    carregar() {
        const tipo = RelatorioView.obterTipoSelecionado();
        this.alterarTipoNaUrl(tipo);
        this.gravarUltimoTipo(tipo);

        let lista = this.lerLista(tipo);

        if (tipo === 'atendimentos') {
            lista = this.prepararAtendimentos(lista);
        }

        RelatorioView.renderizar(tipo, lista);
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
        return Armazenamento.ler(chave);
    },

    prepararAtendimentos(atendimentos) {
        const clientes = this.lerLista('clientes');
        const animais = this.lerLista('animais');
        const funcionarios = this.lerLista('funcionarios');

        const nomeDe = (valor, listaReferencia) => {
            if (!valor) return '';
            if (typeof valor === 'object') return valor.nome ?? '';

            const encontrado = listaReferencia.find(item => String(item.id) === String(valor));
            return encontrado 
                ? encontrado.nome 
                : '(removido)';
        };

        return atendimentos.map(at => ({
            id: at.id,
            data: at.data,
            cliente: nomeDe(at._cliente ?? at.cliente, clientes),
            animal: nomeDe(at._animal ?? at.animal, animais),
            funcionario: nomeDe(at._funcionario ?? at.funcionario, funcionarios)
        }));
    }
};

document.addEventListener('DOMContentLoaded', () => RelatorioController.iniciar());

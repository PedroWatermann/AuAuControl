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

        RelatorioView.renderizar(tipo, this.ordenar(tipo, lista));
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

    ordenar(tipo, lista) {
        const copia = [...lista];

        return tipo === 'atendimentos'
            ? copia.sort((a, b) =>
                String(b.data ?? '').localeCompare(String(a.data ?? ''))
            )
            : copia.sort((a, b) =>
                String(a.nome ?? '').localeCompare(String(b.nome ?? ''), 'pt-BR', { sensitivity: 'base' })
            );
    },

    // TODO: quando o storage.js estiver pronto, trocar por ele
    lerLista(chave) {
        try {
            return JSON.parse(localStorage.getItem(chave)) || [];
        } catch {
            return [];
        }
    },

    prepararAtendimentos(atendimentos) {
        const clientes = this.lerLista('clientes');
        const animais = this.lerLista('animais');
        const funcionarios = this.lerLista('funcionarios');

        const nomeDe = (valor, listaReferencia) => {
            if (!valor) return '';
            if (typeof valor === 'object') return valor.nome ?? '';

            const encontrado = listaReferencia.find(item => String(item.id) === String(valor));
            return encontrado ? encontrado.nome : '(removido)';
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

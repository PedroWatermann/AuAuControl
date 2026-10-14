document.addEventListener('DOMContentLoaded', () =>
    iniciar()
);

function iniciar() {
    RelatorioView.aoTrocarTipo(() => this.carregar());
    RelatorioView.aoClicarImprimir(() => RelatorioView.imprimir());

    this.carregar();
}

function carregar() {
    const tipo = RelatorioView.obterTipoSelecionado();
    let lista = this.lerLista(tipo);

    if (tipo === 'atendimentos') {
        lista = this.prepararAtendimentos(lista);
    }

    RelatorioView.renderizar(tipo, lista);
}

// TODO: quando o storage.js estiver pronto, trocar por ele
function lerLista(chave) {
    try {
        return JSON.parse(localStorage.getItem(chave)) || [];
    } catch {
        return [];
    }
}

function prepararAtendimentos(atendimentos) {
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

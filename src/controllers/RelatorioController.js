document.addEventListener('DOMContentLoaded', () =>
    iniciar()
);

function iniciar() {
    aoTrocarTipo(() => carregar());
    aoClicarImprimir(() => imprimir());

    carregar();
}

function carregar() {
    const tipo = obterTipoSelecionado();
    let lista = lerLista(tipo);

    if (tipo === 'atendimentos') {
        lista = prepararAtendimentos(lista);
    }

    renderizar(tipo, lista);
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
    const clientes = lerLista('clientes');
    const animais = lerLista('animais');
    const funcionarios = lerLista('funcionarios');

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

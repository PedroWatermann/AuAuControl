document.addEventListener('DOMContentLoaded', () =>
    iniciar()
);

function iniciar() {
    selecionarTipo(lerTipoDaUrl() || lerUltimoTipo());

    aoTrocarTipo(() => carregar());
    aoClicarImprimir(() => imprimir());
    aoPrepararImpressao(() => atualizarEmissao(`Emitido em ${formatarDataHora(new Date())}`));

    window.addEventListener('hashchange', () => {
        if (lerTipoDaUrl() !== obterTipoSelecionado()) {
            selecionarTipo(lerTipoDaUrl());
            carregar();
        }
    });

    carregar();
}

function carregar() {
    const tipo = obterTipoSelecionado();
    alterarTipoNaUrl(tipo);
    gravarUltimoTipo(tipo);

    let lista = lerLista(tipo);

    if (tipo === 'atendimentos') {
        lista = prepararAtendimentos(lista);
    }

    renderizar(tipo, ordenar(tipo, lista));
}

function lerTipoDaUrl() {
    return decodeURIComponent(location.hash.slice(1));
}

function alterarTipoNaUrl(tipo) {
    location.replace('#' + tipo);
}

function lerUltimoTipo() {
    try {
        return sessionStorage.getItem('relatorio-tipo');
    } catch {
        return null;
    }
}

function gravarUltimoTipo(tipo) {
    try {
        sessionStorage.setItem('relatorio-tipo', tipo);
    } catch { }
}

function ordenar(tipo, lista) {
    const copia = [...lista];

    return tipo === 'atendimentos'
        ? copia.sort((a, b) =>
            String(b.data ?? '').localeCompare(String(a.data ?? ''))
        )
        : copia.sort((a, b) =>
            String(a.nome ?? '').localeCompare(String(b.nome ?? ''), 'pt-BR', { sensitivity: 'base' })
        );
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

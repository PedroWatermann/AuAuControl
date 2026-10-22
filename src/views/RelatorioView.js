const RELATORIOS = {
    clientes: {
        mensagemVazio: 'Nenhum cliente cadastrado.',
        colunas: [
            { titulo: 'Nome', valor: item => item.nome },
            { titulo: 'Telefone', valor: item => item.telefone },
            { titulo: 'E-mail', valor: item => item.email },
            { titulo: 'RG', valor: item => item.rg },
            { titulo: 'CPF', valor: item => item.cpf }
        ]
    },
    funcionarios: {
        mensagemVazio: 'Nenhum funcionário cadastrado.',
        colunas: [
            { titulo: 'Nome', valor: item => item.nome },
            { titulo: 'Matrícula', valor: item => item.numeroMatricula },
            { titulo: 'Qualificação', valor: item => item.qualificacao },
            { titulo: 'Função', valor: item => item.descricaoFuncao },
            { titulo: 'Carga horária', valor: item => item.cargaHorariaSemanal ? item.cargaHorariaSemanal + ' h/semana' : '' }
        ]
    },
    animais: {
        mensagemVazio: 'Nenhum animal cadastrado.',
        colunas: [
            { titulo: 'Nome', valor: item => item.nome },
            { titulo: 'Peso', valor: item => item.peso ? item.peso + ' kg' : '' },
            { titulo: 'Altura', valor: item => item.altura ? item.altura + ' cm' : '' }
        ]
    },
    atendimentos: {
        mensagemVazio: 'Nenhum atendimento registrado.',
        colunas: [
            { titulo: 'Código', valor: item => item.id },
            { titulo: 'Data', valor: item => formatarDataRelatorio(item.data) },
            { titulo: 'Cliente', valor: item => item.cliente },
            { titulo: 'Animal', valor: item => item.animal },
            { titulo: 'Funcionário', valor: item => item.funcionario }
        ]
    }
};

function obterTipoSelecionado() {
    return document.getElementById('tipo-relatorio').value;
}

function aoTrocarTipo(callback) {
    document.getElementById('tipo-relatorio').addEventListener('change', callback);
}

function aoClicarImprimir(callback) {
    document.getElementById('btn-imprimir').addEventListener('click', callback);
}

function renderizar(tipo, lista) {
    const config = RELATORIOS[tipo];
    if (!config) return;

    document.getElementById('relatorio-resumo').textContent =
        lista.length === 0
            ? config.mensagemVazio
            : `Todos os ${config.nomePlural}, ${lista.length} no total.`;

    document.getElementById('btn-imprimir').disabled = lista.length === 0;

    renderizarCabecalho(config.colunas);
    renderizarCorpo(config.colunas, lista);
}

function renderizarCabecalho(colunas) {
    const thead = document.getElementById('relatorio-cabecalho');
    thead.innerHTML = '';

    const tr = document.createElement('tr');

    const thNumero = document.createElement('th');
    thNumero.textContent = 'Nº';
    thNumero.className = 'text-primary';
    tr.appendChild(thNumero);

    for (const coluna of colunas) {
        const th = document.createElement('th');
        th.textContent = coluna.titulo;
        th.className = 'text-primary';
        tr.appendChild(th);
    }

    thead.appendChild(tr);
}

function renderizarCorpo(colunas, lista) {
    const tbody = document.getElementById('relatorio-corpo');
    tbody.innerHTML = '';

    if (lista.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = colunas.length + 1;
        td.className = 'text-center text-body-secondary py-4';
        td.textContent = RELATORIOS[obterTipoSelecionado()].mensagemVazio;
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    lista.forEach((item, indice) => {
        const tr = document.createElement('tr');

        const tdNumero = document.createElement('td');
        const selo = document.createElement('span');
        selo.className = 'badge rounded-pill text-bg-warning px-3';
        selo.textContent = indice + 1;
        tdNumero.appendChild(selo);
        tr.appendChild(tdNumero);

        for (const coluna of colunas) {
            const td = document.createElement('td');
            td.textContent = coluna.valor(item) ?? '';
            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    });
}

function imprimir() {
    window.print();
}

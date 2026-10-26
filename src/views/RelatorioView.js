const RelatorioView = {
    relatorios: {
        clientes: {
            nomePlural: 'clientes',
            mensagemVazio: 'Nenhum cliente cadastrado.',
            colunas: [
                { 
                    titulo: 'Nome', 
                    valor: item => item.nome 
                },
                { 
                    titulo: 'Telefone', 
                    valor: item => item.telefone, 
                    classe: 'text-nowrap' 
                },
                { 
                    titulo: 'E-mail', 
                    valor: item => item.email, 
                    classe: 'text-break' 
                },
                { 
                    titulo: 'RG', 
                    valor: item => item.rg, 
                    classe: 'text-nowrap' 
                },
                { 
                    titulo: 'CPF', 
                    valor: item => item.cpf, 
                    classe: 'text-nowrap' 
                }
            ]
        },
        funcionarios: {
            nomePlural: 'funcionários',
            mensagemVazio: 'Nenhum funcionário cadastrado.',
            colunas: [
                { 
                    titulo: 'Nome', 
                    valor: item => item.nome 
                },
                { 
                    titulo: 'Matrícula', 
                    valor: item => item.numeroMatricula, 
                    classe: 'text-nowrap' 
                },
                { 
                    titulo: 'Qualificação', 
                    valor: item => item.qualificacao 
                },
                { 
                    titulo: 'Função', 
                    valor: item => item.descricaoFuncao 
                },
                { 
                    titulo: 'Carga horária', 
                    valor: item => item.cargaHorariaSemanal ? item.cargaHorariaSemanal + ' h/semana' : '', 
                    classe: 'text-nowrap' 
                }
            ]
        },
        animais: {
            nomePlural: 'animais',
            mensagemVazio: 'Nenhum animal cadastrado.',
            colunas: [
                { 
                    titulo: 'Nome', 
                    valor: item => item.nome 
                },
                { 
                    titulo: 'Peso', 
                    valor: item => item.peso ? Utils.formatarNumero(item.peso) + ' kg' : '', 
                    classe: 'text-nowrap' 
                },
                { 
                    titulo: 'Altura', 
                    valor: item => item.altura ? Utils.formatarNumero(item.altura) + ' cm' : '', 
                    classe: 'text-nowrap' 
                }
            ]
        },
        atendimentos: {
            nomePlural: 'atendimentos',
            mensagemVazio: 'Nenhum atendimento registrado.',
            colunas: [
                { 
                    titulo: 'Código', 
                    valor: item => item.id, 
                    classe: 'text-nowrap' 
                },
                { 
                    titulo: 'Data', 
                    valor: item => Utils.formatarDataRelatorio(item.data), 
                    classe: 'text-nowrap' 
                },
                { 
                    titulo: 'Cliente', 
                    valor: item => item.cliente 
                },
                { 
                    titulo: 'Animal', 
                    valor: item => item.animal 
                },
                { 
                    titulo: 'Funcionário', 
                    valor: item => item.funcionario 
                }
            ]
        }
    },

    obterTipoSelecionado() {
        return document.getElementById('tipo-relatorio').value;
    },

    selecionarTipo(tipo) {
        if (this.relatorios[tipo]) {
            document.getElementById('tipo-relatorio').value = tipo;
        }
    },

    aoTrocarTipo(callback) {
        document.getElementById('tipo-relatorio').addEventListener('change', callback);
    },

    aoClicarImprimir(callback) {
        document.getElementById('btn-imprimir').addEventListener('click', callback);
    },

    aoPrepararImpressao(callback) {
        window.addEventListener('beforeprint', callback);
    },

    atualizarEmissao(texto) {
        document.getElementById('impressao-emissao').textContent = texto;
    },

    renderizar(tipo, lista) {
        const config = this.relatorios[tipo];
        if (!config) return;

        document.getElementById('relatorio-resumo').textContent =
            lista.length === 0
                ? config.mensagemVazio
                : `Todos os ${config.nomePlural}, ${lista.length} no total.`;

        document.getElementById('btn-imprimir').disabled = lista.length === 0;

        document.getElementById('impressao-titulo').textContent = `AuAu Control: Relatório de ${config.nomePlural}`;
        document.getElementById('impressao-total').textContent = `Total de registros: ${lista.length}`;

        this.renderizarCabecalho(config.colunas);
        this.renderizarCorpo(config, lista);
    },

    renderizarCabecalho(colunas) {
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
    },

    renderizarCorpo(config, lista) {
        const tbody = document.getElementById('relatorio-corpo');
        tbody.innerHTML = '';

        if (lista.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = config.colunas.length + 1;
            td.className = 'text-center text-body-secondary py-4';
            td.textContent = config.mensagemVazio;
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

            for (const coluna of config.colunas) {
                const td = document.createElement('td');
                td.className = coluna.classe ?? '';
                td.textContent = coluna.valor(item) ?? '';
                tr.appendChild(td);
            }

            tbody.appendChild(tr);
        });
    },

    imprimir() {
        window.print();
    }
};

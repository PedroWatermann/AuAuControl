const FuncionarioView = {
    formulario() {
        return document.getElementById('form-funcionario');
    },

    lerFormulario() {
        const campos = this.formulario().elements;
        return {
            id: campos.id.value,
            nome: campos.nome.value,
            matricula: campos.matricula.value,
            qualificacao: campos.qualificacao.value,
            funcao: campos.funcao.value,
            cargaHoraria: campos.cargaHoraria.value
        };
    },

    preencherFormulario(funcionario) {
        const campos = this.formulario().elements;
        campos.id.value = funcionario.id;
        campos.nome.value = funcionario.nome;
        campos.matricula.value = funcionario.numeroMatricula;
        campos.qualificacao.value = funcionario.qualificacao;
        campos.funcao.value = funcionario.descricaoFuncao;
        campos.cargaHoraria.value = funcionario.cargaHorariaSemanal;
    },

    limparFormulario() {
        this.formulario().reset();
    },

    entrarEdicao(funcionario, linha) {
        this.preencherFormulario(funcionario);
        FormularioView.entrarModoEdicao(this.formulario(), linha);
    },

    obterIdEmEdicao() {
        return this.formulario().elements.id.value;
    },

    obterBusca() {
        return document.getElementById('busca').value;
    },

    renderizarTabela(lista, mensagemVazio) {
        const tbody = document.getElementById('table-funcionarios');
        tbody.innerHTML = '';

        if (lista.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 7;
            td.className = 'text-center text-body-secondary py-4';
            td.textContent = mensagemVazio;
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        lista.forEach((funcionario, indice) => {
            const tr = document.createElement('tr');

            const tdNumero = document.createElement('td');
            const selo = document.createElement('span');
            selo.className = 'badge rounded-pill text-bg-warning px-3';
            selo.textContent = indice + 1;
            tdNumero.appendChild(selo);

            const tdNome = document.createElement('td');
            tdNome.textContent = funcionario.nome;

            const tdNumeroMatricula = document.createElement('td');
            tdNumeroMatricula.textContent = funcionario.numeroMatricula;

            const tdQualificacao = document.createElement('td');
            tdQualificacao.textContent = funcionario.qualificacao;

            const tdDescricaoFuncao = document.createElement('td');
            tdDescricaoFuncao.textContent = funcionario.descricaoFuncao;

            const tdCargaHorariaSemanal = document.createElement('td');
            tdCargaHorariaSemanal.textContent = `${Utils.formatarNumero(funcionario.cargaHorariaSemanal)} horas`;

            const tdAcoes = document.createElement('td');
            const acoes = document.createElement('div');
            acoes.className = 'd-flex gap-2 justify-content-end';
            acoes.append(
                this.criarBotao('alterar', 'Alterar', funcionario, 'btn-outline-primary'),
                this.criarBotao('remover', 'Remover', funcionario, 'btn-outline-danger')
            );
            tdAcoes.appendChild(acoes);

            tr.append(tdNumero, tdNome, tdNumeroMatricula, tdQualificacao, tdDescricaoFuncao, tdCargaHorariaSemanal, tdAcoes);
            tbody.appendChild(tr);
        });
    },

    criarBotao(acao, texto, funcionario, cor) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = `btn btn-sm ${cor} rounded-pill px-3 fw-semibold`;
        botao.textContent = texto;
        botao.dataset.acao = acao;
        botao.dataset.id = funcionario.id;
        botao.setAttribute('aria-label', `${texto} ${funcionario.nome}`);
        return botao;
    },

    mostrarMensagem(texto, tipo = 'success') {
        FormularioView.mostrarMensagem(texto, tipo);
    },

    esconderMensagem() {
        FormularioView.esconderMensagem();
    },

    confirmarRemocao(nome) {
        return ModalView.confirmar({
            titulo: 'Remover funcionário',
            mensagem: `Tem certeza que deseja remover "${nome}"? Essa ação não pode ser desfeita.`,
            textoConfirmar: 'Remover'
        });
    },

    aoSalvar(callback) {
        const form = this.formulario();

        form.addEventListener('submit', evento => {
            evento.preventDefault();
            callback(this.lerFormulario());
        });

        form.addEventListener('input', evento => this.desmarcarCampo(evento.target));
        form.addEventListener('reset', () => this.limparCamposInvalidos());
    },

    marcarCamposInvalidos(nomes) {
        const campos = this.formulario().elements;

        for (const nome of nomes) {
            campos[nome].classList.add('is-invalid');
            campos[nome].setAttribute('aria-invalid', 'true');
        }

        campos[nomes[0]].focus();
    },

    desmarcarCampo(campo) {
        campo.classList.remove('is-invalid');
        campo.removeAttribute('aria-invalid');
    },

    limparCamposInvalidos() {
        for (const campo of this.formulario().querySelectorAll('.is-invalid')) {
            this.desmarcarCampo(campo);
        }
    },

    aoBuscar(callback) {
        const busca = document.getElementById('busca');
        busca.addEventListener('input', () => callback());
        busca.form.addEventListener('submit', evento => {
            evento.preventDefault();
            callback();
        });
    },

    aoAlterar(callback) {
        this.aoClicarAcao('alterar', callback);
    },

    aoRemover(callback) {
        this.aoClicarAcao('remover', callback);
    },

    aoClicarAcao(acao, callback) {
        document.getElementById('table-funcionarios').addEventListener('click', evento => {
            const botao = evento.target.closest(`[data-acao="${acao}"]`);
            if (botao) {
                callback(botao.dataset.id, botao.closest('tr'));
            }
        });
    }
};

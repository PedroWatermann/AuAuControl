const ClienteView = {
    formulario() {
        return document.getElementById('form-cliente');
    },

    lerFormulario() {
        const campos = this.formulario().elements;
        return {
            id: campos.id.value,
            nome: campos.nome.value,
            telefone: campos.telefone.value,
            email: campos.email.value,
            rg: campos.rg.value,
            cpf: campos.cpf.value
        };
    },

    preencherFormulario(cliente) {
        const campos = this.formulario().elements;
        campos.id.value = cliente.id;
        campos.nome.value = cliente.nome;
        campos.telefone.value = cliente.telefone ?? '';
        campos.email.value = cliente.email ?? '';
        campos.rg.value = cliente.rg ?? '';
        campos.cpf.value = cliente.cpf;
    },

    limparFormulario() {
        this.formulario().reset();
    },

    entrarEdicao(cliente, linha) {
        this.preencherFormulario(cliente);
        FormularioView.entrarModoEdicao(this.formulario(), linha);
    },

    obterIdEmEdicao() {
        return this.formulario().elements.id.value;
    },

    obterBusca() {
        return document.getElementById('busca').value;
    },

    ativarMascaras() {
        const mascaras = {
            telefone: valor => Utils.formatarTelefone(valor),
            cpf: valor => Utils.formatarCpf(valor),
            rg: valor => Utils.formatarRg(valor)
        };
        const campos = this.formulario().elements;

        for (const [nome, formatar] of Object.entries(mascaras)) {
            const campo = campos[nome];

            campo.addEventListener('input', evento => {
                if (!evento.inputType?.startsWith('delete')) {
                    campo.value = formatar(campo.value);
                }
            });
            campo.addEventListener('blur', () => {
                campo.value = formatar(campo.value);
            });
        }
    },

    renderizarTabela(lista, mensagemVazio) {
        const tbody = document.getElementById('table-clientes');
        tbody.innerHTML = '';

        if (lista.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 6;
            td.className = 'text-center text-body-secondary py-4';
            td.textContent = mensagemVazio;
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        lista.forEach((cliente, indice) => {
            const tr = document.createElement('tr');

            const tdNumero = document.createElement('td');
            const selo = document.createElement('span');
            selo.className = 'badge rounded-pill text-bg-warning px-3';
            selo.textContent = indice + 1;
            tdNumero.appendChild(selo);
            tr.appendChild(tdNumero);

            for (const valor of [cliente.nome, cliente.telefone, cliente.email, cliente.cpf]) {
                const td = document.createElement('td');
                td.textContent = valor ?? '';
                tr.appendChild(td);
            }

            const tdAcoes = document.createElement('td');
            const acoes = document.createElement('div');
            acoes.className = 'd-flex gap-2 justify-content-end';
            acoes.append(
                this.criarBotao('alterar', 'Alterar', cliente, 'btn-outline-primary'),
                this.criarBotao('remover', 'Remover', cliente, 'btn-outline-danger')
            );
            tdAcoes.appendChild(acoes);
            tr.appendChild(tdAcoes);

            tbody.appendChild(tr);
        });
    },

    criarBotao(acao, texto, cliente, cor) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = `btn btn-sm ${cor} rounded-pill px-3 fw-semibold`;
        botao.textContent = texto;
        botao.dataset.acao = acao;
        botao.dataset.id = cliente.id;
        botao.setAttribute('aria-label', `${texto} ${cliente.nome}`);
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
            titulo: 'Remover cliente',
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
        document.getElementById('table-clientes').addEventListener('click', evento => {
            const botao = evento.target.closest(`[data-acao="${acao}"]`);
            if (botao) {
                callback(botao.dataset.id, botao.closest('tr'));
            }
        });
    }
};

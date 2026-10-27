const AtendimentoView = {
    formulario() {
        return document.getElementById('form-atendimento');
    },

    lerFormulario() {
        const campos = this.formulario().elements;
        return {
            id: campos.id.value,
            data: campos.data.value,
            cliente: campos.cliente.value,
            animal: campos.animal.value,
            funcionario: campos.funcionario.value
        };
    },

    preencherFormulario(atendimento) {
        const campos = this.formulario().elements;
        campos.id.value = atendimento.id;
        campos.data.value = atendimento.data;
        campos.cliente.value = atendimento.cliente;
        campos.animal.value = atendimento.animal;
        campos.funcionario.value = atendimento.funcionario;
    },

    limparFormulario() {
        this.formulario().reset();
    },

    entrarEdicao(atendimento, linha) {
        this.preencherFormulario(atendimento);
        FormularioView.entrarModoEdicao(this.formulario(), linha);
    },

    obterIdEmEdicao() {
        return this.formulario().elements.id.value;
    },

    obterBusca() {
        return document.getElementById('busca').value;
    },

    preencherOpcoes(campo, lista, idAviso) {
        const select = this.formulario().elements[campo];
        select.length = 1; // mantém só o placeholder
        lista.forEach(item => select.add(new Option(item.nome, item.id)));
        document.getElementById(idAviso).hidden = lista.length > 0;
    },


    renderizarTabela(lista, mensagemVazio) {
        const tbody = document.getElementById('table-atendimentos');
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

        lista.forEach((atendimento, indice) => {
            const tr = document.createElement('tr');

            const tdNumero = document.createElement('td');
            const selo = document.createElement('span');
            selo.className = 'badge rounded-pill text-bg-warning px-3';
            selo.textContent = indice + 1;
            tdNumero.appendChild(selo);
            
            const tdData = document.createElement('td');
            tdData.textContent = Utils.formatarDataRelatorio(atendimento.data);

            const tdCliente = document.createElement('td');
            tdCliente.textContent = atendimento.cliente;

            const tdAnimal = document.createElement('td');
            tdAnimal.textContent = atendimento.animal;

            const tdFuncionario = document.createElement('td');
            tdFuncionario.textContent = atendimento.funcionario;

            const tdAcoes = document.createElement('td');
            const acoes = document.createElement('div');
            acoes.className = 'd-flex gap-2 justify-content-end';
            acoes.append(
                this.criarBotao('alterar', 'Alterar', atendimento, 'btn-outline-primary'),
                this.criarBotao('remover', 'Remover', atendimento, 'btn-outline-danger')
            );
            tdAcoes.appendChild(acoes);

            tr.append(tdNumero, tdData, tdCliente, tdAnimal, tdFuncionario, tdAcoes);
            tbody.appendChild(tr);
        });
    },

    criarBotao(acao, texto, atendimento, cor) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = `btn btn-sm ${cor} rounded-pill px-3 fw-semibold`;
        botao.textContent = texto;
        botao.dataset.acao = acao;
        botao.dataset.id = atendimento.id;
        botao.setAttribute('aria-label', `${texto} atendimento n° ${atendimento.id}`);
        return botao;
    },

    mostrarMensagem(texto, tipo = 'success') {
        FormularioView.mostrarMensagem(texto, tipo);
    },

    esconderMensagem() {
        FormularioView.esconderMensagem();
    },

    confirmarRemocao(id) {
        return ModalView.confirmar({
            titulo: 'Remover atendimento',
            mensagem: `Tem certeza que deseja remover o atendimento n° ${id}? Essa ação não pode ser desfeita.`,
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
        document.getElementById('table-atendimentos').addEventListener('click', evento => {
            const botao = evento.target.closest(`[data-acao="${acao}"]`);
            if (botao) {
                callback(botao.dataset.id, botao.closest('tr'));
            }
        });
    }
};

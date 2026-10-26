const ClienteView = {
    // Lê os campos do formulário e devolve um objeto com eles
    obterDadosFormulario() {
        return {
            id: document.getElementById('id').value,
            nome: document.getElementById('nome').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            email: document.getElementById('email').value.trim(),
            rg: document.getElementById('rg').value.trim(),
            cpf: document.getElementById('cpf').value.trim()
        };
    },

    // Avisa o controller quando o usuário clicar em "Salvar cliente"
    aoSalvar(callback) {
        document.getElementById('form-cliente').addEventListener('submit', (evento) => {
            evento.preventDefault();
            callback();
        });
    },

    // Limpa todos os campos do formulário
    limparFormulario() {
        document.getElementById('form-cliente').reset();
    },

    // Mostra a mensagem verde no topo da página
    mostrarMensagem(texto) {
        const div = document.getElementById('message');
        div.textContent = texto;
        div.hidden = false;
    },

    // Desenha a tabela com a lista de clientes
    renderizarTabela(clientes) {
        const tbody = document.getElementById('table-clientes');
        tbody.innerHTML = ''; // apaga o que tinha antes

        clientes.forEach((cliente, indice) => {
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

            tbody.appendChild(tr);
        });
    }
};

class Cliente {
    static CHAVE = 'clientes';

    constructor(id, nome, telefone, email, rg, cpf) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.email = email;
        this.rg = rg;
        this.cpf = cpf;
    }

    static listar() {
        return Armazenamento.ler(this.CHAVE);
    }

    static buscar(id) {
        return this.listar().find(cliente => String(cliente.id) === String(id));
    }

    static salvar(dados) {
        const lista = this.listar();
        const cliente = new Cliente(
            dados.id || this.proximoId(lista),
            dados.nome, dados.telefone, dados.email, dados.rg, dados.cpf
        );

        const indice = lista.findIndex(item => String(item.id) === String(cliente.id));
        if (indice === -1) {
            lista.push(cliente);
        } else {
            lista[indice] = cliente;
        }

        Armazenamento.salvar(this.CHAVE, lista);
        return cliente;
    }

    static remover(id) {
        const lista = this.listar().filter(cliente => String(cliente.id) !== String(id));
        Armazenamento.salvar(this.CHAVE, lista);
    }

    static cpfEmUso(cpf, idIgnorado) {
        const digitos = String(cpf).replace(/\D/g, '');
        return this.listar().some(cliente =>
            String(cliente.cpf).replace(/\D/g, '') === digitos && String(cliente.id) !== String(idIgnorado)
        );
    }

    static contarAtendimentos(id) {
        return Armazenamento.ler('atendimentos').filter(atendimento => {
            const cliente = atendimento.cliente ?? atendimento._cliente;
            return String(cliente?.id ?? cliente) === String(id);
        }).length;
    }

    static proximoId(lista) {
        return lista.reduce((maior, cliente) => Math.max(maior, Number(cliente.id) || 0), 0) + 1;
    }
}

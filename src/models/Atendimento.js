class Atendimento {
    static CHAVE = 'atendimentos';

    constructor(id, data, cliente, animal, funcionario) {
        this.id = id;
        this.data = data;
        this.cliente = cliente;
        this.animal = animal;
        this.funcionario = funcionario;
    }

    static listar() {
        return Armazenamento.ler(this.CHAVE);
    }

    static buscar(id) {
        return this.listar().find(atendimento => String(atendimento.id) === String(id)) || this.listar().find(atendimento => String(atendimento.cliente) === String(id));
    }

    static salvar(dados) {
        const lista = this.listar();
        const atendimento = new Atendimento(dados.id || this.proximoId(lista), dados.data, dados.cliente, dados.animal, dados.funcionario);

        const indice = lista.findIndex(item => String(item.id) === String(atendimento.id));
        if (indice === -1) {
            lista.push(atendimento);
        } else {
            lista[indice] = atendimento;
        }

        Armazenamento.salvar(this.CHAVE, lista);
        return atendimento;
    }

    static remover(id) {
        const lista = this.listar().filter(atendimento => String(atendimento.id) !== String(id));
        Armazenamento.salvar(this.CHAVE, lista);
    }

    static proximoId(lista) {
        return lista.reduce((maior, atendimento) => Math.max(maior, Number(atendimento.id) || 0), 0) + 1;
    }
}

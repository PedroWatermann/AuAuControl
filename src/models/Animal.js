class Animal {
    static CHAVE = 'animais';

    constructor(id, nome, peso, altura) {
        this.id = id;
        this.nome = nome;
        this.peso = peso;
        this.altura = altura;
    }

    static listar() {
        return Armazenamento.ler(this.CHAVE);
    }

    static buscar(id) {
        return this.listar().find(animal => String(animal.id) === String(id));
    }

    static salvar(dados) {
        const lista = this.listar();
        const animal = new Animal(dados.id || this.proximoId(lista), dados.nome, dados.peso, dados.altura);

        const indice = lista.findIndex(item => String(item.id) === String(animal.id));
        if (indice === -1) {
            lista.push(animal);
        } else {
            lista[indice] = animal;
        }

        Armazenamento.salvar(this.CHAVE, lista);
        return animal;
    }

    static remover(id) {
        const lista = this.listar().filter(animal => String(animal.id) !== String(id));
        Armazenamento.salvar(this.CHAVE, lista);
    }

    static contarAtendimentos(id) {
        return Armazenamento
        .ler('atendimentos')
        .filter(atendimento => {
            const animal = atendimento.animal ?? atendimento._animal;
            return String(animal?.id ?? animal) === String(id);
        }).length;
    }

    static proximoId(lista) {
        return lista.reduce((maior, animal) => Math.max(maior, Number(animal.id) || 0), 0) + 1;
    }
}

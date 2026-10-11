class Atendimento {
    constructor(id, data, cliente, animal, funcionario) {
        this.id = id;
        this.data = data;
        this.cliente = cliente;
        this.animal = animal;
        this.funcionario = funcionario;
    }

    get cliente() {
        return this._cliente;
    }

    set cliente(cliente) {
        if (!(cliente instanceof Cliente))
            throw new TypeError("O cliente deve ser uma instância da classe Cliente");

        this._cliente = cliente;
    }

    get animal() {
        return this._animal;
    }

    set animal(animal) {
        if (!(animal instanceof Animal))
            throw new TypeError("O animal deve ser uma instância da classe Animal");

        this._animal = animal;
    }

    get funcionario() {
        return this._funcionario;
    }

    set funcionario(funcionario) {
        if (!(funcionario instanceof Funcionario))
            throw new TypeError("O funcionario deve ser uma instância da classe Funcionario");

        this._funcionario = funcionario;
    }
}

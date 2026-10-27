class Funcionario {
    static CHAVE = 'funcionarios';

    constructor(id, nome, numeroMatricula, qualificacao, descricaoFuncao, cargaHorariaSemanal) {
        this.id = id;
        this.nome = nome;
        this.numeroMatricula = numeroMatricula;
        this.qualificacao = qualificacao;
        this.descricaoFuncao = descricaoFuncao;
        this.cargaHorariaSemanal = cargaHorariaSemanal;
    }

    static listar() {
        return Armazenamento.ler(this.CHAVE);
    }

    static buscar(id) {
        return this.listar().find(funcionario => String(funcionario.id) === String(id));
    }

    static salvar(dados) {
        const lista = this.listar();
        const funcionario = new Funcionario(dados.id || this.proximoId(lista), dados.nome, dados.numeroMatricula, dados.qualificacao, dados.descricaoFuncao, dados.cargaHorariaSemanal);

        const indice = lista.findIndex(item => String(item.id) === String(funcionario.id));
        if (indice === -1) {
            lista.push(funcionario);
        } else {
            lista[indice] = funcionario;
        }

        Armazenamento.salvar(this.CHAVE, lista);
        return funcionario;
    }

    static remover(id) {
        const lista = this.listar().filter(funcionario => String(funcionario.id) !== String(id));
        Armazenamento.salvar(this.CHAVE, lista);
    }

    static matriculaEmUso(numeroMatricula, idIgnorado) {
        return this.listar().some(funcionario =>
            String(funcionario.numeroMatricula) === String(numeroMatricula) && String(funcionario.id) !== String(idIgnorado)
        );
    }

    static contarAtendimentos(id) {
        return Armazenamento
        .ler('atendimentos')
        .filter(atendimento => {
            const funcionario = atendimento.funcionario ?? atendimento._funcionario;
            return String(funcionario?.id ?? funcionario) === String(id);
        }).length;
    }

    static proximoId(lista) {
        return lista.reduce((maior, funcionario) => Math.max(maior, Number(funcionario.id) || 0), 0) + 1;
    }
}

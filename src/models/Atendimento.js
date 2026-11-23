class Atendimento {
    static CHAVE = 'atendimentos';

    static listar() { return Api.listar(this.CHAVE); }
    static buscar(id) { return Api.buscar(this.CHAVE, id); }
    static salvar(dados) { return Api.salvar(this.CHAVE, dados); }
    static remover(id) { return Api.remover(this.CHAVE, id); }
}
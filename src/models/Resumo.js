class Resumo {
    static CHAVE = 'resumo';
    static obter() { return Api.listar(this.CHAVE) }
}
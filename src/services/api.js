class ApiErro extends Error {
    constructor(mensagem, status, erros = []) {
        super(mensagem);
        this.status = status;
        this.erros = erros;
    }
}

const Api = {
    base: new URL('../../backend/', document.currentScript.src),

    listar(recurso) {
        return this.requisitar(recurso);
    },

    buscar(recurso, id) {
        return this.requisitar(recurso, { id });
    },

    salvar(recurso, dados) {
        return this.requisitar(recurso, null, { acao: 'salvar', ...dados });
    },

    remover(recurso, id) {
        return this.requisitar(recurso, null, { acao: 'remover', id });
    },

    async requisitar(recurso, parametros = null, corpo = null) {
        const url = new URL(`${recurso}.php`, this.base);
        if (parametros) {
            url.search = new URLSearchParams(parametros);
        }

        const opcoes = corpo 
            ? { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(corpo) 
            } 
            : { method: 'GET' }
        ;

        let resposta;
        try {
            resposta = await fetch(url, opcoes);
        } catch {
            throw new ApiErro('Não foi possível conectar ao servidor.', 0);
        }

        const dados = await resposta.json().catch(() => null);
        if (dados === null) {
            throw new ApiErro('Resposta inválida do servidor.', resposta.status);
        }

        if (!resposta.ok) {
            throw new ApiErro(
                dados.mensagem ?? 'Corrija os campos destacados.',
                resposta.status,
                dados.erros ?? []
            );
        }

        return dados;
    }
};

const StorageService = {
    // Devolve a lista salva naquela chave (ou [] se não tiver nada)
    listar(chave) {
        try {
            return JSON.parse(localStorage.getItem(chave)) || [];
        } catch {
            return [];
        }
    },

    // Grava a lista inteira por cima do que estava lá
    salvarTodos(chave, lista) {
        const texto = JSON.stringify(lista);
        localStorage.setItem(chave, texto);
    },

    // Cria um id único
    gerarId() {
        return Date.now().toString(); // pronto, é um "timestamp" em texto
    },

    // Devolve UM item pelo id, ou undefined se não achar
    buscarPorId(chave, id) {
        return this.listar(chave).find(item => item.id === id);
    },

    // Se o objeto não tem id: gera um e adiciona no fim da lista.
    // Se já tem id: substitui o antigo (isso é o "Alterar").
    salvar(chave, objeto) {
        const lista = this.listar(chave);
        if (!objeto.id) {
            objeto.id = this.gerarId();
            lista.push(objeto);
        } else {
            const posicao = lista.findIndex(item => item.id === objeto.id);
            lista[posicao] = objeto;
        }
        this.salvarTodos(chave, lista);
        return objeto;
    },

    // Remove o item com aquele id
    remover(chave, id) {
        const novaLista = this.listar(chave).filter(item => item.id !== id);
        this.salvarTodos(chave, novaLista);
    }
};

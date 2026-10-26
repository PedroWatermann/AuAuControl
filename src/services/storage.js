const Armazenamento = {
    ler(chave) {
        try {
            return JSON.parse(localStorage.getItem(chave)) || [];
        } catch {
            return [];
        }
    },

    salvar(chave, lista) {
        localStorage.setItem(chave, JSON.stringify(lista));
    }
};

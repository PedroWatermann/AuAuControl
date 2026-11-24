const InicioView = {
    mostrarTotal(id, total) {
        document.getElementById(id).textContent = Utils.formatarNumero(total);
    },

    mostrarIndisponivel() {
        for (const id of ['total-clientes', 'total-funcionarios', 'total-animais', 'total-atendimentos']) {
            document.getElementById(id).textContent = '—';
        }
    }
};

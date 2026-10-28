const InicioView = {
    mostrarTotal(id, total) {
        document.getElementById(id).textContent = Utils.formatarNumero(total);
    }
};
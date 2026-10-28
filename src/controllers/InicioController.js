const InicioController = {
    iniciar() {
        InicioView.mostrarTotal('total-clientes', Cliente.listar().length);
        InicioView.mostrarTotal('total-funcionarios', Funcionario.listar().length);
        InicioView.mostrarTotal('total-animais', Animal.listar().length);
        InicioView.mostrarTotal('total-atendimentos', Atendimento.listar().length);
    }
};

document.addEventListener('DOMContentLoaded', () => InicioController.iniciar());
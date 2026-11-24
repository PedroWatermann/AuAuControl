const InicioController = {
    async iniciar() {
        try {
            const resumo = await Resumo.obter();

            InicioView.mostrarTotal('total-clientes', resumo.clientes);
            InicioView.mostrarTotal('total-funcionarios', resumo.funcionarios);
            InicioView.mostrarTotal('total-animais', resumo.animais);
            InicioView.mostrarTotal('total-atendimentos', resumo.atendimentos);
        } catch (erro) {
            console.error(erro);
            InicioView.mostrarIndisponivel();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => InicioController.iniciar());
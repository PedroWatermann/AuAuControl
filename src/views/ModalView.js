const ModalView = {
    dialogo: null,

    criar() {
        const dialogo = document.createElement('dialog');
        dialogo.className = 'border-0 rounded-4 shadow p-0';
        dialogo.setAttribute('aria-labelledby', 'modal-titulo');
        dialogo.setAttribute('aria-describedby', 'modal-mensagem');

        dialogo.innerHTML = `
            <form method="dialog">
                <div class="px-4 pt-4">
                    <h2 class="fs-5 fw-bold text-primary mb-0" id="modal-titulo"></h2>
                </div>
                <p class="px-4 py-3 mb-0 text-body-secondary" id="modal-mensagem"></p>
                <div class="d-flex flex-column flex-sm-row justify-content-end gap-2 px-4 pb-4">
                    <button value="cancelar" class="btn btn-outline-primary rounded-pill px-4 fw-bold" autofocus>Cancelar</button>
                    <button value="confirmar" class="btn btn-danger rounded-pill px-4 fw-bold" id="modal-confirmar"></button>
                </div>
            </form>
        `;

        dialogo.addEventListener('click', evento => {
            if (evento.target === dialogo) {
                dialogo.close('cancelar');
            }
        });

        document.body.appendChild(dialogo);
        return dialogo;
    },

    confirmar({ titulo, mensagem, textoConfirmar = 'Confirmar' }) {
        this.dialogo ??= this.criar();

        if (this.dialogo.open) {
            return Promise.resolve(false);
        }

        document.getElementById('modal-titulo').textContent = titulo;
        document.getElementById('modal-mensagem').textContent = mensagem;
        document.getElementById('modal-confirmar').textContent = textoConfirmar;

        return new Promise(resolver => {
            this.dialogo.returnValue = '';
            this.dialogo.addEventListener(
                'close', 
                () => resolver(this.dialogo.returnValue === 'confirmar'), 
                { once: true }
            );
            this.dialogo.showModal();
        });
    }
};

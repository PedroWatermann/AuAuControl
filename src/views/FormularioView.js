const FormularioView = {
    elementosComTextoDeEdicao(form) {
        return form.closest('section').querySelectorAll('[data-texto-edicao]');
    },

    entrarModoEdicao(form, linha) {
        for (const elemento of this.elementosComTextoDeEdicao(form)) {
            elemento.dataset.textoPadrao ??= elemento.textContent;
            elemento.textContent = elemento.dataset.textoEdicao;
        }

        document.querySelectorAll('tr.table-active').forEach(tr => tr.classList.remove('table-active'));
        linha?.classList.add('table-active');

        const semAnimacao = matchMedia('(prefers-reduced-motion: reduce)').matches;
        form.closest('section').scrollIntoView({ behavior: semAnimacao ? 'auto' : 'smooth', block: 'start' });

        form.querySelector('input:not([hidden]), select')?.focus({ preventScroll: true });
    },

    sairModoEdicao(form) {
        for (const elemento of this.elementosComTextoDeEdicao(form)) {
            if (elemento.dataset.textoPadrao) {
                elemento.textContent = elemento.dataset.textoPadrao;
            }
        }

        document.querySelectorAll('tr.table-active').forEach(tr => tr.classList.remove('table-active'));
    },

    temporizadorMensagem: null,

    mostrarMensagem(texto, tipo = 'success') {
        const mensagem = document.getElementById('message');
        clearTimeout(this.temporizadorMensagem);

        mensagem.classList.remove('alert-success', 'alert-danger', 'border-success', 'border-danger');
        mensagem.classList.add(`alert-${tipo}`, `border-${tipo}`);
        mensagem.textContent = texto;
        mensagem.hidden = false;

        void mensagem.offsetWidth;
        mensagem.classList.add('show');

        this.temporizadorMensagem = setTimeout(() => this.esconderMensagem(), 5000);
    },

    esconderMensagem() {
        const mensagem = document.getElementById('message');
        clearTimeout(this.temporizadorMensagem);

        mensagem.classList.remove('show');
        this.temporizadorMensagem = setTimeout(() => {
            mensagem.hidden = true;
        }, 150);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    for (const form of document.querySelectorAll('form')) {
        if (form.elements.id) {
            form.addEventListener('reset', () => FormularioView.sairModoEdicao(form));
        }
    }
});

const Utils = {
    formatarDataRelatorio(data) {
        if (!data) return '';
        const [ano, mes, dia] = String(data).split('-');
        return dia && mes && ano ? `${dia}/${mes}/${ano}` : data;
    },
    
    formatarDataHora(dataHora) {
        const data = dataHora.toLocaleDateString('pt-BR');
        const hora = dataHora.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        return `${data} às ${hora}`;
    },

    somenteDigitos(texto) {
        return String(texto ?? '').replace(/\D/g, '');
    },

    formatarCpf(valor) {
        const d = this.somenteDigitos(valor).slice(0, 11);
        if (d.length <= 3) return d;
        if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
        if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
        return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
    },

    formatarTelefone(valor) {
        const d = this.somenteDigitos(valor).slice(0, 11);
        if (d.length === 0) return '';
        if (d.length <= 2) return `(${d}`;

        const ddd = `(${d.slice(0, 2)}) `;
        const numero = d.slice(2);

        if (d.length <= 10) {
            return numero.length <= 4 ? ddd + numero : `${ddd}${numero.slice(0, 4)}-${numero.slice(4)}`;
        }
        return `${ddd}${numero[0]} ${numero.slice(1, 5)}-${numero.slice(5)}`;
    },

    formatarRg(valor) {
        const c = String(valor ?? '').toUpperCase().replace(/[^\dX]/g, '').slice(0, 9);
        if (c.length <= 2) return c;
        if (c.length <= 5) return `${c.slice(0, 2)}.${c.slice(2)}`;
        if (c.length <= 8) return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5)}`;
        return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}-${c.slice(8)}`;
    },

    formatarNumero(valor) {
        return Number(valor).toLocaleString('pt-BR');
    },

    normalizarTexto(texto) {
        return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    }
}

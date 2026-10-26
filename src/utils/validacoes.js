const Validacoes = {
    preenchido(valor) {
        return String(valor ?? '').trim() !== '';
    },

    numeroPositivo(valor) {
        const numero = Number(valor);
        return valor !== '' && Number.isFinite(numero) && numero > 0;
    },

    cpf(valor) {
        const d = String(valor ?? '').replace(/\D/g, '');
        if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

        const digitoVerificador = base => {
            let soma = 0;
            for (let i = 0; i < base.length; i++) {
                soma += Number(base[i]) * (base.length + 1 - i);
            }
            const resto = (soma * 10) % 11;
            return resto === 10 ? 0 : resto;
        };

        return digitoVerificador(d.slice(0, 9)) === Number(d[9])
            && digitoVerificador(d.slice(0, 10)) === Number(d[10]);
    },

    email(valor) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor ?? '').trim());
    },

    telefone(valor) {
        const quantidade = String(valor ?? '').replace(/\D/g, '').length;
        return quantidade === 10 || quantidade === 11;
    }
};

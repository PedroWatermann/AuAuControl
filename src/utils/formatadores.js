function formatarDataRelatorio(data) {
    if (!data) return '';
    const [ano, mes, dia] = String(data).split('-');
    return dia && mes && ano ? `${dia}/${mes}/${ano}` : data;
}

function formatarDataHora(dataHora) {
    const data = dataHora.toLocaleDateString('pt-BR');
    const hora = dataHora.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    return `${data} às ${hora}`;
}

function formatarDataRelatorio(data) {
    if (!data) return '';
    const [ano, mes, dia] = String(data).split('-');
    return dia && mes && ano ? `${dia}/${mes}/${ano}` : data;
}
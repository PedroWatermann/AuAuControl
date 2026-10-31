document.addEventListener("DOMContentLoaded", () => {
    preencherSidebar();
});

const MENU = [
    {
        texto: 'Cadastros',
        itens: [
            {
                texto: 'Clientes',
                href: 'pages/clientes.html',
                pagina: 'clientes'
            },
            {
                texto: 'Funcionários',
                href: 'pages/funcionarios.html',
                pagina: 'funcionarios'
            },
            {
                texto: 'Animais',
                href: 'pages/animais.html',
                pagina: 'animais'
            },
            {
                texto: 'Atendimentos',
                href: 'pages/atendimentos.html',
                pagina: 'atendimentos'
            }
        ]
    },
    {
        texto: 'Relatórios',
        href: 'pages/relatorios.html',
        pagina: 'relatorios'
    }
];

function criarCabecalho(base) {
    const link = document.createElement('a');
    link.href = base + 'index.html';
    link.className = 'd-flex align-items-center gap-2 text-white text-decoration-none fs-5 fw-bold';

    const logo = document.createElement('img');
    logo.src = base + 'assets/img/logo-512.png';
    logo.alt = '';
    logo.width = 48;
    logo.height = 48;

    const nome = document.createElement('span');
    nome.textContent = 'AuAu Control';

    link.append(logo, nome);
    return link;
}

function alternarMenu(abrir) {
    const nav = document.getElementById('menu-principal');
    const fundo = document.getElementById('menu-fundo');
    const botao = document.getElementById('botao-menu');

    nav.classList.toggle('aberto', abrir);
    fundo.classList.toggle('aberto', abrir);

    botao.textContent = abrir ? '✕' : '☰';
    botao.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    botao.setAttribute('aria-expanded', String(abrir));
}

function criarBotaoMenu() {
    const botao = document.createElement('button');
    botao.id = 'botao-menu';
    botao.type = 'button';
    botao.className = 'btn text-white fs-2 lh-1 p-1 border-0 d-md-none';
    botao.textContent = '☰';
    botao.setAttribute('aria-label', 'Abrir menu');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-controls', 'menu-principal');

    botao.addEventListener('click', () => {
        const aberto = document.getElementById('menu-principal').classList.contains('aberto');
        alternarMenu(!aberto);
    });
    return botao;
};


function criarTopo(base) {
    const topo = document.createElement('div');
    topo.className = 'd-flex align-items-center justify-content-between mb-md-4';
    topo.append(criarCabecalho(base), criarBotaoMenu());
    return topo;
}

function criarPaginaLink(item, base, atual) {
    const a = document.createElement('a');
    a.href = base + item.href;
    a.textContent = item.texto;
    a.className = 'nav-link';

    if (item.pagina === atual) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
    }

    return a;
}

function criarLinkSolto(item, base, atual) {
    const a = criarPaginaLink(item, base, atual);
    a.classList.add('text-warning', 'fw-bold');
    return a;
}

function criarGrupo(grupo, base, atual) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = grupo.texto;
    summary.className = 'nav-link text-warning fw-bold dropdown-toggle';

    const ul = document.createElement('ul');
    ul.className = 'nav nav-pills flex-column gap-1 mb-2';

    for (const item of grupo.itens.sort((a, b) => a.texto.localeCompare(b.texto))) {
        const li = document.createElement('li');
        li.className = 'nav-item';
        const link = criarPaginaLink(item, base, atual);
        link.classList.add('text-white');
        li.appendChild(link);
        ul.appendChild(li);

        if (item.pagina === atual) {
            details.open = true;
        }
    }

    details.append(summary, ul);
    return details;
}

function preencherSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList = 'col-md-3 col-xl-2 d-flex flex-column p-3 d-print-none';
    const base = document.body.dataset.pathBase ?? '';
    const atual = document.body.dataset.page;

    const nav = document.createElement('nav');
    nav.id = 'menu-principal';
    nav.className = 'nav nav-pills flex-column gap-1';

    for (const entrada of MENU) {
        nav.appendChild(
            entrada.itens
                ? criarGrupo(entrada, base, atual)
                : criarLinkSolto(entrada, base, atual)
        );
    }

    sidebar.append(criarTopo(base), nav);
    const fundo = document.createElement('div');
    fundo.id = 'menu-fundo';
    fundo.className = 'd-md-none';
    fundo.addEventListener('click', () => alternarMenu(false));
    document.body.appendChild(fundo);
}

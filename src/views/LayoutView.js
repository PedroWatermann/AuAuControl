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
    link.className = 'sidebar-header';

    const logo = document.createElement('img');
    logo.src = base + 'assets/img/logo-512.png';
    logo.alt = '';

    const nome = document.createElement('span');
    nome.textContent = 'AuAu Control';

    link.append(logo, nome);
    return link;
}

function criarPaginaLink(item, base, atual) {
    const a = document.createElement('a');
    a.href = base + item.href;
    a.textContent = item.texto;

    if (item.pagina === atual) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
    }

    return a;
}

function criarGrupo(grupo, base, atual) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = grupo.texto;

    const ul = document.createElement('ul');

    for (const item of grupo.itens) {
        const li = document.createElement('li');
        li.appendChild(criarPaginaLink(item, base, atual));
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
    const base = document.body.dataset.pathBase ?? '';
    const atual = document.body.dataset.page;

    const nav = document.createElement('nav');

    for (const entrada of MENU) {
        nav.appendChild(
            entrada.itens 
                ? criarGrupo(entrada, base, atual) 
                : criarPaginaLink(entrada, base, atual)
        );
    }

    sidebar.append(criarCabecalho(base), nav);
}

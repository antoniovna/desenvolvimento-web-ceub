const headerHTML = `
    <nav class="hub-navbar">
        <ul>
            <li><a href="./index.html" id="nav-inicio">Início</a></li>
            <li><a href="./quem-sou-eu.html" id="nav-quem-sou-eu">Quem sou eu?</a></li>
            <li class="dropdown">
                <a href="./aulas.html" class="dropbtn" id="nav-aulas">Aulas</a>
                <div class="dropdown-content">
                    <a href="./relatorios/Aula%201/">Introdução ao HTML</a>
                    <a href="./relatorios/Aula%202/fabrica_de_atletas.html">Listas e Forms</a>
                    <a href="./relatorios/Aula%203/">Menu, Imagens</a>
                    <a href="./relatorios/Aula%204/">Cards, Audio players</a>
                    <a href="./relatorios/Aula%207/index.html">Landing Page GameTECH</a>
                    <a href="./relatorios/Aula%208/index.html">Tabela Periódica</a>
                    <a href="./relatorios/Aula%209/index.html">Fotógrafo</a>
                </div>
            </li>
            <li><a href="relatorios.html" id="nav-relatorios">Relatórios</a></li>
            <li><a href="contato.html" id="nav-contato">Contato</a></li>
        </ul>
    </nav>
`;

document.getElementById('header-container').innerHTML = headerHTML;

// Destacar link ativo no menu correspondente à página atual
const path = window.location.pathname;
const page = path.split("/").pop() || "index.html";

const navIdMap = {
    "index.html": "nav-inicio",
    "quem-sou-eu.html": "nav-quem-sou-eu",
    "aulas.html": "nav-aulas",
    "relatorios.html": "nav-relatorios",
    "contato.html": "nav-contato"
};

const activeId = navIdMap[page];
if (activeId) {
    const activeElement = document.getElementById(activeId);
    if (activeElement) {
        activeElement.classList.add("active");
    }
}

// ===== AOS init =====
AOS.init({
    once: true,
    duration: 800,
    easing: 'ease-out-cubic',
    offset: 80
});

// ===== Navbar: classe ao rolar =====
const navbar = document.getElementById('mainNav');
const toggleNavbarScroll = () => {
    if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
};
window.addEventListener('scroll', toggleNavbarScroll, { passive: true });
toggleNavbarScroll();

// ===== Scrollspy customizado (IntersectionObserver) =====
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('#navMenu .nav-link');

const setActiveLink = (id) => {
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${id}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
};

// Observa cada seção e ativa o link correspondente quando ela
// estiver ocupando a faixa central da viewport (abaixo da navbar).
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
        }
    });
}, {
    // topo descontando a navbar (~90px) e bottom para dar prioridade
    // à seção que está ocupando o centro da tela
    rootMargin: '-90px 0px -55% 0px',
    threshold: 0
});

sections.forEach(section => observer.observe(section));

// Garante que ao chegar no topo o "Início" fique destacado
window.addEventListener('scroll', () => {
    if (window.scrollY < 100) setActiveLink('hero');
}, { passive: true });

// ===== Fechar menu mobile ao clicar em link =====
const allNavLinks = document.querySelectorAll('#navMenu .nav-link, #navMenu .btn-brand');
const navCollapse = document.getElementById('navMenu');
allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navCollapse.classList.contains('show')) {
            new bootstrap.Collapse(navCollapse).hide();
        }
    });
});

// ===== Ano no footer =====
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

let FULL_TEAMS = [];
let MATCHES = [];
let FULL_STADIUMS = [];
const letters = "ABCDEFGHIJKL".split("");

async function loadData() {
    try {
        const teamsRes = await fetch('./json/worldcup.teams_meta.json');
        const teamsData = await teamsRes.json();
        
        const matchesRes = await fetch('./json/worldcup.json');
        const matchesData = await matchesRes.json();
        
        const stadiumsRes = await fetch('./json/worldcup.stadiums.json');
        const stadiumsData = await stadiumsRes.json();
        
        processTeams(teamsData);
        processMatches(matchesData.matches);
        processStadiums(stadiumsData.stadiums);
        
        renderGroups();
        renderBracket();
        renderStadiums();
        renderTeams();
        
        // Timeout para garantir que o DOM renderizou completamente antes de inicializar o scrollspy
        setTimeout(() => {
            initScrollSpy();
            initAnimations();
        }, 100);
    } catch (e) {
        console.error("Erro ao carregar dados:", e);
    }
}

function processTeams(teamsData) {
    FULL_TEAMS = teamsData.map((t, index) => {
        return {
            id: index + 1,
            name: t.name,
            group: t.group,
            conf: t.confed,
            continent: t.continent,
            flag_url: `https://flagcdn.com/w80/${t.iso2}.png`,
            fifa_code: t.fifa_code,
            pts: 0, pj: 3, v: 0, e: 0, d: 0, sg: 0
        };
    });
    
    // Assign dummy stats to maintain layout look
    letters.forEach(letter => {
        let groupTeams = FULL_TEAMS.filter(t => t.group === letter);
        const ptsArray = [7, 5, 3, 1];
        const vArray = [2, 1, 1, 0];
        const eArray = [1, 2, 0, 1];
        const dArray = [0, 0, 2, 2];
        const sgArray = [3, 1, -1, -3];
        groupTeams.forEach((t, i) => {
            if(i < 4) {
                t.pts = ptsArray[i];
                t.v = vArray[i];
                t.e = eArray[i];
                t.d = dArray[i];
                t.sg = sgArray[i];
            }
        });
    });
}

function processMatches(matchesData) {
    MATCHES = matchesData;
}

function processStadiums(stadiumsData) {
    FULL_STADIUMS = stadiumsData.map(stadium => {
        return {
            name: stadium.name,
            city: stadium.city,
            country_code: stadium.cc,
            timezone: stadium.timezone,
            capacity: stadium.capacity,
            coords: stadium.coords,
            flag_url: `https://flagcdn.com/w120/${stadium.cc}.png`
        };
    });
}

function getTeamInfo(teamName) {
    let t = FULL_TEAMS.find(x => x.name === teamName);
    if (t) return { name: t.name, flag_url: t.flag_url };
    return { name: teamName, flag_url: 'https://flagcdn.com/w80/un.png' }; // Default para placeholders
}

// ========================================
// RENDER GROUPS
// ========================================
function renderGroups() {
    const groupsAF = document.getElementById("groups-af-container");
    const groupsGL = document.getElementById("groups-gl-container");

    letters.forEach((letter, index) => {
        let groupTeams = FULL_TEAMS.filter(t => t.group === letter).sort((a, b) => b.pts - a.pts);

        let html = `
        <div class="col-md-6 col-lg-4">
            <div class="group-card">
                <div class="group-card-header">
                    <div class="group-letter">GRUPO ${letter}</div>
                    <div class="group-status">FASE 1</div>
                </div>
                <table class="group-table">
                    <thead>
                        <tr>
                            <th>Seleção</th>
                            <th>PTS</th>
                            <th>PJ</th>
                            <th>SG</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${groupTeams.map((t, i) => `
                        <tr class="${i < 2 ? 'qualified' : ''}">
                            <td>
                                <div class="team-cell">
                                    <img src="${t.flag_url}" alt="${t.name}" class="team-flag">
                                    <span class="team-name">${t.name}</span>
                                </div>
                            </td>
                            <td class="pts-cell">${t.pts}</td>
                            <td>3</td>
                            <td>${t.sg > 0 ? '+' + t.sg : t.sg}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        `;

        if (index < 6) {
            if (groupsAF) groupsAF.innerHTML += html;
        } else {
            if (groupsGL) groupsGL.innerHTML += html;
        }
    });
}

// ========================================
// RENDER STADIUMS
// ========================================
function renderStadiums() {
    const stadiumsContainer = document.getElementById("stadiums-container");
    
    if (!stadiumsContainer) return;
    
    stadiumsContainer.innerHTML = FULL_STADIUMS.map(stadium => `
        <div class="col-md-6 col-lg-4">
            <div class="stadium-card fade-in-up">
                <div class="stadium-card-header">
                    <div class="stadium-info-title">
                        <div class="stadium-name">${stadium.name}</div>
                        <div class="stadium-city">${stadium.city}</div>
                    </div>
                </div>
                <div class="stadium-card-body">
                    <div class="stadium-detail">
                        <div class="stadium-detail-icon">
                            <i class="bi bi-people-fill"></i>
                        </div>
                        <div class="stadium-detail-content">
                            <div class="stadium-detail-label">Capacidade</div>
                            <div class="stadium-detail-value stadium-capacity">${stadium.capacity.toLocaleString('pt-BR')} lugares</div>
                        </div>
                    </div>
                    <div class="stadium-detail">
                        <div class="stadium-detail-icon">
                            <i class="bi bi-clock-fill"></i>
                        </div>
                        <div class="stadium-detail-content">
                            <div class="stadium-detail-label">Fuso Horário</div>
                            <div class="stadium-detail-value stadium-timezone">${stadium.timezone}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ========================================
// RENDER BRACKET
// ========================================
function createMatchCard(id, date, team1Name, team2Name, score1, score2, winner) {
    const t1 = getTeamInfo(team1Name);
    const t2 = getTeamInfo(team2Name);

    return `
    <div class="col-md-6 col-lg-3">
        <div class="match-card">
            <div class="match-header">
                <span class="match-id">${id}</span>
                <span class="match-date">${date}</span>
            </div>
            <div class="match-teams">
                <div class="match-team ${winner === 1 ? 'winner' : ''}">
                    <div class="match-team-info">
                        <img src="${t1.flag_url}" alt="${t1.name}" class="team-flag">
                        <span class="team-name">${t1.name}</span>
                    </div>
                    <div class="match-score">${score1}</div>
                </div>
                <div class="match-team ${winner === 2 ? 'winner' : ''}">
                    <div class="match-team-info">
                        <img src="${t2.flag_url}" alt="${t2.name}" class="team-flag">
                        <span class="team-name">${t2.name}</span>
                    </div>
                    <div class="match-score">${score2}</div>
                </div>
            </div>
        </div>
    </div>
    `;
}

function renderBracket() {
    const round16 = document.getElementById("round-16-container");
    const quarter = document.getElementById("quarter-container");
    const semi = document.getElementById("semi-container");
    const final = document.getElementById("final-container");

    const r16Matches = MATCHES.filter(m => m.round === "Round of 16");
    const qMatches = MATCHES.filter(m => m.round === "Quarter-final");
    const sMatches = MATCHES.filter(m => m.round === "Semi-final");
    const thirdMatch = MATCHES.find(m => m.round === "Match for third place");
    const finalMatch = MATCHES.find(m => m.round === "Final");

    if (round16) {
        round16.innerHTML = r16Matches.map(m => createMatchCard(`JOGO ${m.num}`, m.date, m.team1, m.team2, "-", "-", 0)).join('');
    }
    
    if (quarter) {
        quarter.innerHTML = qMatches.map(m => createMatchCard(`JOGO ${m.num}`, m.date, m.team1, m.team2, "-", "-", 0)).join('');
    }
    
    if (semi) {
        semi.innerHTML = sMatches.map(m => createMatchCard(`JOGO ${m.num}`, m.date, m.team1, m.team2, "-", "-", 0)).join('');
    }

    if (final && thirdMatch && finalMatch) {
        final.innerHTML = `
            ${createMatchCard("3º LUGAR", thirdMatch.date, thirdMatch.team1, thirdMatch.team2, "-", "-", 0)}
            ${createMatchCard("FINAL", finalMatch.date, finalMatch.team1, finalMatch.team2, "-", "-", 0)}
        `;
    }
}

// ========================================
// RENDER TEAMS (SIDEBAR & DETALHES)
// ========================================
function generateMockPlayers(teamName) {
    return [
        { num: 1, name: "Goleiro Titular", pos: "Goleiro" },
        { num: 10, name: "Craque do " + teamName, pos: "Meio-Campo" },
        { num: 9, name: "Artilheiro", pos: "Atacante" }
    ];
}

function renderTeams() {
    const sidebar = document.getElementById("sidebar-selecoes");
    const container = document.getElementById("detalhes-container");

    if (!sidebar || !container) return;

    let sidebarHTML = '';
    let contentHTML = '';

    letters.forEach(letter => {
        let groupTeams = FULL_TEAMS.filter(t => t.group === letter);
        if (groupTeams.length === 0) return;

        // Group Header - Sidebar
        sidebarHTML += `
        <div class="sidebar-group-header mt-4 mb-2 px-2 text-muted fw-bold text-uppercase" style="font-size: 0.8rem; letter-spacing: 2px;">
            Grupo ${letter}
        </div>
        `;

        // Group Header - Content
        contentHTML += `
        <div class="group-section-title mb-4 mt-5 pb-2" style="border-bottom: 2px solid var(--border-subtle);" id="group-content-${letter}">
            <h2 class="text-warning m-0" style="font-weight: 800; font-size: 2rem;"><i class="bi bi-grid-3x3-gap-fill me-2"></i>GRUPO ${letter}</h2>
        </div>
        `;

        groupTeams.forEach((t) => {
            let slug = t.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
            let players = generateMockPlayers(t.name);

            // --- Sidebar Menu ---
            sidebarHTML += `
            <div class="sidebar-country" id="nav-item-${slug}">
                <a href="#team-${slug}" class="sidebar-country-header">
                    <img src="${t.flag_url}" alt="Bandeira ${t.name}" class="flag-sm">
                    ${t.name}
                </a>
                <div class="sidebar-subnav">
                    <a href="#team-${slug}-info" class="sidebar-subitem">Visão Geral</a>
                    <a href="#team-${slug}-jogadores" class="sidebar-subitem">Jogadores</a>
                </div>
            </div>
            `;

            // --- Detalhes Content ---
            contentHTML += `
            <div class="team-detail-section" id="team-${slug}">
                <div class="team-detail-header" id="team-${slug}-info">
                    <img src="${t.flag_url}" alt="${t.name}" class="team-detail-flag">
                    <div>
                        <h3 class="team-detail-title">${t.name}</h3>
                        <div class="team-detail-meta">GRUPO ${t.group} • ${t.conf} • ${t.continent} • FIFA: ${t.fifa_code}</div>
                    </div>
                </div>

                <div class="sub-section" id="team-${slug}-jogadores">
                    <h4 class="sub-section-title"><i class="bi bi-people-fill"></i> Jogadores em Destaque</h4>
                    <div class="player-list">
                        ${players.map(p => `
                        <div class="player-card">
                            <div class="player-number">${p.num}</div>
                            <div class="player-info">
                                <span class="player-name">${p.name}</span>
                                <span class="player-pos">${p.pos}</span>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            `;
        });
    });

    sidebar.innerHTML = sidebarHTML;
    container.innerHTML = contentHTML;
}

function initScrollSpy() {
    const mainSections = document.querySelectorAll('.team-detail-section');
    const subSections = document.querySelectorAll('.team-detail-header, .sub-section');
    const navItems = document.querySelectorAll('.sidebar-country');
    const subItems = document.querySelectorAll('.sidebar-subitem');
    const sidebar = document.getElementById('sidebar-selecoes');

    // Smooth scroll for sidebar links
    document.querySelectorAll('.sidebar-country-header, .sidebar-subitem').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetEl = document.getElementById(targetId);
            if(targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Observer for main team sections (to open sidebar accordion)
    const mainObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navItems.forEach(nav => nav.classList.remove('active'));
                const navId = 'nav-item-' + id.replace('team-', '');
                const activeNav = document.getElementById(navId);
                if (activeNav) {
                    activeNav.classList.add('active');
                    
                    // Safely scroll ONLY the sidebar, preventing the whole page from jumping
                    if (sidebar) {
                        const sidebarRect = sidebar.getBoundingClientRect();
                        const activeRect = activeNav.getBoundingClientRect();
                        
                        // Calculamos a distância entre o elemento ativo e o container
                        const relativeTop = activeRect.top - sidebarRect.top;
                        
                        // Posiciona o elemento no centro do sidebar visível
                        const targetScroll = sidebar.scrollTop + relativeTop - (sidebar.clientHeight / 2) + (activeRect.height / 2);
                        
                        sidebar.scrollTo({
                            top: targetScroll,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

    mainSections.forEach(sec => mainObserver.observe(sec));

    // Observer for sub sections (to highlight active link)
    const subObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                subItems.forEach(sub => sub.classList.remove('active'));
                const activeSub = document.querySelector(`.sidebar-subitem[href="#${id}"]`);
                if (activeSub) {
                    activeSub.classList.add('active');
                }
            }
        });
    }, { rootMargin: '-150px 0px -50% 0px', threshold: 0 });

    subSections.forEach(sec => subObserver.observe(sec));
}

function initAnimations() {
    // Smooth entry animations using Intersection Observer
    const animObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                animObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.group-card, .match-card, .stadium-card').forEach(el => {
        el.classList.add('fade-in-up');
        animObserver.observe(el);
    });
}

// ========================================
// INITIALIZE
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

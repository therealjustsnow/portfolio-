/* ═══════════════════════════════════════════════════════════════
   projects.js  —  data arrays, project cards, modal, GitHub commits
   Deps: trackSession (analytics.js)
   Globals provided: PROJECTS, LANGS, TOOLS, CONTACTS, SCHEDULE,
                     buildProjects, buildStack, openModal, closeModal,
                     fetchCommits, renderCommits
═══════════════════════════════════════════════════════════════ */

const PROJECTS = [
    {
        id: "musicbot",
        name: "MusicBot",
        badge: "Maintainer",
        period: "2020 – Present",
        tech: ["Python"],
        images: ["photos/68747470733a2f2f692e696d6775722e636f6d2f465763487463532e706e67.png"],
        github: "https://github.com/Just-Some-Bots/MusicBot/tree/dev",
        repo: "Just-Some-Bots/MusicBot",
        desc: "Maintainer of the dev branch for one of the most widely self-hosted Discord music bots — used across thousands of servers. Responsibilities include triaging community issues, reviewing pull requests, refactoring the yt-dlp integration for reliability, and shipping incremental improvements without breaking self-hosted deployments. Working in a real open-source environment with external contributors and production users.",
    },
    {
        id: "aquarion",
        name: "Aquarion",
        badge: "Owner",
        period: "2025 – Present",
        tech: ["CSS", "SCSS", "GitHub Actions"],
        images: [
            "photos/Aquarion Preview (1).png",
            "photos/Nitro Profile Preview.png",
            "photos/Preview with profile.png",
            "photos/Channel Hovered.png",
        ],
        github: "https://github.com/Aquarion-D/Aquarion",
        repo: "Aquarion-D/Aquarion",
        desc: "A heavily modified fork of ClearVision, rebuilt into its own distinct theme. Overhauled the visual design end-to-end — reworking layout components like message pills, server member lists, Nitro sections, and voice UI. Added a frosted glass effect toggle, alt-color customization system, Vencord plugin support, and automated builds via GitHub Actions. Every change was intentional: reduce visual noise, improve readability, and make the theme feel cohesive rather than patched together.",
    },
    {
        id: "portfolio",
        name: "Portfolio",
        badge: "Owner",
        period: "2025 – Present",
        tech: ["HTML", "CSS", "JavaScript", "Supabase"],
        images: ["https://image.thum.io/get/width/600/crop/800/https://therealjustsnow.github.io/portfolio-/"],
        github: "https://github.com/therealjustsnow/portfolio-/tree/main",
        repo: "therealjustsnow/portfolio-",
        desc: "The site you\'re looking at. Built from scratch without frameworks — hand-written HTML, CSS, and vanilla JS. Features a live guestbook backed by Supabase with row-level security and token-based edit/delete ownership, a functional TI-83 graphing calculator, an interactive terminal, a photography lightbox, and a low-performance mode that strips expensive effects on weak hardware. Modular JS architecture, full SEO setup, and a Lighthouse-optimized build.",
    },
    {
        id: "clearvision",
        name: "ClearVision",
        badge: "Team Member",
        period: "2024 – 2025",
        tech: ["CSS", "SCSS", "GitHub Actions"],
        images: ["photos/68747470733a2f2f692e696d6775722e636f6d2f5537555872454e2e706e67.png"],
        github: "https://github.com/ClearVision",
        repo: "ClearVision/ClearVision-v6",
        desc: "Contributed to ClearVision, one of the most installed Discord themes with a large active user base. Worked within an established team codebase — fixing visual regressions, maintaining cross-platform style consistency, and improving contributor documentation. First real experience shipping code that others depend on.",
    },
];

const LANGS = [
    { icon: '<img src="https://cdn.simpleicons.org/python/3776AB" alt="Python">',   name: "Python"   },
    { icon: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bash/bash-original.svg" alt="Batch">', name: "Batch" },
    { icon: '<img src="https://cdn.simpleicons.org/markdown/ffffff" alt="Markdown">',  name: "Markdown" },
    { icon: '<img src="https://cdn.simpleicons.org/html5/E34F26" alt="HTML">',       name: "HTML"     },
    { icon: '<img src="https://cdn.simpleicons.org/css/1572B6" alt="CSS">',          name: "CSS"      },
    { icon: '<img src="https://cdn.simpleicons.org/sass/CC6699" alt="SCSS">',        name: "SCSS"     },
    { icon: '<img src="https://cdn.simpleicons.org/sass/CC6699" alt="SASS">',        name: "SASS"     },
];

const TOOLS = [
    { icon: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/windows8/windows8-original.svg" alt="Windows 11">', name: "Windows 11" },
    { icon: '<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg" alt="VS Code">',       name: "VS Code"    },
    { icon: '<img src="https://cdn.simpleicons.org/git/F05032" alt="Git">',                name: "Git"            },
    { icon: '<img src="https://cdn.simpleicons.org/githubactions/2088FF" alt="GH Actions">',name: "GitHub Actions" },
    { icon: '<img src="https://cdn.simpleicons.org/prettier/F7B93E" alt="Prettier">',      name: "Prettier"       },
    { icon: '<img src="https://cdn.simpleicons.org/python/3776AB" alt="Black">',           name: "Black"          },
];

const CONTACTS = [
    { icon: "💬", label: "Discord", val: "therealjustsnow",    href: "https://discord.com/users/therealjustsnow" },
    { icon: "📧", label: "Email",   val: "justsnow.dev@gmail.com", href: "mailto:justsnow.dev@gmail.com" },
    {
        icon: '<img src="https://cdn.simpleicons.org/github/ffffff" alt="GitHub" style="width:1.8rem;height:1.8rem;display:block;margin:0 auto">',
        label: "GitHub", val: "BabyBoySnow", href: "https://github.com/BabyBoySnow",
    },
];

const SCHEDULE = [
    { emoji: "💤", label: "Sleeping", time: "12am – 12pm", start: 0,  end: 12 },
    { emoji: "👨‍💻", label: "Coding",   time: "12pm – 4pm",  start: 12, end: 16 },
    { emoji: "💼", label: "Working",   time: "4pm – 10pm",  start: 16, end: 22 },
    { emoji: "🎮", label: "Gaming",    time: "10pm – 12am", start: 22, end: 24 },
];

// ── DOM builders ────────────────────────────────────────────────────────────

function buildProjects() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    PROJECTS.forEach((p, pi) => {
        const card = document.createElement("div");
        card.className = "glass project-card reveal" + (pi > 0 ? " reveal-delay-" + Math.min(pi, 3) : "");

        const navDots = p.images.length > 1
            ? `<div class="card-img-nav">${p.images.map((_, ii) =>
                `<div class="img-dot${ii === 0 ? " active" : ""}" data-proj="${p.id}" data-idx="${ii}"></div>`
              ).join("")}</div>`
            : "";

        const statsDiv = p.id === "musicbot"
            ? `<div class="card-stats">
                <span class="stat-badge">⭐ <span id="mb-stars">—</span></span>
                <span class="stat-badge">🍴 <span id="mb-forks">—</span></span>
                <span class="stat-badge">5+ yrs</span>
               </div>`
            : "";

        card.innerHTML = `
      <div class="card-img">
        <img src="${p.images[0]}" alt="${p.name}" loading="lazy" id="proj-img-${p.id}"/>
        ${navDots}
      </div>
      <div class="card-body">
        <div class="card-top">
          <span class="card-name">${p.name}</span>
          <span class="badge">${p.badge}</span>
        </div>
        <div class="card-period">${p.period}</div>
        ${statsDiv}
        <div class="card-tech">${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join("")}</div>
        <div class="card-actions">
          <a class="btn btn-ghost" href="${p.github}" target="_blank">GitHub ↗</a>
          <button class="btn btn-primary" onclick="openModal('${p.id}')">Read More</button>
        </div>
      </div>`;

        grid.appendChild(card);

        if (p.id === "musicbot") fetchRepoStats(p.repo);

        card.querySelectorAll(".img-dot").forEach(dot => {
            dot.addEventListener("click", () => {
                const idx = parseInt(dot.dataset.idx);
                const img = document.getElementById("proj-img-" + p.id);
                if (img) img.src = p.images[idx];
                card.querySelectorAll(".img-dot").forEach((d, di) =>
                    d.classList.toggle("active", di === idx)
                );
            });
        });
    });
}

function buildStack(containerId, items) {
    const g = document.getElementById(containerId);
    if (!g) return;
    const isTouch = window.matchMedia("(hover:none)").matches;
    items.forEach((item, i) => {
        const card = document.createElement("div");
        card.className = "glass stack-card";
        card.style.transitionDelay = i * 0.04 + "s";
        card.innerHTML = `<span class="icon">${item.icon}</span><span class="name">${item.name}</span>`;

        if (!isTouch) {
            // Desktop: tilt on hover
            card.addEventListener("mouseenter", () => {
                card.style.transform =
                    "perspective(320px) rotateY(-16deg) rotateX(8deg) translateY(-8px) translateZ(10px)";
            });
            card.addEventListener("mouseleave", () => {
                card.style.transform = "";
            });
        } else {
            // Mobile: tilt on click
            card.addEventListener("click", () => {
                card.style.transform =
                    "perspective(320px) rotateY(-16deg) rotateX(8deg) translateY(-8px) translateZ(10px)";
                setTimeout(() => (card.style.transform = ""), 500);
            });
        }
        g.appendChild(card);
    });
}

function buildContacts() {
    const cont = document.getElementById("contact-cards");
    if (!cont) return;
    CONTACTS.forEach(c => {
        const a = document.createElement("a");
        a.className  = "glass contact-card";
        a.href       = c.href;
        a.target     = "_blank";
        a.rel        = "noopener noreferrer";
        a.innerHTML  = `<div class="contact-icon">${c.icon}</div>
      <div class="contact-info">
        <div class="label">${c.label}</div>
        <div class="val">${c.val}</div>
      </div>`;
        cont.appendChild(a);
    });
}

// ── Modal ───────────────────────────────────────────────────────────────────

function openModal(id) {
    const p = PROJECTS.find(x => x.id === id);
    if (!p) return;

    const titleEl  = document.getElementById("modal-title");
    const badgeEl  = document.getElementById("modal-badge");
    const imgsEl   = document.getElementById("modal-imgs");
    const techEl   = document.getElementById("modal-tech");
    const commEl   = document.getElementById("commits-list");
    const cacheEl  = document.getElementById("cached-indicator");
    const overlay  = document.getElementById("modal-overlay");

    if (titleEl) titleEl.textContent = p.name;
    if (badgeEl) badgeEl.innerHTML   =
        `<span class="badge">${p.badge}</span> <span style="font-size:0.75rem;color:rgba(255,255,255,0.4);font-family:'JetBrains Mono',monospace;margin-left:0.5rem">${p.period}</span>`;
    if (imgsEl)  imgsEl.innerHTML    = p.images.map(src => `<img src="${src}" alt="${p.name}" loading="lazy"/>`).join("");
    if (techEl)  techEl.innerHTML    =
        `<div class="card-tech" style="margin-bottom:1rem">${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join("")}</div>
         <p style="font-size:0.85rem;color:rgba(255,255,255,0.6);line-height:1.6">${p.desc}</p>`;
    if (commEl)  commEl.innerHTML    = '<div class="commit-item" style="color:rgba(255,255,255,0.4)">Loading commits…</div>';
    if (cacheEl) cacheEl.textContent = "";
    if (overlay) { overlay.classList.add("open"); document.body.style.overflow = "hidden"; }

    fetchCommits(p.repo);
}

function closeModal() {
    const overlay = document.getElementById("modal-overlay");
    if (overlay) overlay.classList.remove("open");
    document.body.style.overflow = "";
}

// Wire modal dismissal once on load
(function () {
    const overlay = document.getElementById("modal-overlay");
    if (overlay) {
        overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });
    }
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") closeModal();
    });
})();

// ── GitHub repo stats (stars + forks) ────────────────────────────────────────

async function fetchRepoStats(repo) {
    const key    = "snow-stats-" + repo;
    const cached = localStorage.getItem(key);
    if (cached) {
        try {
            const { data, ts } = JSON.parse(cached);
            if (Date.now() - ts < 3_600_000) { renderRepoStats(data); return; }
        } catch (_) {}
    }
    try {
        const res = await fetch(`https://api.github.com/repos/${repo}`);
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
        renderRepoStats(data);
    } catch (_) {}
}

function renderRepoStats(data) {
    const fmt = n => n >= 1000 ? (n / 1000).toFixed(1) + "k" : n;
    const starsEl = document.getElementById("mb-stars");
    const forksEl = document.getElementById("mb-forks");
    if (starsEl) starsEl.textContent = fmt(data.stargazers_count || 0);
    if (forksEl) forksEl.textContent = fmt(data.forks_count || 0);
}

// ── GitHub commits ───────────────────────────────────────────────────────────

async function fetchCommits(repo) {
    const key    = "snow-commits-" + repo;
    const cached = localStorage.getItem(key);
    if (cached) {
        try {
            const { data, ts } = JSON.parse(cached);
            if (Date.now() - ts < 3_600_000) { renderCommits(data, true); return; }
        } catch (_) {}
    }
    try {
        const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=5`);
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
        renderCommits(data, false);
    } catch (err) {
        const el = document.getElementById("commits-list");
        if (el) el.innerHTML = `<div class="commit-item" style="color:rgba(239,68,68,0.8)">
            ${err.message === "403" ? "GitHub rate limit reached. Try again later." : "Could not load commits — " + err.message}
        </div>`;
    }
}

function renderCommits(commits, fromCache) {
    const cacheEl = document.getElementById("cached-indicator");
    const el      = document.getElementById("commits-list");
    if (cacheEl) cacheEl.textContent = fromCache ? "(cached)" : "";
    if (!el) return;
    if (!Array.isArray(commits) || commits.length === 0) {
        el.innerHTML = '<div class="commit-item">No commits found.</div>';
        return;
    }
    el.innerHTML = commits.slice(0, 5).map(c => {
        const msg    = c.commit?.message?.split("\n")[0] || "No message";
        const author = c.commit?.author?.name || "Unknown";
        const date   = c.commit?.author?.date ? new Date(c.commit.author.date).toLocaleDateString() : "";
        const sha    = (c.sha || "").slice(0, 7);
        return `<div class="commit-item">
            <div class="commit-msg">${msg}</div>
            <div class="commit-meta">${author} · ${date} · <a href="${c.html_url || "#"}" target="_blank" style="color:var(--accent);text-decoration:none">${sha}</a></div>
        </div>`;
    }).join("");
}

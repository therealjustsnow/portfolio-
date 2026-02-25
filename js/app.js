/* ═══════════════════════════════════════════════════════════════
   app.js  —  main coordinator
   Depends on (load order):
     analytics.js  → visitedSections, sessionStart, padZ,
                      trackSession, renderVisitorInsights
     theme.js      → currentHue, currentAlpha, hslToRgb, rgbToHex,
                      applyCustomColor
     projects.js   → PROJECTS, LANGS, TOOLS, CONTACTS,
                      buildProjects, buildStack, buildContacts,
                      openModal, closeModal
     ti83.js       → toggleTI, closeTI, tiInsert, tiClear,
                      tiBtn, tiRun, drawGrid
     effects.js    → isTouch, initCursorGlow, initMagnetic,
                      initParticles, initScrollReveal
═══════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════
   TIME BAR  (SCHEDULE data lives in projects.js)
════════════════════════════════════════════════════════ */
function updateTimes() {
    const now      = new Date();
    const snowOpts = { timeZone: "America/Chicago", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true };

    const snowTimeEl  = document.getElementById("snow-time");
    const yourTimeEl  = document.getElementById("your-time");
    const yourTzEl    = document.getElementById("your-tz");
    const sessionEl   = document.getElementById("session-timer");
    const grid        = document.getElementById("schedule-grid");

    if (snowTimeEl)  snowTimeEl.textContent  = now.toLocaleTimeString("en-US", snowOpts);
    if (yourTimeEl)  yourTimeEl.textContent  = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    if (yourTzEl)    yourTzEl.textContent    = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
    if (sessionEl) {
        const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
        sessionEl.textContent = padZ(Math.floor(elapsed / 60)) + ":" + padZ(elapsed % 60);
    }
    if (grid) {
        const snowNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
        const h       = snowNow.getHours() + snowNow.getMinutes() / 60;
        const active  = SCHEDULE.find(sc => h >= sc.start && h < sc.end) || SCHEDULE[0];
        if (grid.dataset.active !== active.label) {
            grid.dataset.active = active.label;
            grid.innerHTML = `<div class="glass sched-card">
  <span class="sched-emoji">${active.emoji}</span>
  <div class="sched-label">${active.label}</div>
  <div class="sched-time">${active.time}</div>
  <div class="sched-now">◉ NOW</div>
</div>`;
        }
    }
}
setInterval(updateTimes, 1000);
updateTimes();

/* ════════════════════════════════════════════════════════
   TYPEWRITER
════════════════════════════════════════════════════════ */
const GH_ICON = '<img src="https://cdn.simpleicons.org/github/ffffff" alt="GitHub" class="tw-icon">';
const phrases = [
    { icon: "🎮", text: " Gamer" },
    { icon: "🎨", text: " Blending Design & Functionality" },
    { icon: GH_ICON, text: " Open Source First" },
    { icon: "👥", text: " ClearVision Team Member" },
    { icon: "🎶", text: " Maintaining MusicBot" },
    { icon: "👨‍💻", text: " Working on Aquarion" },
    { icon: "🖩", text: " Calculator Tinkerer" },
    { icon: "🌯", text: " Rolling Burritos" },
];
let twIdx = 0, twChar = 0, twDeleting = false, twPause = 0;
const twEl = document.getElementById("typewriter-text");

function typeStep() {
    if (twPause > 0) { twPause--; setTimeout(typeStep, 50); return; }
    const { icon, text } = phrases[twIdx];
    if (!twDeleting) {
        twChar++;
        if (twEl) twEl.innerHTML = icon + text.slice(0, twChar);
        if (twChar === text.length) { twDeleting = true; twPause = 40; }
        setTimeout(typeStep, 60);
    } else {
        twChar--;
        if (twEl) twEl.innerHTML = icon + text.slice(0, twChar);
        if (twChar === 0) { twDeleting = false; twIdx = (twIdx + 1) % phrases.length; twPause = 6; }
        setTimeout(typeStep, 30);
    }
}
typeStep();



/* ════════════════════════════════════════════════════════
   MOBILE MENU
════════════════════════════════════════════════════════ */
function toggleMobileMenu() {
    const nl = document.getElementById("nav-links");
    if (nl) nl.classList.toggle("open");
}
document.querySelectorAll("#nav-links a").forEach(a => {
    a.addEventListener("click", () => {
        const nl = document.getElementById("nav-links");
        if (nl) nl.classList.remove("open");
    });
});

/* ════════════════════════════════════════════════════════
   FAVICON SWITCH ON INACTIVITY
════════════════════════════════════════════════════════ */
const originalTitle = document.title;
const favicon = document.getElementById("favicon");
let inactiveTimer;
document.addEventListener("visibilitychange", () => {
    clearTimeout(inactiveTimer);
    if (document.hidden) {
        inactiveTimer = setTimeout(() => {
            if (favicon) favicon.href = "photos/favicon-alert.png";
            document.title = "🔴 Come back";
        }, 2000);
    } else {
        if (favicon) favicon.href = "photos/favicon.png";
        document.title = originalTitle;
    }
});

/* ════════════════════════════════════════════════════════
   SCROLL TO TOP
════════════════════════════════════════════════════════ */
(function () {
    const btn = document.getElementById("scroll-top");
    if (!btn) return;
    let lastY = 0;
    window.addEventListener("scroll", () => {
        const y = window.scrollY;
        const nearBottom  = window.innerHeight + y >= document.body.scrollHeight - 100;
        const scrollingUp = y < lastY;
        btn.classList.toggle("visible", nearBottom || (scrollingUp && y > 400));
        lastY = y;
    }, { passive: true });
})();

/* ════════════════════════════════════════════════════════
   VIEW SWITCHER
════════════════════════════════════════════════════════ */
let currentView = "home";

function switchView(target) {
    if (target === currentView) return;

    const mainEl    = document.getElementById("main-view");
    const gbEl      = document.getElementById("guestbook-view");
    const termEl    = document.getElementById("terminal-view");
    const photoEl   = document.getElementById("photography-view");
    const gbNav     = document.getElementById("guestbook-nav");
    const termNav   = document.getElementById("terminal-nav");
    const photoNav  = document.getElementById("photography-nav");
    const stopBtn   = document.getElementById("scroll-top");

    // Fade out current
    if (currentView === "home") {
        if (mainEl) { mainEl.classList.add("view-leaving"); setTimeout(() => { mainEl.style.display = "none"; }, 360); }
    } else if (currentView === "guestbook") {
        if (gbEl) { gbEl.classList.remove("view-visible"); setTimeout(() => gbEl.classList.remove("view-active"), 360); }
    } else if (currentView === "terminal") {
        if (termEl) { termEl.classList.remove("view-visible"); setTimeout(() => termEl.classList.remove("view-active"), 360); }
    } else if (currentView === "photography") {
        if (photoEl) { photoEl.classList.remove("view-visible"); setTimeout(() => photoEl.classList.remove("view-active"), 360); }
    }

    // Clear nav + scroll-top
    if (gbNav)    gbNav.classList.remove("active-nav");
    if (termNav)  termNav.classList.remove("active-nav");
    if (photoNav) photoNav.classList.remove("active-nav");
    if (stopBtn)  stopBtn.classList.remove("visible");
    const nl = document.getElementById("nav-links");
    if (nl) nl.classList.remove("open");

    // Fade in target
    if (target === "home") {
        if (mainEl) {
            mainEl.style.display = "";
            requestAnimationFrame(() => requestAnimationFrame(() => {
                mainEl.classList.remove("view-leaving");
                window.scrollTo({ top: 0, behavior: "instant" });
            }));
        }
        history.pushState({ view: "home" }, "", "#");
    } else if (target === "guestbook") {
        if (gbEl) {
            gbEl.classList.add("view-active");
            requestAnimationFrame(() => requestAnimationFrame(() => {
                gbEl.classList.add("view-visible");
                window.scrollTo({ top: 0, behavior: "instant" });
            }));
        }
        if (gbNav) gbNav.classList.add("active-nav");
        history.pushState({ view: "guestbook" }, "", "#guestbook");
        visitedSections.add("guestbook");
        renderGuestbookEntries();
    } else if (target === "terminal") {
        if (termEl) {
            termEl.classList.add("view-active");
            requestAnimationFrame(() => requestAnimationFrame(() => {
                termEl.classList.add("view-visible");
                window.scrollTo({ top: 0, behavior: "instant" });
            }));
        }
        if (termNav) termNav.classList.add("active-nav");
        history.pushState({ view: "terminal" }, "", "#terminal");
        visitedSections.add("terminal");
        termOnOpen();
    } else if (target === "photography") {
        if (photoEl) {
            photoEl.classList.add("view-active");
            requestAnimationFrame(() => requestAnimationFrame(() => {
                photoEl.classList.add("view-visible");
                window.scrollTo({ top: 0, behavior: "instant" });
            }));
        }
        if (photoNav) photoNav.classList.add("active-nav");
        history.pushState({ view: "photography" }, "", "#photography");
        visitedSections.add("photography");
        loadPhotography();
    }

    currentView = target;
}

window.addEventListener("popstate", e => {
    const v      = e.state && e.state.view;
    const valid  = ["guestbook", "terminal", "photography"];
    const target = valid.includes(v) ? v : "home";
    if (target !== currentView) switchView(target);
});

/* ════════════════════════════════════════════════════════
   GUESTBOOK
   Cookie-free ownership: token stored in localStorage.
   SQL required in Supabase before edit/delete works:
     ALTER TABLE guestbook
       ADD COLUMN IF NOT EXISTS token TEXT NOT NULL DEFAULT '';
   (id is assumed to already exist as a UUID primary key)
════════════════════════════════════════════════════════ */
const GB_URL     = "https://zsyyscnydkgmtvzurhoa.supabase.co/rest/v1/guestbook";
const GB_KEY     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzeXlzY255ZGtnbXR2enVyaG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MzU0NzIsImV4cCI6MjA4NzIxMTQ3Mn0.u2dpcV5fv2HNfgnNsEnjBFfmKXLoy2Lrgntle_AbA_4";
const GB_HEADERS = { "Content-Type": "application/json", apikey: GB_KEY, Authorization: "Bearer " + GB_KEY };

// localStorage: { "entry-uuid": "secret-token", ... }
function gbGetTokens() {
    try { return JSON.parse(localStorage.getItem("snow_gb_tokens") || "{}"); } catch { return {}; }
}
function gbSaveToken(id, token) {
    const t = gbGetTokens();
    t[id]   = token;
    localStorage.setItem("snow_gb_tokens", JSON.stringify(t));
}

// ── Sanitizer ────────────────────────────────────────────
function sanitize(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ── Character counter ────────────────────────────────────
const gbMsg  = document.getElementById("gb-msg");
const gbChar = document.getElementById("gb-char");
if (gbMsg && gbChar) {
    gbMsg.addEventListener("input", function () {
        gbChar.textContent = this.value.length + " / 200";
    });
}

// ── Submit ───────────────────────────────────────────────
async function submitGuestbook() {
    const nameEl = document.getElementById("gb-name");
    const msgEl  = document.getElementById("gb-msg");
    const errEl  = document.getElementById("gb-error");
    const btn    = document.querySelector(".gb-submit");
    if (!nameEl || !msgEl) return;

    const name = nameEl.value.trim();
    const msg  = msgEl.value.trim();
    if (errEl) errEl.textContent = "";

    if (!name) { if (errEl) errEl.textContent = "! Name is required."; nameEl.focus(); return; }
    if (!msg)  { if (errEl) errEl.textContent = "! Message cannot be empty."; msgEl.focus(); return; }

    if (btn) { btn.textContent = "Signing…"; btn.disabled = true; }

    // Generate a random ownership token — only this browser will know it
    const token = (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);

    try {
        const res = await fetch(GB_URL + "?select=id", {
            method:  "POST",
            headers: { ...GB_HEADERS, Prefer: "return=representation" },
            body:    JSON.stringify({ name: sanitize(name), message: sanitize(msg), token }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Request failed (" + res.status + ")");
        }
        const [row] = await res.json();
        if (row && row.id) gbSaveToken(row.id, token); // remember ownership

        if (nameEl) nameEl.value = "";
        if (msgEl)  msgEl.value  = "";
        if (gbChar) gbChar.textContent = "0 / 200";
        if (btn)    btn.textContent = "Signed! ✓";
        setTimeout(() => { if (btn) { btn.textContent = "Sign ✦"; btn.disabled = false; } }, 2000);
        renderGuestbookEntries();
    } catch (err) {
        if (errEl) errEl.textContent = "! " + err.message;
        if (btn)   { btn.textContent = "Sign ✦"; btn.disabled = false; }
    }
}

// ── Fetch + render ───────────────────────────────────────
const GB_PAGE = 100;
let gbOffset  = 0;

async function renderGuestbookEntries(append = false) {
    const container   = document.getElementById("gb-entries");
    const loadMoreBtn = document.getElementById("gb-load-more");
    if (!container) return;

    if (!append) {
        gbOffset = 0;
        container.innerHTML = '<div class="gb-empty">Loading entries…</div>';
        if (loadMoreBtn) loadMoreBtn.style.display = "none";
    } else {
        if (loadMoreBtn) { loadMoreBtn.textContent = "Loading…"; loadMoreBtn.disabled = true; }
    }

    try {
        const res = await fetch(
            `${GB_URL}?select=id,name,message,created_at&order=created_at.desc&limit=${GB_PAGE}&offset=${gbOffset}`,
            { headers: GB_HEADERS }
        );
        if (!res.ok) throw new Error("Could not load entries.");
        const entries = await res.json();

        if (!append) container.innerHTML = "";

        if (entries.length === 0 && gbOffset === 0) {
            container.innerHTML = '<div class="gb-empty">No entries yet — be the first to sign! 👋</div>';
            return;
        }

        const myTokens = gbGetTokens();

        entries.forEach(e => {
            const date     = new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const safeName = sanitize(String(e.name    || "").slice(0, 80));
            const safeMsg  = sanitize(String(e.message || "").slice(0, 600));
            const isOwner  = e.id && myTokens[e.id];

            const card = document.createElement("div");
            card.className      = "glass gb-entry";
            card.dataset.entryId = e.id || "";

            card.innerHTML = `
<div class="gb-entry-header">
  <span class="gb-entry-name">${safeName}</span>
  <div class="gb-entry-meta">
    <span class="gb-entry-date">${date}</span>
    ${isOwner ? `
    <div class="gb-entry-actions">
      <button class="gb-action-btn gb-edit-btn"  title="Edit">✎</button>
      <button class="gb-action-btn gb-delete-btn" title="Delete">✕</button>
    </div>` : ""}
  </div>
</div>
<div class="gb-entry-msg">${safeMsg}</div>`;

            if (isOwner) {
                card.querySelector(".gb-edit-btn").addEventListener("click", () => gbStartEdit(card, e, myTokens[e.id]));
                card.querySelector(".gb-delete-btn").addEventListener("click", () => gbDelete(card, e.id, myTokens[e.id]));
            }

            container.appendChild(card);
        });

        gbOffset += entries.length;

        if (loadMoreBtn) {
            const hasMore = entries.length === GB_PAGE;
            loadMoreBtn.style.display   = hasMore ? "block" : "none";
            loadMoreBtn.textContent     = "Load More ↓";
            loadMoreBtn.disabled        = false;
        }
    } catch (err) {
        if (!append) container.innerHTML = `<div class="gb-empty">⚠ ${err.message}</div>`;
        if (loadMoreBtn) { loadMoreBtn.textContent = "Load More ↓"; loadMoreBtn.disabled = false; }
    }
}

function loadMoreEntries() { renderGuestbookEntries(true); }

// ── Inline edit ──────────────────────────────────────────
function gbStartEdit(card, entry, token) {
    const msgEl = card.querySelector(".gb-entry-msg");
    if (!msgEl || card.classList.contains("gb-editing")) return;
    card.classList.add("gb-editing");

    const original = String(entry.message || "");
    msgEl.innerHTML = `
<textarea class="gb-inline-edit" maxlength="200">${original}</textarea>
<div class="gb-inline-actions">
  <button class="btn btn-primary gb-save-btn" style="font-size:0.75rem;padding:0.3rem 0.9rem">Save</button>
  <button class="btn btn-ghost  gb-cancel-btn" style="font-size:0.75rem;padding:0.3rem 0.9rem">Cancel</button>
</div>`;

    const ta = msgEl.querySelector(".gb-inline-edit");
    ta.focus();
    ta.selectionStart = ta.selectionEnd = ta.value.length;

    msgEl.querySelector(".gb-cancel-btn").addEventListener("click", () => {
        card.classList.remove("gb-editing");
        msgEl.innerHTML = sanitize(original.slice(0, 600));
    });

    msgEl.querySelector(".gb-save-btn").addEventListener("click", () => gbSaveEdit(card, entry, token, ta.value.trim()));
}

async function gbSaveEdit(card, entry, token, newMsg) {
    if (!newMsg) return;
    const saveBtn = card.querySelector(".gb-save-btn");
    if (saveBtn) { saveBtn.textContent = "Saving…"; saveBtn.disabled = true; }

    try {
        const res = await fetch(`${GB_URL}?id=eq.${entry.id}&token=eq.${token}`, {
            method:  "PATCH",
            headers: { ...GB_HEADERS, Prefer: "return=minimal" },
            body:    JSON.stringify({ message: sanitize(newMsg) }),
        });
        if (!res.ok) throw new Error("Save failed (" + res.status + ")");
        entry.message = newMsg;
        card.classList.remove("gb-editing");
        card.querySelector(".gb-entry-msg").textContent = newMsg;
    } catch (err) {
        if (saveBtn) { saveBtn.textContent = "Retry"; saveBtn.disabled = false; }
        const msgEl = card.querySelector(".gb-entry-msg");
        const existingErr = msgEl.querySelector(".gb-inline-err");
        if (!existingErr) {
            const e = document.createElement("div");
            e.className = "gb-inline-err";
            e.textContent = "! " + err.message;
            msgEl.appendChild(e);
        }
    }
}

// ── Delete ───────────────────────────────────────────────
async function gbDelete(card, id, token) {
    if (!confirm("Delete your entry? This can't be undone.")) return;
    const delBtn = card.querySelector(".gb-delete-btn");
    if (delBtn) { delBtn.disabled = true; delBtn.textContent = "…"; }

    try {
        const res = await fetch(`${GB_URL}?id=eq.${id}&token=eq.${token}`, {
            method:  "DELETE",
            headers: GB_HEADERS,
        });
        if (!res.ok) throw new Error("Delete failed (" + res.status + ")");
        card.style.transition = "opacity 0.3s, transform 0.3s";
        card.style.opacity    = "0";
        card.style.transform  = "translateX(-20px)";
        setTimeout(() => card.remove(), 320);
        // Remove from local token store
        const t = gbGetTokens();
        delete t[id];
        localStorage.setItem("snow_gb_tokens", JSON.stringify(t));
    } catch (err) {
        alert("Could not delete: " + err.message);
        if (delBtn) { delBtn.disabled = false; delBtn.textContent = "✕"; }
    }
}

/* ════════════════════════════════════════════════════════
   TERMINAL ENGINE
════════════════════════════════════════════════════════ */
const termHistory = [];
let termHistIdx   = -1;
let termBooted    = false;
let retroMode     = false;
let matrixRAF     = null;

const tOut = () => document.getElementById("term-output");

function tPrint(text, cls) {
    const el = document.createElement("span");
    el.className  = "tl" + (cls ? " " + cls : "");
    el.textContent = text;
    const o = tOut(); if (o) o.appendChild(el);
}
function tHTML(html, cls) {
    const el = document.createElement("span");
    el.className = "tl" + (cls ? " " + cls : "");
    el.innerHTML  = html;
    const o = tOut(); if (o) o.appendChild(el);
}
function tBlank() {
    const el = document.createElement("span");
    el.className = "tl tl-blank";
    const o = tOut(); if (o) o.appendChild(el);
}
function tScroll() { const o = tOut(); if (o) o.scrollTop = o.scrollHeight; }
function tClear()  { const o = tOut(); if (o) o.innerHTML = ""; }

// ── Boot banner ────────────────────────────────────────
function termBoot() {
    if (termBooted) return;
    termBooted = true;
    const now = new Date().toLocaleString("en-US", {
        timeZone: "America/Chicago", weekday: "short",
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
    tPrint("snow-portfolio  v2.0.0  (bash 5.2)", "tl-accent");
    tPrint("Last login: " + now + " CST on ttys001", "tl-dim");
    tBlank();
    tPrint("  Type  help  to see all available commands.", "tl-dim");
    tPrint("  Hint: try  neofetch  or  cat secrets.txt  to start.", "tl-dim");
    tBlank();
    tScroll();
}

function termOnOpen() {
    termBoot();
    setTimeout(() => { const inp = document.getElementById("term-input"); if (inp) inp.focus(); }, 120);
}

// ── Command runner ─────────────────────────────────────
function termRun(raw) {
    const inp = document.getElementById("term-input");
    const cmd = (raw !== undefined ? raw : (inp ? inp.value : "")).trim();
    if (!cmd) return;

    if (termHistory[0] !== cmd) termHistory.unshift(cmd);
    if (termHistory.length > 200) termHistory.pop();
    termHistIdx = -1;
    if (inp) inp.value = "";

    tPrint("snow@portfolio ~ $ " + cmd, "tl-cmd");

    const parts = cmd.trim().split(/\s+/);
    const verb  = parts[0].toLowerCase();
    const args  = parts.slice(1);

    switch (verb) {
        case "help":    cmdHelp();          break;
        case "clear":   tClear();           return;
        case "cat":     cmdCat(args);       break;
        case "ls":      cmdLs(args);        break;
        case "pwd":     tPrint("/home/snow/portfolio"); break;
        case "whoami":  tPrint("snow", "tl-accent"); break;
        case "echo":    tPrint(args.join(" ")); break;
        case "date":    cmdDate();          break;
        case "uname":   cmdUname(args);     break;
        case "uptime":  cmdUptime();        break;
        case "neofetch":cmdNeofetch();      break;
        case "projects":cmdProjects();      break;
        case "stack":   cmdStack();         break;
        case "contact": cmdContact();       break;
        case "color":   cmdColor(args);     break;
        case "weather":
            cmdWeather().then(() => { tBlank(); tScroll(); });
            return;
        case "history": cmdHistoryCmd();    break;
        case "git":     cmdGit(args);       break;
        case "banner":  cmdBanner();        break;
        case "man":     cmdMan(args);       break;
        case "ping":    cmdPing(args);      break;
        case "curl":    cmdCurl(args);      break;
        case "fortune": cmdFortune();       break;
        case "matrix":  cmdMatrix();        break;
        case "sl":      cmdSL();            break;
        case "sudo":    cmdSudo(args);      break;
        case "open":
        case "xdg-open": cmdOpen(args);    break;
        case "exit":
        case "quit":
            tPrint("logout", "tl-dim"); tBlank(); tScroll();
            setTimeout(() => switchView("home"), 650);
            return;
        default:
            tPrint("bash: command not found: " + verb, "tl-err");
            tPrint("Type  help  to see available commands.", "tl-dim");
    }
    tBlank();
    tScroll();
}

// ── Commands ───────────────────────────────────────────
function cmdHelp() {
    tPrint("Available commands", "tl-accent");
    tPrint("-------------------------------------------------------", "tl-dim");
    [
        ["help",            "Show this message"],
        ["clear",           "Clear the terminal  (Ctrl+L also works)"],
        ["neofetch",        "System info with ASCII art logo"],
        ["cat",             "Display an ASCII cat"],
        ["cat secrets.txt", "Read Snow's about file"],
        ["cat readme.md",   "Read the portfolio README"],
        ["ls / ls -la",     "List directory contents"],
        ["pwd",             "Print working directory"],
        ["whoami",          "Current user"],
        ["echo <text>",     "Print text to the terminal"],
        ["date",            "Current date and time (CST)"],
        ["uname -a",        "System information"],
        ["uptime",          "Session uptime"],
        ["projects",        "List all projects with details"],
        ["stack",           "Print full tech stack"],
        ["contact",         "Show contact links"],
        ["weather",         "Des Moines weather report"],
        ["git log/status",  "Convincing git output"],
        ["ping <host>",     "Simulate a ping"],
        ["curl <url>",      "Simulate curl"],
        ["banner",          "SNOW in ASCII block letters"],
        ["fortune",         "Random developer wisdom"],
        ["matrix",          "Matrix rain (5s, Ctrl+C to stop)"],
        ["sl",              "The classic ls typo Easter egg"],
        ["man <cmd>",       "Read the manual for a command"],
        ["sudo <cmd>",      "Attempt superuser mode (good luck)"],
        ["open <url>",      "Open a URL in a new tab"],
        ["color --retro",   "Retro CRT phosphor mode"],
        ["color --reset",   "Restore normal accent theme"],
        ["color --hue <n>", "Set accent hue (0-360)"],
        ["history",         "Show command history"],
        ["exit",            "Close terminal, return home"],
    ].forEach(r => {
        tHTML(
            "<span style='color:var(--accent);display:inline-block;min-width:22ch'>" + r[0] + "</span>" +
            "<span style='color:rgba(255,255,255,0.48)'>" + r[1] + "</span>"
        );
    });
    tBlank();
    tPrint("Tip: arrow keys navigate history. Tab auto-completes.", "tl-dim");
}

function cmdCat(args) {
    if (!args.length) {
        tPrint("   /\\_____/\\   ", "tl-ascii");
        tPrint("  /  o   o  \\  ", "tl-ascii");
        tPrint(" ( ==  ^  == ) ", "tl-ascii");
        tPrint("  )         (  ", "tl-ascii");
        tPrint(" (           ) ", "tl-ascii");
        tPrint("( (  )   (  ) )", "tl-ascii");
        tPrint("(__(__)___(__)_)", "tl-ascii");
        tBlank();
        tPrint("Meow. :3", "tl-dim");
        return;
    }
    const file = args.join(" ").toLowerCase().trim();
    if (file === "secrets.txt") {
        tPrint("# secrets.txt", "tl-accent");
        tPrint("--------------------------------------", "tl-dim");
        [
            ["Name",      "Snow"],
            ["Location",  "Des Moines, Iowa"],
            ["Specialty", "Front-end UI/UX design"],
            ["Vibe",      "Self-taught, design-first developer"],
        ].forEach(r => {
            tHTML(
                "<span style='color:var(--accent);display:inline-block;min-width:13ch'>" + r[0] + "</span>" +
                "<span>" + r[1] + "</span>"
            );
        });
        tBlank();
        tPrint("Projects:", "tl-accent");
        tPrint("  -> ClearVision  (Team Member,  2024-2025)",     "");
        tPrint("  -> MusicBot     (Maintainer,   2020-present)",  "");
        tPrint("  -> Aquarion     (Owner,        2025-present)",  "");
        tBlank();
        tPrint("Tech Stack:", "tl-accent");
        tPrint("  Languages : Python, HTML, CSS, SCSS/SASS, Markdown, Batch", "");
        tPrint("  Tools     : VS Code, Git, GitHub Actions, Prettier, Black",  "");
        tBlank();
        tPrint("Status  : Open to opportunities  [ACTIVE]",          "tl-ok");
        tPrint("Hobbies : Gaming, Burritos, Calculator tinkering",    "");
        tBlank();
        tPrint("# end of file", "tl-dim");
    } else if (file === "readme.md") {
        tPrint("# Snow's Portfolio -- README", "tl-accent");
        tBlank();
        tPrint("A handcrafted single-file portfolio. Pure HTML/CSS/JS.", "");
        tPrint("No frameworks. No build step. Just craft.", "");
        tBlank();
        tPrint("Highlights:", "tl-accent");
        [
            "Live hue-based accent color picker with hex input",
            "View-switching SPA (Home / Guestbook / Terminal)",
            "Live shared guestbook powered by Supabase",
            "Draggable TI-83 graphing calculator",
            "GitHub commit fetching per project card",
            "Retro CRT phosphor mode with real scanlines",
            "This terminal you are reading from right now",
        ].forEach(h => tPrint("  * " + h, ""));
        tBlank();
        tPrint("Built by Snow -- Des Moines, Iowa", "tl-dim");
    } else if (file === ".bash_history" || file === ".zsh_history") {
        tPrint("cat: ." + (file.includes("zsh") ? "zsh" : "bash") + "_history: Permission denied", "tl-err");
        tPrint("Nice try :)", "tl-dim");
    } else if (file === "/etc/passwd" || file === "/etc/shadow") {
        tPrint("cat: " + file + ": This is a portfolio, not a server", "tl-err");
    } else {
        tPrint("cat: " + args.join(" ") + ": No such file or directory", "tl-err");
        tPrint("Available: secrets.txt, readme.md", "tl-dim");
    }
}

function cmdLs(args) {
    const isLong     = args.some(a => a.includes("l"));
    const showHidden = args.some(a => a.includes("a"));
    const entries = [
        { name: "secrets.txt",  type: "f", size:   "892", date: "Jan 15 09:12", perms: "-rw-r--r--" },
        { name: "readme.md",    type: "f", size:  "1.3K", date: "Feb  3 14:27", perms: "-rw-r--r--" },
        { name: "portfolio/",   type: "d", size:   "256", date: "Feb 20 00:00", perms: "drwxr-xr-x" },
        { name: "projects/",    type: "d", size:   "192", date: "Jan 28 18:55", perms: "drwxr-xr-x" },
        { name: "assets/",      type: "d", size:   "512", date: "Feb 10 11:03", perms: "drwxr-xr-x" },
        { name: ".gitconfig",   type: "h", size:   "220", date: "Sep 12 08:15", perms: "-rw-------" },
        { name: ".ssh/",        type: "h", size:   "128", date: "Oct  1 17:00", perms: "drwx------" },
    ];
    const visible = entries.filter(e => showHidden || e.type !== "h");

    if (isLong) {
        tPrint("total " + visible.length * 8, "tl-dim");
        visible.forEach(e => {
            const col = (e.type === "d" || e.name.endsWith("/")) ? "#60a5fa" : "rgba(255,255,255,0.82)";
            tHTML(
                "<span style='color:rgba(255,255,255,0.35)'>" +
                e.perms + "  1 snow  snow  " + e.size.padStart(5) + "  " + e.date + "  </span>" +
                "<span style='color:" + col + "'>" + e.name + "</span>"
            );
        });
    } else {
        for (let i = 0; i < visible.length; i += 3) {
            const chunk = visible.slice(i, i + 3);
            tHTML(chunk.map(e => {
                const col = (e.type === "d" || e.name.endsWith("/")) ? "#60a5fa" : "rgba(255,255,255,0.82)";
                return "<span style='color:" + col + ";display:inline-block;min-width:20ch'>" + e.name + "</span>";
            }).join(""));
        }
    }
}

function cmdDate() {
    tPrint(new Date().toLocaleString("en-US", {
        weekday: "short", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        timeZoneName: "short", timeZone: "America/Chicago",
    }));
}

function cmdUname(args) {
    tPrint(args.includes("-a")
        ? "Portfolio-OS 2.0.0-snow #1 SMP PREEMPT Fri Feb 20 00:00:00 CST 2026 x86_64"
        : "Portfolio-OS");
}

function cmdUptime() {
    const s   = Math.floor((Date.now() - sessionStart) / 1000);
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const ss  = s % 60;
    const str = h > 0 ? h + "h " + m + "m " + ss + "s" : m + "m " + ss + "s";
    tPrint("up " + str + ",  1 user,  load average: 0.02, 0.03, 0.00");
}

function cmdNeofetch() {
    const [r, g, b] = hslToRgb(currentHue, 80, 58);
    const hex = rgbToHex(r, g, b);
    const s   = Math.floor((Date.now() - sessionStart) / 1000);
    const up  = Math.floor(s / 60) + "m " + (s % 60) + "s";
    const rows = [
        ["         /\\           ", "<span style='color:var(--accent);font-weight:700'>snow</span><span style='color:rgba(255,255,255,0.4)'>@</span><span style='color:var(--accent);font-weight:700'>portfolio</span>"],
        ["        /  \\          ", "<span style='color:rgba(255,255,255,0.3)'>---------------------</span>"],
        ["       / /\\ \\         ", "<span style='color:var(--accent)'>OS:</span>       Portfolio-OS 2.0"],
        ["      / /  \\ \\        ", "<span style='color:var(--accent)'>Shell:</span>    zsh 5.9"],
        ["     / /    \\ \\       ", "<span style='color:var(--accent)'>Editor:</span>   VS Code"],
        ["    / / ____ \\ \\      ", "<span style='color:var(--accent)'>Location:</span> Des Moines, Iowa"],
        ["   / / /    \\ \\ \\     ", "<span style='color:var(--accent)'>Accent:</span>   " + hex],
        ["  /_/ /      \\ \\_\\    ", "<span style='color:var(--accent)'>Uptime:</span>   " + up],
        [" |__|/        \\|__|   ", "<span style='color:var(--accent)'>Theme:</span>    " + (retroMode ? "Retro CRT" : "Custom hue")],
        ["                     ", "<span style='color:var(--accent)'>Projects:</span> ClearVision, MusicBot, Aquarion"],
        ["                     ", ""],
    ];
    rows.forEach(r => {
        tHTML(
            "<span style='color:var(--accent);font-size:0.72rem'>" + r[0] + "</span>" +
            "<span>" + r[1] + "</span>"
        );
    });
    const swatches = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#a855f7","#ec4899"]
        .map(c => "<span style='background:" + c + ";color:" + c + ";border-radius:2px'>###</span>").join("");
    tHTML("<span style='color:transparent'>                     </span>" + swatches);
}

function cmdProjects() {
    tPrint("# projects", "tl-accent");
    tPrint("------------------------------------------------", "tl-dim");
    PROJECTS.forEach(p => {
        tHTML("<span style='color:var(--accent);font-weight:700'>" + p.name + "</span>  " +
              "<span style='color:rgba(255,255,255,0.35);font-size:0.72rem'>[" + p.badge + "]  " + p.period + "</span>");
        tPrint("  " + p.desc, "tl-dim");
        tPrint("  Tech: " + p.tech.join(", "), "");
        tHTML("  <a href='" + p.github + "' target='_blank' rel='noopener noreferrer' style='color:var(--accent)'>" + p.github + "</a>");
        tBlank();
    });
}

function cmdStack() {
    tPrint("# tech-stack", "tl-accent");
    tPrint("----------------------------------", "tl-dim");
    tPrint("Languages:", "tl-accent");
    LANGS.forEach(l => tPrint("  * " + l.name));
    tBlank();
    tPrint("Tools:", "tl-accent");
    TOOLS.forEach(t => tPrint("  * " + t.name));
}

function cmdContact() {
    tPrint("# contact", "tl-accent");
    tPrint("----------------------------------", "tl-dim");
    CONTACTS.forEach(c => {
        tHTML(
            "<span style='color:var(--accent);display:inline-block;min-width:12ch'>" + c.label + "</span>" +
            "<a href='" + c.href + "' target='_blank' rel='noopener noreferrer' style='color:rgba(255,255,255,0.75);text-decoration:none'>" + c.val + "</a>"
        );
    });
}

function cmdColor(args) {
    const flag = (args[0] || "").toLowerCase();
    if (flag === "--retro") {
        retroMode = true;
        document.body.classList.add("retro-mode");
        const r = document.documentElement.style;
        r.setProperty("--accent",      "#00ff41");
        r.setProperty("--accent-rgb",  "0, 255, 65");
        r.setProperty("--accent-dark", "#00cc33");
        r.setProperty("--accent-glow", "rgba(0,255,65,0.35)");
        r.setProperty("--g1", "#001a08");
        r.setProperty("--g2", "#000d04");
        r.setProperty("--g3", "#002010");
        tPrint("Retro CRT mode enabled.", "tl-ok");
        tPrint("Phosphor glow engaged. Scanlines active.", "tl-dim");
        tPrint("Type  color --reset  to restore.", "tl-dim");
    } else if (flag === "--reset" || flag === "--normal") {
        retroMode = false;
        document.body.classList.remove("retro-mode");
        applyCustomColor(currentHue, currentAlpha);
        tPrint("Theme restored to your accent settings.", "tl-ok");
    } else if (flag === "--hue") {
        const h = parseFloat(args[1]);
        if (isNaN(h) || h < 0 || h > 360) {
            tPrint("Usage: color --hue <0-360>", "tl-err");
        } else {
            retroMode = false;
            document.body.classList.remove("retro-mode");
            applyCustomColor(h, currentAlpha);
            tPrint("Accent hue set to " + Math.round(h) + " degrees.", "tl-ok");
        }
    } else {
        tPrint("Usage:", "tl-accent");
        tPrint("  color --retro         Enable retro CRT mode", "");
        tPrint("  color --reset         Restore normal theme", "");
        tPrint("  color --hue <0-360>   Set accent hue directly", "");
    }
}

async function cmdWeather() {
    tPrint("# weather -- Des Moines, Iowa (KDSM)", "tl-accent");
    tPrint("--------------------------------------", "tl-dim");
    tPrint("Fetching live data from Open-Meteo…", "tl-dim");
    tBlank(); tScroll();

    const WMO = {
        0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",
        45:"Foggy",48:"Icy fog",51:"Light drizzle",53:"Drizzle",55:"Heavy drizzle",
        61:"Light rain",63:"Rain",65:"Heavy rain",
        71:"Light snow",73:"Snow",75:"Heavy snow",77:"Snow grains",
        80:"Rain showers",81:"Heavy showers",82:"Violent showers",
        85:"Snow showers",86:"Heavy snow showers",
        95:"Thunderstorm",96:"Thunderstorm + hail",99:"Thunderstorm + heavy hail",
    };
    const WIND_DIR = d => ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round(d / 22.5) % 16];

    try {
        const res = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=41.5868&longitude=-93.6250" +
            "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m," +
            "wind_direction_10m,relative_humidity_2m,precipitation" +
            "&daily=temperature_2m_max,temperature_2m_min" +
            "&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FChicago&forecast_days=1"
        );
        if (!res.ok) throw new Error("HTTP " + res.status);
        const d   = await res.json();
        const c   = d.current, day = d.daily;
        tPrint("Condition  : " + (WMO[c.weather_code] || "Unknown"), "");
        tPrint("Temp       : " + Math.round(c.temperature_2m) + "°F  (feels like " + Math.round(c.apparent_temperature) + "°F)", "");
        tPrint("High / Low : " + Math.round(day.temperature_2m_max[0]) + "°F / " + Math.round(day.temperature_2m_min[0]) + "°F", "");
        tPrint("Wind       : " + WIND_DIR(c.wind_direction_10m) + " " + Math.round(c.wind_speed_10m) + " mph", "");
        tPrint("Humidity   : " + c.relative_humidity_2m + "%", "");
        if (c.precipitation > 0) tPrint("Precip     : " + c.precipitation.toFixed(2) + " in", "tl-warn");
        tBlank();
        tPrint("Live data via Open-Meteo • Des Moines, Iowa", "tl-ok");
    } catch (err) {
        tPrint("Failed to fetch weather: " + err.message, "tl-err");
        tPrint("Tip: try  curl wttr.in  as a fallback.", "tl-dim");
    }
}

function cmdHistoryCmd() {
    if (!termHistory.length) { tPrint("No history yet.", "tl-dim"); return; }
    termHistory.slice().reverse().forEach((cmd, i) => {
        tHTML(
            "<span style='color:rgba(255,255,255,0.28);display:inline-block;min-width:5ch'>" + (i + 1) + "</span>" +
            "<span>" + cmd + "</span>"
        );
    });
}

function cmdGit(args) {
    const sub = (args[0] || "").toLowerCase();
    if (sub === "log") {
        [
            ["a3f91b2", "Add interactive terminal with 25+ commands"],
            ["8cd02e4", "Implement retro CRT phosphor mode + scanlines"],
            ["f17aa33", "Add live guestbook with Supabase + pagination"],
            ["2b8e56f", "Replace theme dots with live hue/alpha picker"],
            ["d9c14a1", "Replace emoji stack icons with real SVG logos"],
            ["7e0f38c", "Add draggable TI-83 with real math evaluation"],
            ["3b5f9e1", "Implement view-switching SPA pattern"],
            ["1a2b3c4", "Initial commit -- portfolio v1.0"],
        ].forEach(c => {
            tHTML("<span style='color:var(--accent)'>commit " + c[0] + "</span>");
            tPrint("Author: Snow <snow@portfolio.dev>", "tl-dim");
            tPrint("    " + c[1], "");
            tBlank();
        });
    } else if (sub === "status") {
        tPrint("On branch main", "");
        tPrint("Your branch is up to date with 'origin/main'.", "tl-ok");
        tBlank();
        tPrint("nothing to commit, working tree clean", "tl-ok");
    } else if (sub === "branch") {
        tPrint("* main", "tl-ok");
        tPrint("  dev", "tl-dim");
        tPrint("  feature/terminal", "tl-dim");
    } else if (sub === "diff") {
        tPrint("(nothing to diff -- all changes committed)", "tl-ok");
    } else if (sub === "stash") {
        tPrint("Saved working directory state WIP on main", "tl-ok");
    } else {
        tPrint("usage: git [log | status | branch | diff | stash]", "tl-err");
    }
}

function cmdBanner() {
    [
        " ######## ##    ## ####### ##      ##",
        " ##       ###   ## ##   ## ##      ##",
        " ######## ## ## ## ##   ## ##  #   ##",
        "       ## ##   ### ##   ## ## ### ##",
        " ######## ##    ## ####### ####  ####",
    ].forEach(l => tPrint(l, "tl-ascii"));
    tBlank();
    tPrint("  Front-end dev  *  Des Moines, Iowa  *  Open to opportunities", "tl-dim");
}

function cmdMan(args) {
    const pages = {
        cat:     "CAT(1)\n  Print file contents or ASCII cat with no args.\n  Usage: cat [file]\n  Files: secrets.txt, readme.md",
        ls:      "LS(1)\n  List directory contents.\n  Usage: ls [-l] [-la] [-a]",
        color:   "COLOR(1)\n  Change the site accent colour.\n  Usage: color [--retro | --reset | --hue <0-360>]",
        neofetch:"NEOFETCH(1)\n  Display system info alongside ASCII art logo.",
        git:     "GIT(1)\n  Distributed version control (simulated).\n  Usage: git [log | status | branch | diff | stash]",
        matrix:  "MATRIX(1)\n  Render Matrix-style character rain for 5 seconds.\n  Press Ctrl+C to cancel.",
        sudo:    "SUDO(1)\n  Execute a command as superuser.\n  Result: it will not work here.",
        weather: "WEATHER(1)\n  Live weather for Des Moines, Iowa via Open-Meteo.\n  Shows: condition, temp, feels-like, high/low, wind, humidity.",
        ping:    "PING(1)\n  Send ICMP echo requests (simulated).\n  Usage: ping <host>",
        fortune: "FORTUNE(1)\n  Display random developer wisdom.",
        banner:  "BANNER(1)\n  Print SNOW in ASCII block letters.",
        open:    "OPEN(1)\n  Open a URL in a new browser tab.\n  Usage: open <url>",
        history: "HISTORY(1)\n  Show command history for this session.",
        uname:   "UNAME(1)\n  Print system information.\n  Usage: uname [-a]",
        uptime:  "UPTIME(1)\n  Show session uptime.",
    };
    const topic = (args[0] || "").toLowerCase();
    if (!topic) {
        tPrint("Usage: man <command>", "tl-err");
        tPrint("Pages: " + Object.keys(pages).join(", "), "tl-dim");
    } else if (pages[topic]) {
        tPrint(pages[topic], "");
    } else {
        tPrint("No manual entry for '" + topic + "'.", "tl-err");
        tPrint("Pages: " + Object.keys(pages).join(", "), "tl-dim");
    }
}

function cmdPing(args) {
    const host = args[0] || "portfolio.snow.dev";
    tPrint("PING " + host + " (127.0.0.1): 56 data bytes");
    [11, 12, 10, 13].forEach((ms, i) =>
        tPrint("64 bytes from " + host + ": icmp_seq=" + (i + 1) + " ttl=64 time=" + ms + " ms")
    );
    tBlank();
    tPrint("--- " + host + " ping statistics ---", "tl-dim");
    tPrint("4 packets transmitted, 4 received, 0.0% packet loss", "tl-ok");
    tPrint("round-trip min/avg/max = 10/11.5/13 ms", "tl-dim");
}

function cmdCurl(args) {
    const url = args[0] || "";
    if (!url) { tPrint("curl: no URL provided.  Usage: curl <url>", "tl-err"); return; }
    if (url.includes("wttr") || url.includes("weather")) { cmdWeather(); return; }
    tPrint("  % Total  % Received  % Xferd", "tl-dim");
    tPrint("  0     0    0     0    0     0  --:--:-- 0:00:02", "tl-dim");
    tPrint("curl: (6) Could not resolve host: " + url, "tl-err");
    tPrint("(Portfolio only -- try  weather  or  ping  instead.)", "tl-dim");
}

function cmdFortune() {
    const quotes = [
        "Any fool can write code a computer can understand.\nGood programmers write code humans can understand.\n  -- Martin Fowler",
        "First, solve the problem. Then, write the code.\n  -- John Johnson",
        "Clean code always looks like it was written by someone who cares.\n  -- Robert C. Martin",
        "Make it work, make it right, make it fast.\n  -- Kent Beck",
        "The best error message is the one that never shows up.\n  -- Thomas Fuchs",
        "It works on my machine. -- every developer, eternally.",
        "CSS: Cascading Stress Sheets. We love it anyway.",
        "Have you tried turning it off and on again?",
        "// TODO: remove before launch\n  (The comment is still there two years later.)",
        "Weeks of coding can save you hours of planning.",
    ];
    tPrint(quotes[Math.floor(Math.random() * quotes.length)], "tl-dim");
}

function cmdSL() {
    tPrint("        ====        ________                ___________       ", "tl-ascii");
    tPrint("    _D _|  |_______/        \\__I_I_____===__|___________|     ", "tl-ascii");
    tPrint("     |(_)---  |   H\\________/ |   |        =|___ ___|         ", "tl-ascii");
    tPrint("     /     |  |   H  |  |     |   |         ||_| |_||         ", "tl-ascii");
    tPrint("    |      |  |   H  |__--------------------| [___] |         ", "tl-ascii");
    tPrint("    |/ |   |-----------I_____I [][] []  D   |=======|__|      ", "tl-ascii");
    tPrint("  __/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__|      ", "tl-ascii");
    tPrint(" |/-=|___|=    ||  ||  ||  ||  |_____/~\\___/          |       ", "tl-ascii");
    tBlank();
    tPrint("sl: Did you mean  ls  ? (steam locomotive)", "tl-dim");
}

function cmdSudo(args) {
    const sub = args.join(" ");
    if (sub === "rm -rf /" || sub === "rm -rf /*" || sub === "rm -rf ~") {
        tPrint("[sudo] password for snow: ", "");
        setTimeout(() => {
            tPrint("Sorry, try again.", "tl-err");
            setTimeout(() => {
                tPrint("[sudo] password for snow: ", "");
                setTimeout(() => {
                    tPrint("Sorry, try again.", "tl-err");
                    setTimeout(() => {
                        tPrint("sudo: 2 incorrect password attempts", "tl-err");
                        tBlank();
                        tPrint("The portfolio lives on. :)", "tl-accent");
                        tScroll();
                    }, 700);
                }, 1100);
            }, 700);
        }, 1100);
        return;
    }
    tPrint("snow is not in the sudoers file. This incident will be reported.", "tl-err");
}

function cmdOpen(args) {
    const url = args.join(" ").trim();
    if (!url) { tPrint("Usage: open <url>", "tl-err"); return; }
    const href = url.startsWith("http") ? url : "https://" + url;
    window.open(href, "_blank", "noopener,noreferrer");
    tPrint("Opening " + href + " ...", "tl-ok");
}

function cmdMatrix() {
    const out = tOut();
    if (!out) return;
    const w    = out.clientWidth || 600;
    const h    = 240;
    const COLS = Math.floor(w / 10);
    const chars= "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789@#$%";

    const canvas = document.createElement("canvas");
    canvas.width  = w; canvas.height = h;
    canvas.style.cssText = "display:block;width:100%;border-radius:6px;margin:0.5rem 0;";
    out.appendChild(canvas);
    tScroll();

    const ctx  = canvas.getContext("2d");
    const ROWS = Math.floor(h / 16);
    const streams = Array.from({ length: COLS }, () => ({
        y:     Math.floor(Math.random() * -40),
        speed: 1 + Math.floor(Math.random() * 2),
        len:   8 + Math.floor(Math.random() * 14),
    }));

    tPrint("Entering the Matrix... (5s, Ctrl+C to stop)", "tl-dim");
    tScroll();

    function draw() {
        ctx.fillStyle = "rgba(0,0,0,0.08)";
        ctx.fillRect(0, 0, w, h);
        ctx.font = '13px "JetBrains Mono", monospace';
        streams.forEach((s, col) => {
            for (let row = 0; row < s.len; row++) {
                const y = s.y - row;
                if (y < 0 || y >= ROWS) continue;
                const alpha = row === 0 ? 1 : (s.len - row) / s.len;
                ctx.fillStyle = row === 0
                    ? "rgba(210,255,210," + alpha + ")"
                    : "rgba(0,255,65," + alpha * 0.75 + ")";
                ctx.fillText(chars[Math.floor(Math.random() * chars.length)], col * 10, y * 16 + 16);
            }
            if (Math.random() < 0.02) {
                s.y = Math.floor(Math.random() * -30);
                s.len = 8 + Math.floor(Math.random() * 14);
            } else {
                s.y += s.speed;
                if (s.y - s.len > ROWS) s.y = 0;
            }
        });
        matrixRAF = requestAnimationFrame(draw);
    }
    draw();
    setTimeout(() => {
        if (matrixRAF) { cancelAnimationFrame(matrixRAF); matrixRAF = null; tPrint("Matrix exited. Welcome back.", "tl-ok"); tScroll(); }
    }, 5000);
}

// ── Keyboard handler ───────────────────────────────────
function termKeydown(e) {
    const inp = document.getElementById("term-input");
    if (!inp) return;

    if (e.key === "Enter") {
        termRun();
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (termHistIdx < termHistory.length - 1) {
            termHistIdx++;
            inp.value = termHistory[termHistIdx];
            requestAnimationFrame(() => { inp.selectionStart = inp.selectionEnd = inp.value.length; });
        }
    } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (termHistIdx > 0) { termHistIdx--; inp.value = termHistory[termHistIdx]; }
        else { termHistIdx = -1; inp.value = ""; }
    } else if (e.key === "Tab") {
        e.preventDefault();
        const val = inp.value.trim();
        const candidates = [
            "help","clear","cat","cat secrets.txt","cat readme.md","ls","ls -la",
            "pwd","whoami","echo","date","uname -a","uptime","neofetch","projects",
            "stack","contact","color --retro","color --reset","color --hue","weather",
            "history","git log","git status","git branch","git diff","ping","curl",
            "banner","matrix","fortune","sl","man","sudo","open","exit",
        ];
        const match = candidates.find(c => c !== val && c.startsWith(val));
        if (match) inp.value = match;
    } else if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        tClear();
    } else if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        if (matrixRAF) {
            cancelAnimationFrame(matrixRAF); matrixRAF = null;
            tPrint("^C  Matrix interrupted.", "tl-err");
        } else {
            tPrint("^C", "tl-err");
        }
        tBlank(); tScroll();
        inp.value = "";
    }
}

/* ════════════════════════════════════════════════════════
   PHOTOGRAPHY LIGHTBOX
════════════════════════════════════════════════════════ */
let photoLoaded = false;

function loadPhotography() {
    if (photoLoaded) return;
    photoLoaded = true;
    document.querySelectorAll("#photo-grid .photo-item").forEach((item, idx) => {
        item.style.animationDelay = (idx * 0.06) + "s";
        item.addEventListener("click", () => {
            const img = item.querySelector("img");
            if (img) openLightbox(img.src, img.alt, idx);
        });
    });
}

function openLightbox(src, alt, idx) {
    const lb        = document.getElementById("photo-lightbox");
    const lbImg     = document.getElementById("lb-img");
    const lbCaption = document.getElementById("lb-caption");
    const lbCounter = document.getElementById("lb-counter");
    const total     = document.querySelectorAll("#photo-grid .photo-item").length;
    if (!lb || !lbImg) return;

    lbImg.src    = src;
    lbImg.alt    = alt;
    if (lbCaption) lbCaption.textContent = alt;
    if (lbCounter) lbCounter.textContent = (idx + 1) + " / " + total;
    lb.dataset.idx = idx;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    const lb = document.getElementById("photo-lightbox");
    if (lb) lb.classList.remove("open");
    document.body.style.overflow = "";
}

function lbNav(dir) {
    const lb    = document.getElementById("photo-lightbox");
    const items = document.querySelectorAll("#photo-grid .photo-item");
    if (!lb || !items.length) return;

    const idx   = (parseInt(lb.dataset.idx) + dir + items.length) % items.length;
    const img   = items[idx].querySelector("img");
    const lbImg = document.getElementById("lb-img");
    if (!lbImg || !img) return;

    lbImg.style.opacity = "0";
    setTimeout(() => {
        lbImg.src = img.src; lbImg.alt = img.alt;
        const lbCaption = document.getElementById("lb-caption");
        const lbCounter = document.getElementById("lb-counter");
        if (lbCaption) lbCaption.textContent = img.alt;
        if (lbCounter) lbCounter.textContent = (idx + 1) + " / " + items.length;
        lb.dataset.idx = idx;
        lbImg.style.opacity = "1";
    }, 200);
}

document.addEventListener("keydown", e => {
    const lb = document.getElementById("photo-lightbox");
    if (!lb || !lb.classList.contains("open")) return;
    if (e.key === "Escape")     closeLightbox();
    if (e.key === "ArrowRight") lbNav(1);
    if (e.key === "ArrowLeft")  lbNav(-1);
});

/* ═══════════════════════════════════════════════════════════════
   analytics.js  —  session tracking & visitor insights
   No dependencies.
   Globals provided: visitedSections, sessionStart, padZ,
                     trackSession, renderVisitorInsights
═══════════════════════════════════════════════════════════════ */

const visitedSections = new Set();
const sessionStart    = Date.now();

function padZ(n) {
    return String(n).padStart(2, "0");
}

function trackSession(key, val) {
    try {
        const d = JSON.parse(localStorage.getItem("snow-analytics") || "{}");
        d[key] = val;
        localStorage.setItem("snow-analytics", JSON.stringify(d));
    } catch (_) {}
}

function renderVisitorInsights() {
    try {
        const d        = JSON.parse(localStorage.getItem("snow-analytics") || "{}");
        const sessions = JSON.parse(localStorage.getItem("snow-sessions")  || "[]");
        const lastSess = sessions[sessions.length - 1];
        const el       = document.getElementById("visitor-rows");
        if (!el) return;

        const rows = [];
        if (lastSess?.duration) rows.push("Last session: " + lastSess.duration);
        if (d.accent)           rows.push("Favorite accent: " + d.accent);
        if (d.ti83)             rows.push("TI-83 mode used: " + d.ti83);
        rows.push("Sections explored: " + (Array.from(visitedSections).join(", ") || "Just arrived!"));

        el.innerHTML = rows
            .map(t => `<div class="visitor-row"><div class="dot"></div><span>${t}</span></div>`)
            .join("");
    } catch (_) {}
}

// Persist session duration when the tab closes.
// currentHue / currentAlpha are defined in theme.js (loads after this file
// but well before the browser fires beforeunload).
window.addEventListener("beforeunload", () => {
    try {
        const elapsed  = Math.floor((Date.now() - sessionStart) / 1000);
        const dur      = Math.floor(elapsed / 60) + "m " + padZ(elapsed % 60) + "s";
        const sessions = JSON.parse(localStorage.getItem("snow-sessions") || "[]");
        sessions.push({ duration: dur, ts: Date.now(), hue: currentHue, alpha: currentAlpha });
        localStorage.setItem("snow-sessions", JSON.stringify(sessions.slice(-7)));
    } catch (_) {}
});

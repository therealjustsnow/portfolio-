/* ═══════════════════════════════════════════════════════════════
   ti83.js  —  TI-83 graphing calculator widget
   Deps: trackSession (analytics.js)
   Globals provided: toggleTI, closeTI, tiInsert, tiClear,
                     safeEval, drawGrid, graphEq, findRoots, tiBtn, tiRun
═══════════════════════════════════════════════════════════════ */

let tiActive = false;

function toggleTI() {
    tiActive = !tiActive;
    const overlay = document.getElementById("ti-overlay");
    const calc    = document.getElementById("ti-calc");
    const toggle  = document.getElementById("ti-toggle");
    const status  = document.getElementById("ti83-status");
    if (overlay) overlay.classList.toggle("active", tiActive);
    if (calc)    calc.classList.toggle("active", tiActive);
    if (toggle)  toggle.textContent = tiActive ? "EXIT TI" : "TI-83";
    if (status)  status.textContent = "TI-83: " + (tiActive ? "ON ◉" : "off");
    if (tiActive) { trackSession("ti83", "Yes"); drawGrid(); }
}

function closeTI() {
    tiActive = false;
    const overlay = document.getElementById("ti-overlay");
    const calc    = document.getElementById("ti-calc");
    const toggle  = document.getElementById("ti-toggle");
    const status  = document.getElementById("ti83-status");
    if (overlay) overlay.classList.remove("active");
    if (calc)    calc.classList.remove("active");
    if (toggle)  toggle.textContent = "TI-83";
    if (status)  status.textContent = "TI-83: off";
}

// ── Drag handler ─────────────────────────────────────────────────────────────
(function () {
    const calc = document.getElementById("ti-calc");
    if (!calc) return;
    const header = calc.querySelector(".ti-header");
    if (!header) return;

    let dragging = false, ox = 0, oy = 0, calcW = 0, calcH = 0;

    function initPos() {
        if (calc.style.left) return;
        const r      = calc.getBoundingClientRect();
        calc.style.left   = r.left + "px";
        calc.style.top    = r.top  + "px";
        calc.style.bottom = "auto";
        calc.style.right  = "auto";
    }

    function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

    function onMove(cx, cy) {
        if (!dragging) return;
        // Use cached dimensions — no getBoundingClientRect() inside the hot path
        calc.style.left = clamp(cx - ox, 0, window.innerWidth  - calcW) + "px";
        calc.style.top  = clamp(cy - oy, 0, window.innerHeight - calcH) + "px";
    }

    function onUp() {
        if (!dragging) return;
        dragging = false;
        header.style.cursor  = "grab";
        calc.style.boxShadow = "0 0 30px rgba(0,255,65,0.25)";
    }

    // Mouse
    header.addEventListener("mousedown", e => {
        if (e.target.classList.contains("ti-close-btn")) return;
        e.preventDefault();
        initPos();
        const r = calc.getBoundingClientRect();
        calcW = calc.offsetWidth; calcH = calc.offsetHeight; // read layout once
        dragging = true;
        ox = e.clientX - r.left; oy = e.clientY - r.top;
        header.style.cursor  = "grabbing";
        calc.style.boxShadow = "0 8px 48px rgba(0,255,65,0.4), 0 0 30px rgba(0,255,65,0.25)";
    });
    document.addEventListener("mousemove", e => onMove(e.clientX, e.clientY));
    document.addEventListener("mouseup",   onUp);

    // Touch
    header.addEventListener("touchstart", e => {
        if (e.target.classList.contains("ti-close-btn")) return;
        e.preventDefault();
        initPos();
        const r = calc.getBoundingClientRect();
        calcW = calc.offsetWidth; calcH = calc.offsetHeight;
        dragging = true;
        const t  = e.touches[0];
        ox = t.clientX - r.left; oy = t.clientY - r.top;
        calc.style.boxShadow = "0 8px 48px rgba(0,255,65,0.4), 0 0 30px rgba(0,255,65,0.25)";
    }, { passive: false });
    document.addEventListener("touchmove", e => {
        if (!dragging) return;
        e.preventDefault();
        onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    document.addEventListener("touchend", onUp);
})();

// ── Calculator helpers ────────────────────────────────────────────────────────

function tiInsert(txt) {
    const inp = document.getElementById("ti-input");
    if (!inp) return;
    inp.value = txt;
    inp.focus();
}

function tiClear() {
    const inp    = document.getElementById("ti-input");
    const out    = document.getElementById("ti-output");
    const canvas = document.getElementById("ti-canvas");
    if (inp)    inp.value        = "";
    if (out)    out.textContent  = "Cleared.";
    if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
}

// ── Math engine ───────────────────────────────────────────────────────────────

function safeEval(expr, x) {
    try {
        const scope = {
            x, Math,
            sin: Math.sin, cos: Math.cos, tan: Math.tan,
            sqrt: Math.sqrt, abs: Math.abs, log: Math.log, exp: Math.exp,
            PI: Math.PI,    E: Math.E,
        };
        const fn = new Function(...Object.keys(scope), "return (" + expr + ")");
        const r  = fn(...Object.values(scope));
        return isFinite(r) ? r : null;
    } catch (_) { return null; }
}

function drawGrid() {
    const canvas = document.getElementById("ti-canvas");
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(0,255,65,0.15)";
    ctx.lineWidth   = 1;
    const step = 20;
    for (let x = 0; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    ctx.strokeStyle = "rgba(0,255,65,0.5)";
    ctx.beginPath(); ctx.moveTo(W / 2, 0);   ctx.lineTo(W / 2, H);   ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,     H / 2); ctx.lineTo(W,     H / 2); ctx.stroke();
}

function graphEq(expr) {
    const canvas = document.getElementById("ti-canvas");
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    drawGrid();
    ctx.strokeStyle = "#00ff41";
    ctx.lineWidth   = 2;
    ctx.beginPath();
    const xRange = 10;
    let first    = true;
    for (let px = 0; px < W; px++) {
        const x  = (px / W - 0.5) * xRange * 2;
        const y  = safeEval(expr, x);
        if (y === null) { first = true; continue; }
        const py = H / 2 - y * (H / xRange / 2);
        first ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        first = false;
    }
    ctx.stroke();
}

function findRoots(expr) {
    const roots = [];
    let prev = null, prevX = null;
    for (let xi = -10; xi <= 10; xi += 0.05) {
        const y = safeEval(expr, xi);
        if (y === null) { prev = null; continue; }
        if (prev !== null && prev * y < 0) {
            let lo = prevX, hi = xi;
            for (let i = 0; i < 40; i++) {
                const mid = (lo + hi) / 2, ym = safeEval(expr, mid);
                if (ym === null) break;
                safeEval(expr, lo) * ym <= 0 ? (hi = mid) : (lo = mid);
                if (hi - lo < 1e-8) break;
            }
            const root = (lo + hi) / 2;
            if (!roots.some(r => Math.abs(r - root) < 0.01)) roots.push(root);
        }
        prev = y; prevX = xi;
    }
    return roots;
}

function tiBtn(mode) {
    const inp  = document.getElementById("ti-input");
    const out  = document.getElementById("ti-output");
    if (!inp || !out) return;
    const expr = inp.value.trim();
    if (!expr) { out.textContent = "Enter an expression first."; return; }

    if (mode === "graph") {
        graphEq(expr);
        out.textContent = "Graphed: " + expr;
    } else if (mode === "roots") {
        graphEq(expr);
        const roots = findRoots(expr);
        out.textContent = roots.length === 0
            ? "No roots found in [-10, 10]."
            : "Roots: x ≈ " + roots.map(r => r.toFixed(4)).join(", ");
    } else if (mode === "solve") {
        const xStr = prompt("Solve f(x) at x =");
        if (xStr === null) return;
        const xVal = parseFloat(xStr);
        if (isNaN(xVal)) { out.textContent = "Invalid x value."; return; }
        const y = safeEval(expr, xVal);
        out.textContent = y === null ? "Error evaluating." : `f(${xVal}) = ${y.toFixed(6)}`;
    }
}

function tiRun() {
    const inp  = document.getElementById("ti-input");
    const out  = document.getElementById("ti-output");
    if (!inp || !out) return;
    const expr = inp.value.trim();
    if (!expr) return;

    if (/x/i.test(expr)) {
        graphEq(expr);
        const roots = findRoots(expr);
        out.textContent = "Graphed: " + expr +
            (roots.length ? "\nRoots ≈ " + roots.map(r => r.toFixed(4)).join(", ") : "");
    } else {
        const result = safeEval(expr, 0);
        out.textContent = result === null ? "Error: invalid expression" : expr + " = " + result;
    }
}

// Wire enter key
(function () {
    const inp = document.getElementById("ti-input");
    if (inp) inp.addEventListener("keydown", e => { if (e.key === "Enter") tiRun(); });
})();

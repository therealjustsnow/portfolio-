/* ═══════════════════════════════════════════════════════════════
   theme.js  —  hue/alpha accent color system
   Deps: trackSession (analytics.js)
   Globals provided: currentHue, currentAlpha, hslToRgb, rgbToHex,
                     applyCustomColor, updatePickerUI, hexToHsl,
                     applyHexInput, toggleColorPopup, applyTheme
═══════════════════════════════════════════════════════════════ */

let currentHue   = parseFloat(localStorage.getItem("snow-hue")   ?? "280");
let currentAlpha = parseFloat(localStorage.getItem("snow-alpha") ?? "1");

function hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

function darkBg(h, l1, l2, l3) {
    return [`hsl(${h},55%,${l1}%)`, `hsl(${h},55%,${l2}%)`, `hsl(${h},50%,${l3}%)`];
}

function applyCustomColor(hue, alpha) {
    currentHue   = hue;
    currentAlpha = alpha;

    const [r, g, b]  = hslToRgb(hue, 80, 58);
    const hex        = rgbToHex(r, g, b);
    const [g1, g2, g3] = darkBg(hue, 7, 4.5, 9);

    const root = document.documentElement.style;
    root.setProperty("--accent",      `hsl(${hue},80%,58%)`);
    root.setProperty("--accent-rgb",  `${r},${g},${b}`);
    root.setProperty("--accent-dark", `hsl(${hue},80%,43%)`);
    root.setProperty("--accent-glow", `rgba(${r},${g},${b},${0.35 * alpha})`);
    root.setProperty("--g1", g1);
    root.setProperty("--g2", g2);
    root.setProperty("--g3", g3);

    document.body.className = "";

    const dispEl     = document.getElementById("theme-display");
    const hueTrack   = document.getElementById("hue-track");
    const alphaTrack = document.getElementById("alpha-track");

    if (dispEl)     dispEl.textContent       = alpha < 1 ? `${hex} / ${Math.round(alpha * 100)}%` : hex;
    if (hueTrack)   hueTrack.value           = hue;
    if (alphaTrack) alphaTrack.value         = Math.round(alpha * 100);

    updatePickerUI(hue, alpha);

    localStorage.setItem("snow-hue",   hue);
    localStorage.setItem("snow-alpha", alpha);
    trackSession("accent", hex + (alpha < 1 ? "/" + Math.round(alpha * 100) + "%" : ""));
}

function updatePickerUI(hue, alpha) {
    const [r, g, b]  = hslToRgb(hue, 80, 58);
    const hex        = rgbToHex(r, g, b);
    const swatchEl   = document.getElementById("cp-swatch");
    const hexInput   = document.getElementById("cp-hex-input");
    const alphaTrack = document.getElementById("alpha-track");

    if (swatchEl)   swatchEl.style.background = `rgba(${r},${g},${b},${alpha})`;
    if (alphaTrack) alphaTrack.style.background =
        `linear-gradient(to right, rgba(${r},${g},${b},0), rgba(${r},${g},${b},1))`;
    // Only update hex input if the user isn't actively typing in it
    if (hexInput && document.activeElement !== hexInput) {
        hexInput.value = hex;
        hexInput.classList.remove("invalid");
    }
}

function hexToHsl(hex) {
    hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_, r, g, b) => "#" + r + r + g + g + b + b);
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return null;
    let r = parseInt(m[1], 16) / 255,
        g = parseInt(m[2], 16) / 255,
        b = parseInt(m[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6;                break;
            case b: h = ((r - g) / d + 4) / 6;                break;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function applyHexInput(rawVal) {
    const hex   = rawVal.trim().startsWith("#") ? rawVal.trim() : "#" + rawVal.trim();
    const hsl   = hexToHsl(hex);
    const input = document.getElementById("cp-hex-input");
    if (!hsl) { if (input) input.classList.add("invalid"); return; }
    if (input)  input.classList.remove("invalid");
    applyCustomColor(hsl.h, currentAlpha);
}

let colorPopupOpen = false;

function toggleColorPopup() {
    colorPopupOpen = !colorPopupOpen;
    const popup = document.getElementById("color-popup");
    if (popup) popup.classList.toggle("open", colorPopupOpen);
    if (colorPopupOpen) updatePickerUI(currentHue, currentAlpha);
}

// Legacy shim — no-op
function applyTheme(_t) {}

// ── Wire all color-picker event listeners ───────────────────────────────────
(function () {
    const cpHexInput  = document.getElementById("cp-hex-input");
    const cpApplyBtn  = document.getElementById("cp-apply-btn");
    const hueTrack    = document.getElementById("hue-track");
    const alphaTrack  = document.getElementById("alpha-track");

    if (cpHexInput) {
        cpHexInput.addEventListener("keydown", e => {
            if (e.key === "Enter")  { e.preventDefault(); applyHexInput(cpHexInput.value); cpHexInput.blur(); }
            if (e.key === "Escape") { cpHexInput.blur(); }
        });
        cpHexInput.addEventListener("input", function () {
            const val   = this.value.trim();
            const clean = val.startsWith("#") ? val : "#" + val;
            if (/^#[a-f\d]{6}$/i.test(clean) || /^#[a-f\d]{3}$/i.test(clean)) {
                this.classList.remove("invalid");
                applyHexInput(val);
            } else {
                this.classList.toggle("invalid", val.length > 0);
            }
        });
        cpHexInput.addEventListener("focus", function () { if (!this.value) this.value = "#"; });
        cpHexInput.addEventListener("blur", function () {
            if (this.value === "#") this.value = "";
            const [r, g, b] = hslToRgb(currentHue, 80, 58);
            if (this.classList.contains("invalid")) this.value = rgbToHex(r, g, b);
            this.classList.remove("invalid");
        });
    }

    if (cpApplyBtn) {
        cpApplyBtn.addEventListener("click", () => {
            if (cpHexInput) { applyHexInput(cpHexInput.value); cpHexInput.blur(); }
        });
    }

    if (hueTrack) {
        hueTrack.addEventListener("input", function () {
            applyCustomColor(parseFloat(this.value), currentAlpha);
        });
    }

    if (alphaTrack) {
        alphaTrack.addEventListener("input", function () {
            applyCustomColor(currentHue, parseFloat(this.value) / 100);
        });
    }

    // Close color popup when clicking outside
    document.addEventListener("click", e => {
        if (!colorPopupOpen) return;
        const popup = document.getElementById("color-popup");
        const btn   = document.getElementById("hue-btn");
        if (!popup || !btn) return;
        if (!popup.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
            colorPopupOpen = false;
            popup.classList.remove("open");
        }
    });
})();

// Initialise
applyCustomColor(currentHue, currentAlpha);

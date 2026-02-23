/* ═══════════════════════════════════════════════════════════════
   effects.js  —  cursor glow, magnetic hover, particle trail, scroll reveal
   Deps: visitedSections (analytics.js)
   Globals provided: isTouch
   All DOM work deferred to window.load so it never blocks FCP/LCP.
═══════════════════════════════════════════════════════════════ */

const isTouch = window.matchMedia("(hover:none)").matches;

window.addEventListener("load", () => {

    // ── Scroll reveal + section tracking ─────────────────────────────────────
    const ro = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add("visible");
            const sec = e.target.closest("section");
            if (sec && sec.id) visitedSections.add(sec.id);
        });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal, .section-header").forEach(el => ro.observe(el));

    // ── Cursor glow (desktop only) ────────────────────────────────────────────
    const glow = document.getElementById("cursor-glow");
    let glowX = window.innerWidth / 2, glowY = window.innerHeight / 2, rafGlow;

    document.addEventListener("mousemove", e => {
        glowX = e.clientX; glowY = e.clientY;
        if (!rafGlow) rafGlow = requestAnimationFrame(updateGlow);
    });

    function updateGlow() {
        if (glow) { glow.style.left = glowX + "px"; glow.style.top = glowY + "px"; }
        rafGlow = null;
    }

    if (!isTouch) {
        // ── Magnetic effect on buttons / nav links ────────────────────────────
        document.querySelectorAll(".btn, .nav-links a").forEach(item => {
            let rect = null;
            item.addEventListener("mouseenter", () => { rect = item.getBoundingClientRect(); });
            item.addEventListener("mousemove",  e => {
                if (!rect) return;
                const x = e.clientX - rect.left - rect.width  / 2;
                const y = e.clientY - rect.top  - rect.height / 2;
                item.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
            });
            item.addEventListener("mouseleave", () => { rect = null; item.style.transform = ""; });
        });

        // ── Magnetic 3-D tilt on cards ────────────────────────────────────────
        document.querySelectorAll(".project-card, .stack-card, .time-card, .contact-card").forEach(item => {
            let rect = null;
            item.addEventListener("mouseenter", () => { rect = item.getBoundingClientRect(); });
            item.addEventListener("mousemove",  e => {
                if (!rect) return;
                const x = e.clientX - rect.left - rect.width  / 2;
                const y = e.clientY - rect.top  - rect.height / 2;
                item.style.transform =
                    `translate(${x * 0.04}px, ${y * 0.04}px) ` +
                    `perspective(320px) rotateY(${x * 0.06}deg) rotateX(${-y * 0.06}deg) ` +
                    `translateY(-8px) translateZ(10px)`;
            });
            item.addEventListener("mouseleave", () => { rect = null; item.style.transform = ""; });
        });

        // ── Particle cursor trail ─────────────────────────────────────────────
        let lastSpawn = 0;
        const SPAWN_INTERVAL = 40, MAX_PARTICLES = 30;
        const particles = [];

        document.addEventListener("mousemove", e => {
            const now = Date.now();
            if (now - lastSpawn < SPAWN_INTERVAL) return;
            lastSpawn = now;

            if (particles.length >= MAX_PARTICLES) { const old = particles.shift(); old.remove(); }

            const p    = document.createElement("div");
            const size = 4 + Math.random() * 6;
            p.className  = "particle";
            p.style.cssText =
                `left:${e.clientX}px;top:${e.clientY}px;` +
                `width:${size}px;height:${size}px;` +
                `background:var(--accent);opacity:0.7;` +
                `transition:opacity 0.6s ease,transform 0.6s ease;`;
            document.body.appendChild(p);
            particles.push(p);

            requestAnimationFrame(() => requestAnimationFrame(() => {
                p.style.opacity   = "0";
                p.style.transform =
                    `translate(-50%,-50%) scale(0) ` +
                    `translate(${(Math.random() - 0.5) * 20}px, ${-10 - Math.random() * 20}px)`;
            }));
            setTimeout(() => {
                p.remove();
                const idx = particles.indexOf(p);
                if (idx > -1) particles.splice(idx, 1);
            }, 700);
        });
    }

}); // end window.load

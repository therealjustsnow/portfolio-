document.addEventListener('DOMContentLoaded', () => {
  // --- State & Utility ---
  let currentTheme = localStorage.getItem('snow-theme') || 'purple';
  const getThemeColor = () => getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
  
  // --- Theme Management ---
  function setTheme(theme) {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('snow-theme', theme);
    currentTheme = theme;
  }
  document.querySelectorAll('.theme-switcher button').forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme));
  });
  setTheme(currentTheme);

  // --- Time & Schedule Features ---
  function updateTime() {
    const now = new Date();
    // Visitor Time
    document.getElementById('local-time').textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    // Snow's Time (Des Moines - CST/CDT)
    document.getElementById('snow-time').textContent = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour: '2-digit', minute: '2-digit'
    }).format(now);
    
    // Schedule Highlighting
    const snowHour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: 'numeric', hour12: false }).format(now));
    document.querySelectorAll('#schedule-list li').forEach(li => {
      const start = parseInt(li.dataset.start);
      const end = parseInt(li.dataset.end);
      if (snowHour >= start && snowHour < end) {
        li.style.color = `rgb(${getThemeColor()})`;
        li.style.fontWeight = 'bold';
      } else {
        li.style.color = '';
        li.style.fontWeight = 'normal';
      }
    });
  }
  setInterval(updateTime, 1000);
  updateTime();

  // --- Session Counter ---
  const startTime = Date.now();
  setInterval(() => {
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const m = Math.floor(diff / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    document.getElementById('session-timer').textContent = `${m}:${s}`;
  }, 1000);

  // --- Typewriter Effect ---
  const phrases = ["🎮 Gamer", "Blending Design & Functionality", "Open Source First", "ClearVision Team Member", "Maintaining MusicBot", "Working on Aquarion", "Calculator Tinkerer", "Rolling Burritos"];
  let phraseIdx = 0, charIdx = 0, isDeleting = false, typewriterEl = document.getElementById('typewriter');
  
  function type() {
    const currentText = phrases[phraseIdx];
    typewriterEl.textContent = isDeleting ? currentText.substring(0, charIdx - 1) : currentText.substring(0, charIdx + 1);
    charIdx += isDeleting ? -1 : 1;
    
    if (!isDeleting && charIdx === currentText.length) {
      isDeleting = true; setTimeout(type, 2000);
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; setTimeout(type, 500);
    } else {
      setTimeout(type, isDeleting ? 50 : 100);
    }
  }
  setTimeout(type, 1000);

  // --- GitHub API & Caching ---
  document.querySelectorAll('.read-more').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const repo = e.target.dataset.repo;
      const modal = document.getElementById('github-modal');
      const list = document.getElementById('commit-list');
      modal.classList.remove('hidden');
      list.innerHTML = '<li>Loading commits...</li>';
      
      const cacheKey = `commits_${repo}`;
      const cached = JSON.parse(localStorage.getItem(cacheKey));
      if (cached && Date.now() - cached.time < 3600000) { // 1 hour TTL
        renderCommits(cached.data, true);
        return;
      }
      
      try {
        const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=5`);
        if (!res.ok) throw new Error('API Rate Limit or Error');
        const data = await res.json();
        localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), data }));
        renderCommits(data, false);
      } catch (err) {
        list.innerHTML = `<li>Error: ${err.message}. Try again later.</li>`;
      }
    });
  });

  document.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('github-modal').classList.add('hidden');
  });

  function renderCommits(commits, isCached) {
    const list = document.getElementById('commit-list');
    list.innerHTML = isCached ? '<li style="font-size:0.8em; color:gray;">(Loaded from cache)</li>' : '';
    commits.forEach(c => {
      list.innerHTML += `<li><a href="${c.html_url}" target="_blank" style="color:var(--text-primary)">${c.commit.message.split('\n')[0]}</a></li>`;
    });
  }

  // --- 3D Tilt Effect ---
  // Apply only if hover is supported (desktop)
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        card.style.transform = `perspective(1000px) rotateX(${-y / 10}deg) rotateY(${x / 10}deg) scale(1.02)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  }

  // --- Visitor Analytics (Privacy Friendly) ---
  function updateAnalytics() {
    let stats = JSON.parse(localStorage.getItem('snow-analytics')) || { visits: 0, ti83: false, lastTheme: '' };
    stats.visits += 1;
    stats.lastTheme = currentTheme;
    localStorage.setItem('snow-analytics', JSON.stringify(stats));
    
    document.getElementById('visitor-stats-list').innerHTML = `
      <li>Total Visits: ${stats.visits}</li>
      <li>Favorite Theme: <span style="text-transform:capitalize">${stats.lastTheme}</span></li>
      <li>TI-83 User: ${stats.ti83 ? 'Yes 🤓' : 'No'}</li>
    `;
  }
  updateAnalytics();

  // --- TI-83 Mode & Math Logic ---
  const tiToggle = document.getElementById('ti83-toggle');
  const tiCalc = document.getElementById('ti83-calc');
  tiToggle.addEventListener('click', () => {
    document.body.classList.toggle('ti83-active');
    tiCalc.classList.toggle('hidden');
    let stats = JSON.parse(localStorage.getItem('snow-analytics'));
    stats.ti83 = true;
    localStorage.setItem('snow-analytics', JSON.stringify(stats));
    updateAnalytics();
  });

  window.calcSolve = () => {
    const input = document.getElementById('calc-input').value;
    const output = document.getElementById('calc-output');
    try {
      // Basic numerical root finding (Newton-Raphson approximation for simple polynomials)
      const f = new Function('x', `return ${input.replace(/\^/g, '**')};`);
      let root = null;
      for (let i = -100; i <= 100; i+=0.5) {
        if (Math.abs(f(i)) < 0.1) { root = i; break; } // rudimentary search
      }
      output.innerText = root !== null ? `Root ≈ ${root.toFixed(2)}` : 'No simple root found in range [-100, 100]';
    } catch (e) {
      output.innerText = 'Syntax Error';
    }
  };

  window.calcGraph = () => {
    const input = document.getElementById('calc-input').value;
    const canvas = document.getElementById('graph-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = '#111';
    
    try {
      const f = new Function('x', `return ${input.replace(/\^/g, '**')};`);
      for(let px = 0; px < canvas.width; px++) {
        let x = (px - canvas.width/2) / 10; // scale
        let y = f(x);
        let py = canvas.height/2 - (y * 10);
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      document.getElementById('calc-output').innerText = 'Graph rendered.';
    } catch(e) {
      document.getElementById('calc-output').innerText = 'Graph Error';
    }
  };

  // --- GPU Particle Cursor Trail ---
  if (window.matchMedia("(hover: hover)").matches) {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particles = [];
    
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
    
    window.addEventListener('mousemove', (e) => {
      // Throttle spawn rate
      if(Math.random() > 0.5) {
        const rgb = getThemeColor();
        particles.push({ x: e.clientX, y: e.clientY, alpha: 1, size: Math.random() * 4 + 2, color: `rgba(${rgb},` });
      }
    });

    function renderParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.alpha -= 0.02; // Fade out
        p.size *= 0.95;  // Scale down
        if (p.alpha <= 0) { particles.splice(i, 1); i--; continue; }
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(renderParticles);
    }
    renderParticles();
  }
});
    

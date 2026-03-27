// TEMP DEBUG CONSOLE — remove before deploying
(function () {
  const style = document.createElement('style');
  style.textContent = `
    #_dbg{position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#0a0a0a;border-top:2px solid #a855f7;font-family:monospace;font-size:12px;max-height:45vh;display:flex;flex-direction:column}
    #_dbg-bar{display:flex;align-items:center;background:#1a0533;padding:4px 8px;gap:6px;flex-shrink:0}
    #_dbg-title{color:#a855f7;font-size:11px;flex:1}
    #_dbg-clear{background:none;border:1px solid #a855f7;color:#a855f7;border-radius:4px;padding:2px 8px;font-size:10px;cursor:pointer}
    #_dbg-close{background:none;border:none;color:#fff;font-size:1rem;cursor:pointer;padding:0 4px}
    #_dbg-out{flex:1;overflow-y:auto;padding:6px 8px;display:flex;flex-direction:column;gap:2px}
    #_dbg-row{display:flex;gap:4px;padding:4px 6px;border-top:1px solid #1a1a1a;flex-shrink:0}
    #_dbg-input{flex:1;background:#111;border:1px solid #333;color:#fff;padding:4px 6px;border-radius:4px;font-family:monospace;font-size:12px}
    #_dbg-run{background:#7c3aed;color:#fff;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:12px}
    ._dbg-line{padding:2px 0;border-bottom:1px solid #111;word-break:break-all;line-height:1.4}
    ._dbg-log{color:#e2e8f0}._dbg-err{color:#f87171}._dbg-warn{color:#fbbf24}._dbg-info{color:#60a5fa}._dbg-res{color:#4ade80}
  `;
  document.head.appendChild(style);

  const el = document.createElement('div');
  el.id = '_dbg';
  el.innerHTML = `
    <div id="_dbg-bar">
      <span id="_dbg-title">🐛 Debug Console</span>
      <button id="_dbg-clear">Clear</button>
      <button id="_dbg-close">✕</button>
    </div>
    <div id="_dbg-out"></div>
    <div id="_dbg-row">
      <input id="_dbg-input" placeholder="Run JS here…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"/>
      <button id="_dbg-run">▶</button>
    </div>
  `;
  document.body.appendChild(el);

  const out = document.getElementById('_dbg-out');

  function print(msg, cls) {
    const line = document.createElement('div');
    line.className = '_dbg-line ' + cls;
    line.textContent = msg;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }

  function serialize(args) {
    return Array.from(args).map(a => {
      if (a === null) return 'null';
      if (a === undefined) return 'undefined';
      if (typeof a === 'object') { try { return JSON.stringify(a, null, 1); } catch { return String(a); } }
      return String(a);
    }).join(' ');
  }

  // Intercept console methods
  ['log','warn','error','info'].forEach(method => {
    const orig = console[method].bind(console);
    console[method] = function(...args) {
      orig(...args);
      const cls = method === 'error' ? '_dbg-err' : method === 'warn' ? '_dbg-warn' : method === 'info' ? '_dbg-info' : '_dbg-log';
      print('[' + method + '] ' + serialize(args), cls);
    };
  });

  // Capture unhandled errors
  window.addEventListener('error', e => {
    print('[uncaught] ' + e.message + ' (' + e.filename?.split('/').pop() + ':' + e.lineno + ')', '_dbg-err');
  });

  window.addEventListener('unhandledrejection', e => {
    print('[promise] ' + (e.reason?.message || String(e.reason)), '_dbg-err');
  });

  // Run input
  function runInput() {
    const input = document.getElementById('_dbg-input');
    const code = input.value.trim();
    if (!code) return;
    print('> ' + code, '_dbg-info');
    try {
      const result = eval(code);
      if (result !== undefined) print(serialize([result]), '_dbg-res');
    } catch (e) {
      print(e.message, '_dbg-err');
    }
    input.value = '';
  }

  document.getElementById('_dbg-run').addEventListener('click', runInput);
  document.getElementById('_dbg-input').addEventListener('keydown', e => { if (e.key === 'Enter') runInput(); });
  document.getElementById('_dbg-clear').addEventListener('click', () => { out.innerHTML = ''; });
  document.getElementById('_dbg-close').addEventListener('click', () => { el.remove(); });

  print('Console ready. Try: localStorage.getItem("cookie-consent")', '_dbg-info');
})();

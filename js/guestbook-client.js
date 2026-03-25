// js/guestbook-client.js
// Drop-in replacement for the Supabase guestbook logic in app.min.js.
// Load this AFTER app.min.js -- it redefines the same global functions,
// so no edits to the minified file are needed.
// Add to index.html:  <script src="js/guestbook-client.js?v=1" defer></script>

const API_URL = '/api/guestbook';

// ── Token storage (same localStorage key as before) ───────────────────────

function gbGetTokens() {
  try { return JSON.parse(localStorage.getItem('snow_gb_tokens') || '{}'); } catch { return {}; }
}

function gbSaveToken(id, token) {
  const t = gbGetTokens();
  t[id] = token;
  localStorage.setItem('snow_gb_tokens', JSON.stringify(t));
}

function sanitize(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Char counter ──────────────────────────────────────────────────────────

(function () {
  const msg  = document.getElementById('gb-msg');
  const char = document.getElementById('gb-char');
  if (msg && char) {
    msg.addEventListener('input', function () {
      char.textContent = this.value.length + ' / 200';
    });
  }
})();

// ── Submit ────────────────────────────────────────────────────────────────

async function submitGuestbook() {
  const nameEl = document.getElementById('gb-name');
  const msgEl  = document.getElementById('gb-msg');
  const errEl  = document.getElementById('gb-error');
  const btn    = document.querySelector('.gb-submit');
  if (!nameEl || !msgEl) return;

  const name = nameEl.value.trim();
  const msg  = msgEl.value.trim();
  if (errEl) errEl.textContent = '';

  if (!name) { if (errEl) errEl.textContent = '! Name is required.';        nameEl.focus(); return; }
  if (!msg)  { if (errEl) errEl.textContent = '! Message cannot be empty.'; msgEl.focus();  return; }

  if (btn) { btn.textContent = 'Signing…'; btn.disabled = true; }

  try {
    const res  = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, message: msg }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed (' + res.status + ')');

    if (data.id && data.token) gbSaveToken(data.id, data.token);
    if (nameEl) nameEl.value = '';
    if (msgEl)  msgEl.value  = '';

    const char = document.getElementById('gb-char');
    if (char) char.textContent = '0 / 200';

    if (btn) btn.textContent = 'Signed! ✓';
    setTimeout(() => { if (btn) { btn.textContent = 'Sign ✦'; btn.disabled = false; } }, 2000);
    renderGuestbookEntries();

  } catch (err) {
    if (errEl) errEl.textContent = '! ' + err.message;
    if (btn)   { btn.textContent = 'Sign ✦'; btn.disabled = false; }
  }
}

// ── List entries ──────────────────────────────────────────────────────────

const GB_PAGE = 100;
let gbOffset  = 0;

async function renderGuestbookEntries(append = false) {
  const container   = document.getElementById('gb-entries');
  const loadMoreBtn = document.getElementById('gb-load-more');
  if (!container) return;

  if (!append) {
    gbOffset = 0;
    container.innerHTML = '<div class="gb-empty">Loading entries…</div>';
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
  } else {
    if (loadMoreBtn) { loadMoreBtn.textContent = 'Loading…'; loadMoreBtn.disabled = true; }
  }

  try {
    const res = await fetch(`${API_URL}?limit=${GB_PAGE}&offset=${gbOffset}`);
    if (!res.ok) throw new Error('Could not load entries.');
    const entries = await res.json();

    if (!append) container.innerHTML = '';

    if (entries.length === 0 && gbOffset === 0) {
      container.innerHTML = '<div class="gb-empty">No entries yet — be the first to sign! 👋</div>';
      return;
    }

    const myTokens = gbGetTokens();

    entries.forEach(e => {
      const date     = new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const editedAt = e.edited_at
        ? new Date(e.edited_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : null;
      const safeName = sanitize(String(e.name    || '').slice(0, 80));
      const safeMsg  = sanitize(String(e.message || '').slice(0, 600));
      const isOwner  = e.id && myTokens[e.id];

      const card = document.createElement('div');
      card.className       = 'glass gb-entry';
      card.dataset.entryId = e.id || '';
      card.innerHTML = `
<div class="gb-entry-header">
  <span class="gb-entry-name">${safeName}</span>
  <div class="gb-entry-meta">
    <span class="gb-entry-date">${date}</span>
    ${editedAt ? `<span class="gb-edited" title="Edited ${editedAt}">(edited)</span>` : ''}
    ${isOwner  ? `<div class="gb-entry-actions">
                    <button class="gb-action-btn gb-edit-btn"   title="Edit">✎</button>
                    <button class="gb-action-btn gb-delete-btn" title="Delete">✕</button>
                  </div>` : ''}
  </div>
</div>
<div class="gb-entry-msg">${safeMsg}</div>`;

      if (isOwner) {
        card.querySelector('.gb-edit-btn').addEventListener('click',   () => gbStartEdit(card, e, myTokens[e.id]));
        card.querySelector('.gb-delete-btn').addEventListener('click', () => gbDelete(card, e.id, myTokens[e.id]));
      }
      container.appendChild(card);
    });

    gbOffset += entries.length;

    if (loadMoreBtn) {
      const hasMore = entries.length === GB_PAGE;
      loadMoreBtn.style.display = hasMore ? 'block' : 'none';
      loadMoreBtn.textContent   = 'Load More ↓';
      loadMoreBtn.disabled      = false;
    }

  } catch (err) {
    if (!append) container.innerHTML = `<div class="gb-empty">⚠ ${err.message}</div>`;
    if (loadMoreBtn) { loadMoreBtn.textContent = 'Load More ↓'; loadMoreBtn.disabled = false; }
  }
}

function loadMoreEntries() { renderGuestbookEntries(true); }

// ── Edit ──────────────────────────────────────────────────────────────────

function gbStartEdit(card, entry, token) {
  const msgEl = card.querySelector('.gb-entry-msg');
  if (!msgEl || card.classList.contains('gb-editing')) return;
  card.classList.add('gb-editing');

  const original = String(entry.message || '');
  msgEl.innerHTML = `
<textarea class="gb-inline-edit" maxlength="200">${original}</textarea>
<div class="gb-inline-actions">
  <button class="btn btn-primary gb-save-btn"   style="font-size:0.75rem;padding:0.3rem 0.9rem">Save</button>
  <button class="btn btn-ghost   gb-cancel-btn" style="font-size:0.75rem;padding:0.3rem 0.9rem">Cancel</button>
</div>`;

  const ta = msgEl.querySelector('.gb-inline-edit');
  ta.focus();
  ta.selectionStart = ta.selectionEnd = ta.value.length;

  msgEl.querySelector('.gb-cancel-btn').addEventListener('click', () => {
    card.classList.remove('gb-editing');
    msgEl.innerHTML = sanitize(original.slice(0, 600));
  });
  msgEl.querySelector('.gb-save-btn').addEventListener('click', () =>
    gbSaveEdit(card, entry, token, ta.value.trim())
  );
}

async function gbSaveEdit(card, entry, token, newMsg) {
  if (!newMsg) return;
  const saveBtn = card.querySelector('.gb-save-btn');
  if (saveBtn) { saveBtn.textContent = 'Saving…'; saveBtn.disabled = true; }

  try {
    const res  = await fetch(`${API_URL}/${entry.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token, message: newMsg }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Save failed (' + res.status + ')');

    entry.message   = data.message;
    entry.edited_at = data.edited_at;
    card.classList.remove('gb-editing');
    card.querySelector('.gb-entry-msg').textContent = data.message;

    const meta = card.querySelector('.gb-entry-meta');
    if (meta) {
      let editedEl = meta.querySelector('.gb-edited');
      const str    = new Date(data.edited_at).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      if (!editedEl) {
        editedEl = document.createElement('span');
        editedEl.className = 'gb-edited';
        const dateEl = meta.querySelector('.gb-entry-date');
        if (dateEl) dateEl.after(editedEl);
      }
      editedEl.title       = 'Edited ' + str;
      editedEl.textContent = '(edited)';
    }

  } catch (err) {
    if (saveBtn) { saveBtn.textContent = 'Retry'; saveBtn.disabled = false; }
    const msgEl = card.querySelector('.gb-entry-msg');
    if (msgEl && !msgEl.querySelector('.gb-inline-err')) {
      const e = document.createElement('div');
      e.className   = 'gb-inline-err';
      e.textContent = '! ' + err.message;
      msgEl.appendChild(e);
    }
  }
}

// ── Delete ────────────────────────────────────────────────────────────────

async function gbDelete(card, id, token) {
  if (!confirm("Delete your entry? This can't be undone.")) return;
  const delBtn = card.querySelector('.gb-delete-btn');
  if (delBtn) { delBtn.disabled = true; delBtn.textContent = '…'; }

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Delete failed (' + res.status + ')');
    }
    card.style.transition = 'opacity 0.3s, transform 0.3s';
    card.style.opacity    = '0';
    card.style.transform  = 'translateX(-20px)';
    setTimeout(() => card.remove(), 320);

    const t = gbGetTokens();
    delete t[id];
    localStorage.setItem('snow_gb_tokens', JSON.stringify(t));

  } catch (err) {
    alert('Could not delete: ' + err.message);
    if (delBtn) { delBtn.disabled = false; delBtn.textContent = '✕'; }
  }
}

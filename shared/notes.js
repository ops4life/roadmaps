/**
 * notes.js — highlight & notes system for guide pages.
 * Call initNotes('.guide-content', '/guides/slug/') after DOM is ready.
 */
function initNotes(guideSelector, guideUrl) {
  var STORAGE_KEY = 'roadmap_guide_notes';
  var guideEl = document.querySelector(guideSelector);
  if (!guideEl) return function () {};

  function loadNotes() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveNotes(notes) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); }
    catch (e) {}
  }
  function addNote(note) { var n = loadNotes(); n.push(note); saveNotes(n); }
  function deleteNote(id) {
    saveNotes(loadNotes().filter(function (n) { return n.id !== id; }));
    var mark = document.querySelector('mark.text-highlight[data-note-id="' + id + '"]');
    if (mark) {
      var parent = mark.parentNode;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      mark.remove();
    }
    renderPanel();
  }

  var tooltip = null;
  var pendingRange = null;
  var pendingText = null;
  var anchorRect = null;

  var TRANSLATE_LANGS = [
    { code: 'vi', label: 'Vietnamese' },
    { code: 'zh-CN', label: 'Chinese (Simplified)' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'ru', label: 'Russian' },
    { code: 'ar', label: 'Arabic' },
    { code: 'hi', label: 'Hindi' },
    { code: 'th', label: 'Thai' },
    { code: 'id', label: 'Indonesian' },
  ];
  var LAST_LANG_KEY = 'roadmap_guide_translate_lang';
  function getSavedLang() { return localStorage.getItem(LAST_LANG_KEY) || 'vi'; }

  function translateText(text, targetLang, resultEl, btnEl) {
    resultEl.textContent = '';
    resultEl.className = 'hl-translate-result hl-translate-loading';
    resultEl.textContent = 'Translating\u2026';
    if (btnEl) btnEl.disabled = true;
    var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' +
      encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(text);
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var result = (data[0] || []).map(function (s) { return s[0] || ''; }).join('');
        resultEl.className = 'hl-translate-result';
        resultEl.textContent = result || '(no result)';
      })
      .catch(function () {
        resultEl.className = 'hl-translate-result hl-translate-error';
        resultEl.textContent = 'Translation failed. Check your connection.';
      })
      .finally(function () { if (btnEl) btnEl.disabled = false; repositionTooltip(); });
  }

  function buildTooltip() {
    var el = document.createElement('div');
    el.className = 'hl-tooltip';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Highlight options');
    var langOptions = TRANSLATE_LANGS.map(function (l) {
      return '<option value="' + l.code + '">' + l.label + '</option>';
    }).join('');
    el.innerHTML =
      '<div class="hl-tooltip-actions">' +
        '<button class="hl-btn hl-btn-highlight" title="Highlight text"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 2.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L17.5 2.5z"/></svg> Highlight</button>' +
        '<button class="hl-btn hl-btn-note" title="Add a note"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Note</button>' +
        '<button class="hl-btn hl-btn-translate" title="Translate"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg> Translate</button>' +
        '<button class="hl-btn hl-btn-ai" title="Search with Google AI"><img src="/assets/ai.png" width="16" height="16" alt="AI" style="display:block;"></button>' +
        '<button class="hl-close" aria-label="Close">&#x2715;</button>' +
      '</div>' +
      '<div class="hl-tooltip-expand">' +
        '<textarea class="hl-textarea" placeholder="Add a note\u2026 (optional)" rows="3"></textarea>' +
        '<div class="hl-expand-actions"><button class="hl-btn hl-btn-save">Save</button><button class="hl-btn hl-btn-cancel">Cancel</button></div>' +
      '</div>' +
      '<div class="hl-tooltip-translate-panel">' +
        '<div class="hl-translate-controls"><select class="hl-lang-select">' + langOptions + '</select><button class="hl-btn hl-btn-do-translate">Go</button></div>' +
        '<div class="hl-translate-result" aria-live="polite"></div>' +
      '</div>' +
      '';
    document.body.appendChild(el);
    el.querySelector('.hl-btn-highlight').addEventListener('click', function () { commitHighlight(''); });
    el.querySelector('.hl-btn-note').addEventListener('click', function () {
      el.querySelector('.hl-tooltip-translate-panel').style.display = 'none';
      el.querySelector('.hl-tooltip-expand').style.display = 'flex';
      el.querySelector('.hl-textarea').focus();
      repositionTooltip();
    });
    el.querySelector('.hl-btn-translate').addEventListener('click', function () {
      el.querySelector('.hl-tooltip-expand').style.display = 'none';
      var panel = el.querySelector('.hl-tooltip-translate-panel');
      panel.style.display = 'flex';
      var select = el.querySelector('.hl-lang-select');
      var lang = getSavedLang();
      select.value = lang;
      translateText(pendingText, lang, el.querySelector('.hl-translate-result'), el.querySelector('.hl-btn-do-translate'));
      repositionTooltip();
    });
    el.querySelector('.hl-lang-select').addEventListener('change', function () { localStorage.setItem(LAST_LANG_KEY, this.value); });
    el.querySelector('.hl-btn-do-translate').addEventListener('click', function () {
      var lang = el.querySelector('.hl-lang-select').value;
      translateText(pendingText, lang, el.querySelector('.hl-translate-result'), el.querySelector('.hl-btn-do-translate'));
      repositionTooltip();
    });
    el.querySelector('.hl-btn-ai').addEventListener('click', function () {
      var t = pendingText || '';
      var q = t;
      var url = 'https://www.google.com/search?q=' + encodeURIComponent(q) + '&udm=50';
      var popW = 700, popH = 640;
      var selRect = anchorRect || {};
      var elLeft = typeof selRect.right === 'number' ? selRect.right : 0;
      var elTop  = typeof selRect.top  === 'number' ? selRect.top  : 0;
      var screenLeft = (window.screenX || window.screenLeft || 0) + window.outerWidth - window.innerWidth;
      var screenTop  = (window.screenY || window.screenTop  || 0) + (window.outerHeight - window.innerHeight);
      var left = Math.round(screenLeft + elLeft + 12);
      var top  = Math.round(screenTop  + elTop);
      if (left + popW > screen.width)  left = Math.max(0, screen.width  - popW - 8);
      if (top  + popH > screen.height) top  = Math.max(0, screen.height - popH - 8);
      window.open(url, 'notes-ai-search', 'width=' + popW + ',height=' + popH + ',left=' + left + ',top=' + top + ',resizable=yes,scrollbars=yes');
      hideTooltip();
    });
    el.querySelector('.hl-close').addEventListener('click', hideTooltip);
    el.querySelector('.hl-btn-cancel').addEventListener('click', hideTooltip);
    el.querySelector('.hl-btn-save').addEventListener('click', function () {
      commitHighlight(el.querySelector('.hl-textarea').value.trim());
    });
    el.querySelector('.hl-textarea').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) commitHighlight(el.querySelector('.hl-textarea').value.trim());
      if (e.key === 'Escape') hideTooltip();
    });
    return el;
  }

  function showTooltip(rect) {
    if (!tooltip) tooltip = buildTooltip();
    anchorRect = rect;
    tooltip.querySelector('.hl-tooltip-expand').style.display = 'none';
    tooltip.querySelector('.hl-textarea').value = '';
    tooltip.querySelector('.hl-tooltip-translate-panel').style.display = 'none';
    tooltip.classList.remove('hl-tooltip-below');
    tooltip.style.visibility = 'hidden';
    tooltip.classList.add('visible');
    requestAnimationFrame(function () { positionTooltip(rect); tooltip.style.visibility = ''; });
  }

  function positionTooltip(rect) {
    var OFFSET = 10;
    var ttW = tooltip.offsetWidth || 280;
    var ttH = tooltip.offsetHeight || 44;
    var left = rect.left + rect.width / 2 - ttW / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - ttW - 8));
    var top;
    if (rect.top - ttH - OFFSET >= 4) {
      top = rect.top - ttH - OFFSET;
      tooltip.classList.remove('hl-tooltip-below');
    } else {
      top = rect.bottom + OFFSET;
      tooltip.classList.add('hl-tooltip-below');
    }
    tooltip.style.left = left + 'px';
    tooltip.style.top = Math.max(4, top) + 'px';
  }

  function repositionTooltip() { if (anchorRect) positionTooltip(anchorRect); }

  function hideTooltip() {
    if (tooltip) {
      tooltip.classList.remove('visible');
      tooltip.querySelector('.hl-tooltip-expand').style.display = 'none';
      tooltip.querySelector('.hl-tooltip-translate-panel').style.display = 'none';
    }
    pendingRange = null; pendingText = null; anchorRect = null;
  }

  function commitHighlight(noteText) {
    if (!pendingRange || !pendingText) return;
    var id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    var container = pendingRange.commonAncestorContainer;
    var fullText = container.textContent || container.nodeValue || '';
    var idx = fullText.indexOf(pendingText);
    var anchorStart = Math.max(0, idx - 30);
    var anchorText = fullText.slice(anchorStart, anchorStart + pendingText.length + 60);
    var mark = applyMark(pendingRange, id, noteText);
    if (mark) {
      addNote({ id: id, guideUrl: guideUrl, selectedText: pendingText, anchorText: anchorText, noteText: noteText, timestamp: Date.now() });
      mark.addEventListener('click', function () { showNotePopover(mark, id); });
    }
    hideTooltip();
    window.getSelection().removeAllRanges();
    renderPanel();
  }

  function applyMark(range, id, noteText) {
    var mark = document.createElement('mark');
    mark.className = 'text-highlight';
    mark.dataset.noteId = id;
    if (noteText) mark.title = noteText;
    try {
      range.surroundContents(mark);
      return mark;
    } catch (e) {
      try {
        var frag = range.extractContents();
        mark.appendChild(frag);
        range.insertNode(mark);
        return mark;
      } catch (e2) {
        if (mark.parentNode) mark.parentNode.removeChild(mark);
        return null;
      }
    }
  }

  function collectTextNodes(root) {
    var nodes = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentNode;
        while (p && p !== root) {
          if (p.tagName === 'MARK' || p.tagName === 'CODE' || p.tagName === 'PRE' ||
              (p.classList && p.classList.contains('code-block'))) return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }

  function applyOne(textNodes, note) {
    var sel = note.selectedText;
    if (!sel) return;
    for (var i = 0; i < textNodes.length; i++) {
      var node = textNodes[i];
      var val = node.nodeValue;
      var idx = val.indexOf(sel);
      if (idx === -1) continue;
      var mark = document.createElement('mark');
      mark.className = 'text-highlight';
      mark.dataset.noteId = note.id;
      if (note.noteText) mark.title = note.noteText;
      mark.textContent = sel;
      var parent = node.parentNode;
      if (idx > 0) parent.insertBefore(document.createTextNode(val.slice(0, idx)), node);
      parent.insertBefore(mark, node);
      var remaining = val.slice(idx + sel.length);
      if (remaining) { var tail = document.createTextNode(remaining); parent.insertBefore(tail, node); textNodes[i] = tail; }
      else textNodes.splice(i, 1);
      parent.removeChild(node);
      (function (m, id) { m.addEventListener('click', function () { showNotePopover(m, id); }); }(mark, note.id));
      return;
    }
  }

  function applyHighlights() {
    var notes = loadNotes().filter(function (n) { return n.guideUrl === guideUrl; });
    if (!notes.length) return;
    var textNodes = collectTextNodes(guideEl);
    notes.forEach(function (n) { applyOne(textNodes, n); });
  }

  var popover = null;
  function escHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function truncate(s, max) { return s.length > max ? s.slice(0, max) + '\u2026' : s; }
  function slugToTitle(url) {
    return (url || '').replace(/^\/guides\//, '').replace(/\/$/, '').split('-')
      .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
  }

  function showNotePopover(markEl, id) {
    hidePopover();
    var notes = loadNotes();
    var note = notes.find(function (n) { return n.id === id; });
    if (!note) return;
    popover = document.createElement('div');
    popover.className = 'hl-popover';
    popover.innerHTML =
      '<div class="hl-popover-header"><span class="hl-popover-label">Highlight</span><button class="hl-close" aria-label="Close">&#x2715;</button></div>' +
      '<blockquote class="hl-popover-quote">' + escHtml(truncate(note.selectedText, 140)) + '</blockquote>' +
      (note.noteText ? '<p class="hl-popover-note">' + escHtml(note.noteText) + '</p>' : '<p class="hl-popover-note hl-popover-empty">No note added.</p>') +
      '<button class="hl-delete-btn">&#x2715; Delete highlight</button>';
    document.body.appendChild(popover);
    popover.style.visibility = 'hidden';
    popover.classList.add('visible');
    requestAnimationFrame(function () {
      var rect = markEl.getBoundingClientRect();
      var pw = popover.offsetWidth || 280;
      var left = Math.max(8, Math.min(rect.left + rect.width / 2 - pw / 2, window.innerWidth - pw - 8));
      popover.style.left = left + 'px';
      popover.style.top = (rect.bottom + 8) + 'px';
      popover.style.visibility = '';
    });
    popover.querySelector('.hl-close').addEventListener('click', hidePopover);
    popover.querySelector('.hl-delete-btn').addEventListener('click', function () { hidePopover(); deleteNote(id); });
  }
  function hidePopover() { if (popover) { popover.remove(); popover = null; } }

  var panel = null;
  var panelToggle = null;
  var activeTab = 'guide';

  function noteItemHTML(n) {
    return '<div class="note-item" data-id="' + n.id + '">' +
      '<blockquote class="note-item-quote">' + escHtml(truncate(n.selectedText, 120)) + '</blockquote>' +
      (n.noteText ? '<p class="note-item-text">' + escHtml(n.noteText) + '</p>' : '') +
      '<div class="note-item-footer"><span class="note-item-time">' + formatDate(n.timestamp) + '</span>' +
      '<button class="note-item-delete" data-id="' + n.id + '" aria-label="Delete highlight">Delete</button></div>' +
      '</div>';
  }

  function attachDeleteHandlers(body) {
    body.querySelectorAll('.note-item-delete').forEach(function (btn) {
      btn.addEventListener('click', function () { deleteNote(btn.dataset.id); });
    });
  }

  function buildPanel() {
    panel = document.createElement('div');
    panel.className = 'notes-panel';
    panel.setAttribute('role', 'complementary');
    panel.setAttribute('aria-label', 'My notes');
    panel.innerHTML =
      '<div class="notes-panel-header"><span class="notes-panel-title">My Notes</span><button class="notes-panel-close" aria-label="Close">&#x2715;</button></div>' +
      '<div class="notes-panel-tabs">' +
        '<button class="notes-tab active" data-tab="guide">This Guide</button>' +
        '<button class="notes-tab" data-tab="all">All Guides</button>' +
      '</div>' +
      '<div class="notes-panel-body"></div>';
    document.body.appendChild(panel);

    panel.querySelector('.notes-panel-close').addEventListener('click', function () {
      panel.classList.remove('open');
      panelToggle.setAttribute('aria-expanded', 'false');
    });

    panel.querySelectorAll('.notes-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        activeTab = tab.dataset.tab;
        panel.querySelectorAll('.notes-tab').forEach(function (t) {
          t.classList.toggle('active', t.dataset.tab === activeTab);
        });
        renderPanel();
      });
    });

    document.addEventListener('mousedown', function (e) {
      if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== panelToggle && !panelToggle.contains(e.target)) {
        panel.classList.remove('open');
        panelToggle.setAttribute('aria-expanded', 'false');
      }
    });

    panelToggle = document.createElement('button');
    panelToggle.className = 'notes-panel-toggle';
    panelToggle.setAttribute('aria-label', 'Toggle notes panel');
    panelToggle.setAttribute('aria-expanded', 'false');
    panelToggle.title = 'My Notes';
    panelToggle.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' +
      '<span class="notes-toggle-label">Notes</span>' +
      '<span class="notes-toggle-count" aria-live="polite"></span>';
    document.body.appendChild(panelToggle);

    panelToggle.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('open');
      panelToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen) renderPanel();
    });
  }

  function formatDate(ts) { return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }

  function renderPanel() {
    if (!panel) return;
    var body = panel.querySelector('.notes-panel-body');
    var allNotes = loadNotes();
    var guideNotes = allNotes.filter(function (n) { return n.guideUrl === guideUrl; });

    var countEl = panelToggle ? panelToggle.querySelector('.notes-toggle-count') : null;
    if (countEl) countEl.textContent = guideNotes.length ? guideNotes.length : '';

    // Update tab labels with counts
    var tabGuide = panel.querySelector('[data-tab="guide"]');
    var tabAll   = panel.querySelector('[data-tab="all"]');
    if (tabGuide) tabGuide.textContent = 'This Guide' + (guideNotes.length ? ' (' + guideNotes.length + ')' : '');
    if (tabAll)   tabAll.textContent   = 'All Guides' + (allNotes.length   ? ' (' + allNotes.length   + ')' : '');

    if (activeTab === 'guide') {
      if (!guideNotes.length) {
        body.innerHTML = '<div class="notes-empty"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><p>No highlights yet.</p><p>Select any text in the guide to highlight it.</p></div>';
        return;
      }
      body.innerHTML = guideNotes.slice().reverse().map(noteItemHTML).join('');
      attachDeleteHandlers(body);
      return;
    }

    // All Guides tab
    if (!allNotes.length) {
      body.innerHTML = '<div class="notes-empty"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><p>No highlights across any guide yet.</p></div>';
      return;
    }

    // Group by guideUrl, preserving insertion order (most recent first)
    var groups = {};
    var order = [];
    allNotes.slice().reverse().forEach(function (n) {
      if (!groups[n.guideUrl]) { groups[n.guideUrl] = []; order.push(n.guideUrl); }
      groups[n.guideUrl].push(n);
    });

    body.innerHTML = order.map(function (url) {
      var isCurrent = url === guideUrl;
      var title = slugToTitle(url);
      return '<div class="notes-guide-group">' +
        '<a class="notes-guide-label" href="' + url + '">' +
          title + (isCurrent ? ' <span class="notes-guide-current">\u2190 here</span>' : '') +
        '</a>' +
        groups[url].map(noteItemHTML).join('') +
      '</div>';
    }).join('');
    attachDeleteHandlers(body);
  }

  function isInsideGuide(node) {
    var el = node.nodeType === 3 ? node.parentNode : node;
    while (el) { if (el === guideEl) return true; el = el.parentNode; }
    return false;
  }

  function isInsideCodeBlock(node) {
    var el = node.nodeType === 3 ? node.parentNode : node;
    while (el && el !== guideEl) {
      if (el.classList && (el.classList.contains('code-block') || el.tagName === 'CODE' || el.tagName === 'PRE')) return true;
      el = el.parentNode;
    }
    return false;
  }

  function onPointerUp(e) {
    if (tooltip && tooltip.contains(e.target)) return;
    if (popover && popover.contains(e.target)) return;
    setTimeout(function () {
      var sel = window.getSelection();
      var text = sel ? sel.toString().trim() : '';
      if (!text || !sel.rangeCount) { hideTooltip(); return; }
      var range = sel.getRangeAt(0);
      if (!isInsideGuide(range.commonAncestorContainer)) { hideTooltip(); return; }
      if (isInsideCodeBlock(range.commonAncestorContainer)) { hideTooltip(); return; }
      if (range.commonAncestorContainer.nodeType !== 3 &&
          range.commonAncestorContainer.querySelector && range.commonAncestorContainer.querySelector('mark.text-highlight')) { hideTooltip(); return; }
      pendingRange = range.cloneRange();
      pendingText = text;
      showTooltip(range.getBoundingClientRect());
    }, 20);
  }

  var onMouseDown = function (e) {
    if (tooltip && !tooltip.contains(e.target)) hideTooltip();
    if (popover && !popover.contains(e.target) && !e.target.closest('mark.text-highlight')) hidePopover();
  };
  var onScroll = function () { if (tooltip && tooltip.classList.contains('visible')) hideTooltip(); };

  document.addEventListener('mouseup', onPointerUp);
  document.addEventListener('touchend', onPointerUp);
  document.addEventListener('mousedown', onMouseDown);
  window.addEventListener('scroll', onScroll, { passive: true });

  applyHighlights();
  buildPanel();
  renderPanel();

  return function cleanup() {
    document.removeEventListener('mouseup', onPointerUp);
    document.removeEventListener('touchend', onPointerUp);
    document.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('scroll', onScroll);
    if (tooltip) { tooltip.remove(); tooltip = null; }
    if (popover) { popover.remove(); popover = null; }
    if (panel) { panel.remove(); panel = null; }
    if (panelToggle) { panelToggle.remove(); panelToggle = null; }
  };
}

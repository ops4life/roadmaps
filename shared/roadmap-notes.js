// ─── NOTES & HIGHLIGHTS ─────────────────────────────────────────────────────
// Text-selection tooltip on #panel-desc: highlight, note, and Google AI-mode
// search — mirrors the systemdesign/learnmlops notes.js pattern, adapted for
// the roadmap's single dynamic detail panel instead of static guide prose.
(function () {
  var NOTES_KEY = "roadmap_notes";
  var pageKey = typeof PAGE_KEY !== "undefined" ? PAGE_KEY : "roadmap";
  var pageLabel = typeof PAGE_LABEL !== "undefined" ? PAGE_LABEL : "Roadmap";

  function loadNotes() {
    try {
      return JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveNotes(notes) {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }
  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function formatDate(ts) {
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  // ── Description rendering with stored highlights ──────────────────────────
  function renderDesc(item) {
    var descEl = document.getElementById("panel-desc");
    if (!descEl) return;
    var text = item.description || "";
    var notes = loadNotes().filter(function (n) {
      return n.page === pageKey && n.itemId === item.id;
    });
    if (!notes.length) {
      descEl.textContent = text;
      return;
    }
    var html = escHtml(text);
    notes.forEach(function (n) {
      var needle = escHtml(n.text);
      if (!needle) return;
      var idx = html.indexOf(needle);
      if (idx === -1) return;
      var wrapped = '<mark class="rm-highlight" data-note-id="' + n.id + '">' + needle + "</mark>";
      html = html.slice(0, idx) + wrapped + html.slice(idx + needle.length);
    });
    descEl.innerHTML = html;
  }

  var origOpenPanel = window.openPanel;
  if (typeof origOpenPanel === "function") {
    window.openPanel = function (item) {
      origOpenPanel(item);
      renderDesc(item);
    };
  }

  // ── Selection tooltip ──────────────────────────────────────────────────────
  var tooltip, pendingText;

  function buildTooltip() {
    var el = document.createElement("div");
    el.className = "rm-hl-tooltip";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Highlight options");
    el.innerHTML =
      '<div class="rm-hl-actions">' +
      '<button class="rm-hl-btn rm-hl-highlight" type="button">✏️ Highlight</button>' +
      '<button class="rm-hl-btn rm-hl-note" type="button">📝 Note</button>' +
      '<button class="rm-hl-btn rm-hl-ai" type="button">🔍 AI Search</button>' +
      '<button class="rm-hl-close" type="button" aria-label="Close">✕</button>' +
      "</div>" +
      '<div class="rm-hl-expand" style="display:none">' +
      '<textarea class="rm-hl-textarea" placeholder="Add a note…" rows="3"></textarea>' +
      '<button class="rm-hl-btn rm-hl-save" type="button">Save</button>' +
      "</div>";
    document.body.appendChild(el);

    el.querySelector(".rm-hl-highlight").addEventListener("click", function () {
      commitNote("");
    });
    el.querySelector(".rm-hl-note").addEventListener("click", function () {
      el.querySelector(".rm-hl-expand").style.display = "flex";
      el.querySelector(".rm-hl-textarea").focus();
    });
    el.querySelector(".rm-hl-save").addEventListener("click", function () {
      commitNote(el.querySelector(".rm-hl-textarea").value.trim());
    });
    el.querySelector(".rm-hl-ai").addEventListener("click", function () {
      var q = pageLabel + ": " + pendingText;
      var url = "https://www.google.com/search?q=" + encodeURIComponent(q) + "&udm=50";
      window.open(url, "rm-ai-search", "width=700,height=640,resizable=yes,scrollbars=yes");
      hideTooltip();
    });
    el.querySelector(".rm-hl-close").addEventListener("click", hideTooltip);
    return el;
  }

  function commitNote(noteText) {
    if (!pendingText) return;
    var notes = loadNotes();
    notes.push({
      id: "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      page: pageKey,
      pageLabel: pageLabel,
      itemId: typeof currentItem !== "undefined" && currentItem ? currentItem.id : null,
      itemLabel: typeof currentItem !== "undefined" && currentItem ? currentItem.label : "",
      text: pendingText,
      note: noteText || "",
      createdAt: Date.now(),
    });
    saveNotes(notes);
    if (typeof currentItem !== "undefined" && currentItem) renderDesc(currentItem);
    updateNotesCount();
    hideTooltip();
  }

  function showTooltip(rect) {
    if (!tooltip) tooltip = buildTooltip();
    tooltip.querySelector(".rm-hl-expand").style.display = "none";
    tooltip.querySelector(".rm-hl-textarea").value = "";
    tooltip.classList.add("open");
    var top = rect.top - tooltip.offsetHeight - 8;
    var left = rect.left;
    if (top < 8) top = rect.bottom + 8;
    var maxLeft = window.innerWidth - tooltip.offsetWidth - 8;
    if (left > maxLeft) left = Math.max(8, maxLeft);
    tooltip.style.top = top + window.scrollY + "px";
    tooltip.style.left = left + window.scrollX + "px";
  }

  function hideTooltip() {
    if (tooltip) tooltip.classList.remove("open");
    pendingText = null;
  }

  document.addEventListener("mouseup", function (e) {
    var descEl = document.getElementById("panel-desc");
    if (!descEl || !descEl.contains(e.target)) {
      if (tooltip && !tooltip.contains(e.target)) hideTooltip();
      return;
    }
    setTimeout(function () {
      var sel = window.getSelection();
      var text = sel && sel.toString().trim();
      if (!text || text.length < 2) {
        hideTooltip();
        return;
      }
      pendingText = text;
      showTooltip(sel.getRangeAt(0).getBoundingClientRect());
    }, 0);
  });

  // ── Notes panel ──────────────────────────────────────────────────────────
  function updateNotesCount() {
    var btn = document.getElementById("notes-panel-toggle");
    if (!btn) return;
    var count = loadNotes().filter(function (n) {
      return n.page === pageKey;
    }).length;
    btn.querySelector(".notes-toggle-count").textContent = count ? "(" + count + ")" : "";
  }

  function noteItemHTML(n) {
    return (
      '<div class="rm-note-item" data-id="' + n.id + '">' +
      '<p class="rm-note-item-quote">“' + escHtml(n.text) + "”</p>" +
      (n.note ? '<p class="rm-note-item-text">' + escHtml(n.note) + "</p>" : "") +
      '<div class="rm-note-item-footer">' +
      '<span class="rm-note-item-time">' + escHtml(n.itemLabel || "") + " · " + formatDate(n.createdAt) + "</span>" +
      '<button class="rm-note-item-delete" type="button">Delete</button>' +
      "</div>" +
      "</div>"
    );
  }

  function renderNotesPanel() {
    var body = document.getElementById("rm-notes-panel-body");
    if (!body) return;
    var activeTab = document.querySelector(".rm-notes-tab.active");
    var scope = activeTab ? activeTab.dataset.tab : "page";
    var notes = loadNotes().sort(function (a, b) {
      return b.createdAt - a.createdAt;
    });
    if (scope === "page") notes = notes.filter(function (n) { return n.page === pageKey; });

    if (!notes.length) {
      body.innerHTML =
        '<p class="rm-notes-empty">No notes yet. Select text in an item’s description to highlight or add a note.</p>';
      return;
    }

    if (scope === "page") {
      body.innerHTML = notes.map(noteItemHTML).join("");
    } else {
      var groups = {};
      notes.forEach(function (n) {
        var g = (groups[n.page] = groups[n.page] || { label: n.pageLabel || n.page, items: [] });
        g.items.push(n);
      });
      body.innerHTML = Object.keys(groups)
        .map(function (p) {
          return (
            '<div class="rm-notes-group">' +
            '<div class="rm-notes-group-label">' + escHtml(groups[p].label) + "</div>" +
            groups[p].items.map(noteItemHTML).join("") +
            "</div>"
          );
        })
        .join("");
    }

    body.querySelectorAll(".rm-note-item-delete").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.closest(".rm-note-item").dataset.id;
        saveNotes(loadNotes().filter(function (n) { return n.id !== id; }));
        renderNotesPanel();
        updateNotesCount();
        if (typeof currentItem !== "undefined" && currentItem) renderDesc(currentItem);
      });
    });
  }

  function initNotesPanel() {
    if (document.getElementById("notes-panel-toggle")) return;

    var toggle = document.createElement("button");
    toggle.id = "notes-panel-toggle";
    toggle.className = "notes-panel-toggle";
    toggle.type = "button";
    toggle.innerHTML = '📝 Notes <span class="notes-toggle-count"></span>';

    var feedbackBtn = document.getElementById("feedback-btn");
    if (feedbackBtn && feedbackBtn.parentNode) {
      feedbackBtn.parentNode.insertBefore(toggle, feedbackBtn);
    } else {
      document.body.appendChild(toggle);
    }

    var panel = document.createElement("div");
    panel.id = "rm-notes-panel";
    panel.className = "rm-notes-panel";
    panel.innerHTML =
      '<div class="rm-notes-panel-header">' +
      '<span class="rm-notes-panel-title">Notes &amp; Highlights</span>' +
      '<button class="rm-notes-panel-close" type="button" aria-label="Close">✕</button>' +
      "</div>" +
      '<div class="rm-notes-panel-tabs">' +
      '<button class="rm-notes-tab active" data-tab="page">This Roadmap</button>' +
      '<button class="rm-notes-tab" data-tab="all">All Roadmaps</button>' +
      "</div>" +
      '<div class="rm-notes-panel-body" id="rm-notes-panel-body"></div>';
    document.body.appendChild(panel);

    toggle.addEventListener("click", function () {
      panel.classList.add("open");
      renderNotesPanel();
    });
    panel.querySelector(".rm-notes-panel-close").addEventListener("click", function () {
      panel.classList.remove("open");
    });
    panel.querySelectorAll(".rm-notes-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        panel.querySelectorAll(".rm-notes-tab").forEach(function (t) {
          t.classList.remove("active");
        });
        tab.classList.add("active");
        renderNotesPanel();
      });
    });

    updateNotesCount();
  }

  initNotesPanel();
})();

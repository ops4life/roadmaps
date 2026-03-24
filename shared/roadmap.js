let progress = {};
let currentItem = null;
let listViewMode = false;

function loadProgress() {
  try {
    progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    progress = {};
  }
}
function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// ─── RENDER ────────────────────────────────────────────────────────────────
function render() {
  loadProgress();
  const canvas = document.getElementById("rm-canvas");
  // Remove old columns (keep svg)
  Array.from(canvas.querySelectorAll(".rm-column")).forEach((el) =>
    el.remove(),
  );

  ROADMAP.forEach((section) => {
    const col = document.createElement("div");
    col.className = "rm-column";
    col.dataset.section = section.id;

    const hdr = document.createElement("div");
    hdr.className = "rm-col-header";
    hdr.innerHTML = `<span class="rm-col-num">${section.num}</span>${section.title}`;
    col.appendChild(hdr);

    section.items.forEach((item) => {
      const status = progress[item.id];
      const node = document.createElement("div");
      node.className = `rm-node ${item.type}${status ? " status-" + status : ""}`;
      node.dataset.id = item.id;
      node.dataset.label = item.label.toLowerCase();
      node.innerHTML = `
  <div class="rm-node-label">
    ${status ? `<span class="status-dot ${status}"></span>` : ""}
    ${item.label}
  </div>
  <div class="rm-node-sub">${item.type === "recommended" ? "Recommended" : "Alternative"}</div>
`;
      node.addEventListener("click", () => openPanel(item));
      col.appendChild(node);
    });

    canvas.appendChild(col);
  });

  updateStats();
  setTimeout(drawConnectors, 50);
  initFeedback();
}

// ─── STATS ─────────────────────────────────────────────────────────────────
function updateStats() {
  let total = 0,
    done = 0,
    learning = 0;
  ROADMAP.forEach((s) =>
    s.items.forEach((item) => {
      total++;
      if (progress[item.id] === "done") done++;
      else if (progress[item.id] === "learning") learning++;
    }),
  );
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-done").textContent = done;
  document.getElementById("stat-learning").textContent = learning;
  document.getElementById("stat-pct").textContent = pct + "%";
  document.getElementById("progress-bar").style.width = pct + "%";
}

// ─── SVG CONNECTORS ────────────────────────────────────────────────────────
function drawConnectors() {
  const svg = document.getElementById("rm-connectors");
  const wrap = document.getElementById("canvas-wrap");
  const canvas = document.getElementById("rm-canvas");
  if (listViewMode) {
    svg.innerHTML = "";
    return;
  }

  svg.setAttribute("width", canvas.scrollWidth);
  svg.setAttribute("height", canvas.scrollHeight);

  const cols = Array.from(canvas.querySelectorAll(".rm-column"));
  if (cols.length < 2) return;

  const wrapRect = canvas.getBoundingClientRect();

  let paths = "";
  for (let i = 0; i < cols.length - 1; i++) {
    const a = cols[i].querySelector(".rm-col-header");
    const b = cols[i + 1].querySelector(".rm-col-header");
    if (!a || !b) continue;
    const ar = a.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    const x1 = ar.right - wrapRect.left;
    const y1 = ar.top + ar.height / 2 - wrapRect.top;
    const x2 = br.left - wrapRect.left;
    const y2 = br.top + br.height / 2 - wrapRect.top;
    const cx = (x1 + x2) / 2;
    paths += `<path d="M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}"/>`;
  }
  svg.innerHTML = paths;
}

const ro = new ResizeObserver(() => drawConnectors());
ro.observe(document.getElementById("rm-canvas"));

// ─── PANEL ─────────────────────────────────────────────────────────────────
function openPanel(item) {
  currentItem = item;
  document.getElementById("panel-title").textContent = item.label;

  const badge = document.getElementById("panel-badge");
  badge.textContent =
    item.type === "recommended" ? "Recommended" : "Alternative";
  badge.className =
    "panel-type-badge " +
    (item.type === "recommended" ? "type-recommended" : "type-alt");

  document.getElementById("panel-desc").textContent = item.description;

  // Concepts
  const conSec = document.getElementById("panel-concepts-sec");
  const conWrap = document.getElementById("panel-concepts");
  if (item.concepts && item.concepts.length) {
    conWrap.innerHTML = item.concepts
      .map((c) => `<span class="chip">${c}</span>`)
      .join("");
    conSec.style.display = "";
  } else {
    conSec.style.display = "none";
  }

  // Tools
  const toolSec = document.getElementById("panel-tools-sec");
  const toolWrap = document.getElementById("panel-tools");
  if (item.tools && item.tools.length) {
    toolWrap.innerHTML = item.tools
      .map((t) => `<div class="tool-item"><a href="https://www.google.com/search?q=${encodeURIComponent(t)}&udm=50" target="_blank" rel="noopener noreferrer">${t}</a></div>`)
      .join("");
    toolSec.style.display = "";
  } else {
    toolSec.style.display = "none";
  }

  // Resources
  const resSec = document.getElementById("panel-resources-sec");
  const resWrap = document.getElementById("panel-resources");
  if (item.resources && item.resources.length) {
    resWrap.innerHTML = item.resources
      .map(
        (r) =>
          `<a class="res-item" href="${r.url}" target="_blank" rel="noopener">${r.label}</a>`,
      )
      .join("");
    resSec.style.display = "";
  } else {
    resSec.style.display = "none";
  }

  // Tip
  const tipSec = document.getElementById("panel-tip-sec");
  const tipEl = document.getElementById("panel-tip");
  if (item.tip) {
    tipEl.textContent = item.tip;
    tipSec.style.display = "";
  } else {
    tipSec.style.display = "none";
  }

  updateActionButtons();

  document.getElementById("detail-overlay").classList.add("open");
  document.getElementById("detail-panel").classList.add("open");
}

function closePanel() {
  document.getElementById("detail-overlay").classList.remove("open");
  document.getElementById("detail-panel").classList.remove("open");
  currentItem = null;
}

function updateActionButtons() {
  if (!currentItem) return;
  const status = progress[currentItem.id];
  document.getElementById("btn-learning").className =
    "btn-action" + (status === "learning" ? " learning-active" : "");
  document.getElementById("btn-done").className =
    "btn-action" + (status === "done" ? " done-active" : "");
}

function markStatus(status) {
  if (!currentItem) return;
  if (status === null) {
    delete progress[currentItem.id];
  } else {
    progress[currentItem.id] = status;
  }
  saveProgress();
  updateActionButtons();

  // Update node in DOM
  const node = document.querySelector(
    `.rm-node[data-id="${currentItem.id}"]`,
  );
  if (node) {
    node.classList.remove("status-learning", "status-done");
    if (status) node.classList.add("status-" + status);
    const label = node.querySelector(".rm-node-label");
    const existing = label.querySelector(".status-dot");
    if (existing) existing.remove();
    if (status) {
      const dot = document.createElement("span");
      dot.className = "status-dot " + status;
      label.prepend(dot);
    }
  }

  updateStats();
}

// ─── SEARCH ────────────────────────────────────────────────────────────────
function handleSearch(q) {
  const term = q.toLowerCase().trim();
  document.querySelectorAll(".rm-node").forEach((node) => {
    if (!term) {
      node.classList.remove("faded");
    } else {
      const label = node.dataset.label || "";
      node.classList.toggle("faded", !label.includes(term));
    }
  });
}

// ─── RESET ─────────────────────────────────────────────────────────────────
function resetAll() {
  if (!confirm("Reset all progress? This cannot be undone.")) return;
  progress = {};
  saveProgress();
  document.querySelectorAll(".rm-node").forEach((node) => {
    node.classList.remove("status-learning", "status-done");
    const dot = node.querySelector(".status-dot");
    if (dot) dot.remove();
  });
  updateStats();
  if (currentItem) updateActionButtons();
}

// ─── LIST VIEW ─────────────────────────────────────────────────────────────
function toggleView() {
  listViewMode = !listViewMode;
  const canvas = document.getElementById("rm-canvas");
  const btn = document.getElementById("toggle-view-btn");
  canvas.classList.toggle("list-view", listViewMode);
  btn.textContent = listViewMode ? "Grid View" : "List View";
  btn.classList.toggle("active", listViewMode);
  drawConnectors();
}

// ─── SCROLL REDRAW ─────────────────────────────────────────────────────────
document
  .getElementById("canvas-wrap")
  .addEventListener("scroll", drawConnectors);

// ─── RESPONSIVE ────────────────────────────────────────────────────────────
function initResponsive() {
  const shouldList = window.innerWidth < 768;
  if (shouldList !== listViewMode) {
    listViewMode = shouldList;
    const canvas = document.getElementById("rm-canvas");
    const btn = document.getElementById("toggle-view-btn");
    canvas.classList.toggle("list-view", listViewMode);
    btn.textContent = listViewMode ? "Grid View" : "List View";
    btn.classList.toggle("active", listViewMode);
    drawConnectors();
  }
}

// Debounced resize
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initResponsive, 150);
});

// ─── FEEDBACK ──────────────────────────────────────────────────────────────
function initFeedback() {
  if (document.getElementById("feedback-btn")) return; // already injected

  const btn = document.createElement("button");
  btn.id = "feedback-btn";
  btn.className = "btn feedback-btn";
  btn.textContent = "Feedback";
  const toggleBtn = document.getElementById("toggle-view-btn");
  if (toggleBtn && toggleBtn.parentNode) {
    toggleBtn.parentNode.insertBefore(btn, toggleBtn);
  } else {
    document.body.appendChild(btn);
  }

  const overlay = document.createElement("div");
  overlay.id = "feedback-overlay";
  overlay.className = "feedback-overlay";
  overlay.innerHTML = `
    <div class="feedback-modal">
      <div class="feedback-modal-header">
        <span class="feedback-modal-title">Send Feedback</span>
        <button class="feedback-close" id="feedback-close-btn" aria-label="Close">✕</button>
      </div>
      <p class="feedback-modal-sub">Pick a type — GitHub will open in a new tab.</p>
      <div class="feedback-grid">
        <a href="https://github.com/ops4life/spark/issues/new?template=bug.yml&labels=roadmap,bug"
           target="_blank" rel="noopener noreferrer" class="feedback-card">
          <span class="feedback-card-icon">🐛</span>
          <div class="feedback-card-label">Bug Report</div>
          <div class="feedback-card-sub">Something is broken or wrong</div>
        </a>
        <a href="https://github.com/ops4life/spark/issues/new?template=idea.yml&labels=roadmap,idea"
           target="_blank" rel="noopener noreferrer" class="feedback-card">
          <span class="feedback-card-icon">💡</span>
          <div class="feedback-card-label">Idea</div>
          <div class="feedback-card-sub">Suggest a new capability</div>
        </a>
        <a href="https://github.com/ops4life/spark/discussions"
           target="_blank" rel="noopener noreferrer" class="feedback-card">
          <span class="feedback-card-icon">💬</span>
          <div class="feedback-card-label">Discussions</div>
          <div class="feedback-card-sub">Thoughts or suggestions</div>
        </a>
        <a href="https://github.com/ops4life/spark/issues/new?template=question.yml&labels=roadmap,question"
           target="_blank" rel="noopener noreferrer" class="feedback-card">
          <span class="feedback-card-icon">❓</span>
          <div class="feedback-card-label">Question</div>
          <div class="feedback-card-sub">Something else entirely</div>
        </a>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  btn.addEventListener("click", () => overlay.classList.add("open"));
  document.getElementById("feedback-close-btn").addEventListener("click", () => overlay.classList.remove("open"));
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("open"); });
}

// ─── INIT ──────────────────────────────────────────────────────────────────
render();
initResponsive();

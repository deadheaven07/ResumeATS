/**
 * GLOBAL COMMAND PALETTE (Cmd+K / Ctrl+K)
 * Fast keyboard-driven switcher across tabs, actions, and tools.
 */

export function setupCommandPalette({ onSelectAction }) {
  const modal = document.getElementById("command-palette-modal");
  const input = document.getElementById("cmd-palette-input");
  const list = document.getElementById("cmd-palette-list");

  if (!modal || !input || !list) return;

  const actions = [
    { id: "tab_ats", title: "Go to: ATS & Resume Matcher", category: "Navigation", icon: "⚡", shortcut: "1" },
    { id: "tab_google", title: "Go to: Google Careers & Leveling Copilot", category: "Navigation", icon: "🇬", shortcut: "2" },
    { id: "tab_amazon", title: "Go to: Amazon Bar Raiser & Leadership Principles", category: "Navigation", icon: "📦", shortcut: "3" },
    { id: "tab_humanizer", title: "Go to: Anti-AI Humanizer", category: "Navigation", icon: "🛡️", shortcut: "4" },
    { id: "tab_linkedin", title: "Go to: LinkedIn Hook Engine", category: "Navigation", icon: "🚀", shortcut: "5" },
    { id: "tab_profile", title: "Go to: Profile Conversion Optimizer", category: "Navigation", icon: "👤", shortcut: "6" },
    { id: "tab_tracker", title: "Go to: Application Tracker (Kanban)", category: "Navigation", icon: "📋", shortcut: "7" },
    { id: "tab_interview", title: "Go to: AI Interview Prep Coach", category: "Navigation", icon: "🎯", shortcut: "8" },

    { id: "action_run_ats", title: "Run: ATS Gap Analysis", category: "Actions", icon: "⚡", shortcut: "↵" },
    { id: "action_run_google", title: "Run: Google Profile Audit", category: "Actions", icon: "🇬", shortcut: "↵" },
    { id: "action_run_amazon", title: "Run: Amazon Bar Raiser Audit", category: "Actions", icon: "📦", shortcut: "↵" },
    { id: "action_toggle_theme", title: "Action: Toggle Light / Dark Mode", category: "Actions", icon: "🌓", shortcut: "T" },
    { id: "action_print_pdf", title: "Action: Print / Export ATS Resume to PDF", category: "Actions", icon: "🖨️", shortcut: "P" },
    { id: "action_add_job", title: "Action: Add New Job Application", category: "Actions", icon: "➕", shortcut: "N" }
  ];

  let selectedIndex = 0;
  let filteredActions = [...actions];

  function openPalette() {
    modal.classList.add("active");
    input.value = "";
    selectedIndex = 0;
    filterActions("");
    setTimeout(() => input.focus(), 50);
  }

  function closePalette() {
    modal.classList.remove("active");
  }

  function renderList() {
    list.innerHTML = "";
    if (filteredActions.length === 0) {
      list.innerHTML = `<div class="cmd-palette-empty">No matching commands found.</div>`;
      return;
    }

    filteredActions.forEach((action, idx) => {
      const item = document.createElement("div");
      item.className = `cmd-palette-item ${idx === selectedIndex ? "selected" : ""}`;
      item.setAttribute("data-id", action.id);
      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <span style="font-size:1.1rem;">${action.icon}</span>
          <span style="font-weight:600; font-size:0.86rem; color:var(--text-heading);">${action.title}</span>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span class="badge badge-neutral" style="font-size:0.68rem;">${action.category}</span>
          ${action.shortcut ? `<kbd class="cmd-kbd">${action.shortcut}</kbd>` : ""}
        </div>
      `;

      item.addEventListener("click", () => {
        executeAction(action.id);
      });

      list.appendChild(item);
    });

    const selectedEl = list.querySelector(".cmd-palette-item.selected");
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "nearest" });
    }
  }

  function filterActions(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      filteredActions = [...actions];
    } else {
      filteredActions = actions.filter(a => 
        a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
      );
    }
    selectedIndex = 0;
    renderList();
  }

  function executeAction(actionId) {
    closePalette();
    if (onSelectAction) {
      onSelectAction(actionId);
    }
  }

  // Keyboard navigation inside palette
  input.addEventListener("input", (e) => {
    filterActions(e.target.value);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % Math.max(1, filteredActions.length);
      renderList();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + filteredActions.length) % Math.max(1, filteredActions.length);
      renderList();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        executeAction(filteredActions[selectedIndex].id);
      }
    } else if (e.key === "Escape") {
      closePalette();
    }
  });

  // Global keydown for Cmd+K / Ctrl+K
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (modal.classList.contains("active")) {
        closePalette();
      } else {
        openPalette();
      }
    } else if (e.key === "Escape" && modal.classList.contains("active")) {
      closePalette();
    }
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closePalette();
  });

  // Trigger button in header if present
  const btnHeaderTrigger = document.getElementById("btn-cmd-palette-trigger");
  if (btnHeaderTrigger) {
    btnHeaderTrigger.addEventListener("click", openPalette);
  }

  renderList();
}

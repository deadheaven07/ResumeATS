/**
 * RESUMETRACKER: AUDIT HISTORY CONTROLLER
 * Manages ATS audit versioning, historical progression comparison, and snapshot restore.
 */

import { storageService } from '../services/storage-service.js';
import { appStore } from '../services/state-manager.js';

export class HistoryController {
  constructor() {
    this.modal = null;
    this.selectedForComparison = [];
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.modal = document.getElementById('audit-history-modal');
    if (!this.modal) return;

    this.bindEvents();
    this.initialized = true;
  }

  bindEvents() {
    // Open trigger
    document.querySelectorAll('[data-action="open-history"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    // Close triggers
    this.modal.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Clear history button
    const clearBtn = document.getElementById('btn-clear-audit-history');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.handleClearHistory());
    }

    // Compare trigger
    const compareBtn = document.getElementById('btn-run-audit-comparison');
    if (compareBtn) {
      compareBtn.addEventListener('click', () => this.renderComparisonDiff());
    }
  }

  open() {
    this.selectedForComparison = [];
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    this.renderHistoryList();
    this.hideComparisonDiff();
  }

  close() {
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  renderHistoryList() {
    const listContainer = document.getElementById('audit-history-list');
    if (!listContainer) return;

    const audits = storageService.getAudits();
    if (audits.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state-card" style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 2rem; margin-bottom: 12px;">📊</div>
          <h4 style="margin-bottom: 6px; font-weight: 600;">No Saved Audits Yet</h4>
          <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 360px; margin: 0 auto 16px;">
            Run an ATS match on your resume and click <strong>"Save Audit Snapshot"</strong> to track your progress and compare iterations over time.
          </p>
        </div>
      `;
      return;
    }

    let html = `
      <div class="table-responsive">
        <table class="audit-history-table">
          <thead>
            <tr>
              <th style="width: 40px;">Select</th>
              <th>Date & Time</th>
              <th>Target Role / Snippet</th>
              <th>Score</th>
              <th>Confidence</th>
              <th>Gaps</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
    `;

    audits.forEach((audit) => {
      const date = new Date(audit.timestamp).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const scoreBadgeClass = audit.score >= 80 ? 'badge-success' : audit.score >= 60 ? 'badge-warning' : 'badge-danger';
      const confLevel = audit.confidence?.level || 'Moderate';
      const confBadgeClass = confLevel === 'High' ? 'badge-cyan' : confLevel === 'Low' ? 'badge-neutral' : 'badge-purple';
      const roleSnippet = audit.targetRole || (audit.jdSnippet ? audit.jdSnippet.slice(0, 32) + '...' : 'General Evaluation');

      html += `
        <tr data-audit-id="${audit.id}">
          <td>
            <input type="checkbox" class="audit-compare-checkbox" data-id="${audit.id}" aria-label="Select audit for comparison">
          </td>
          <td style="font-size: 0.85rem; color: var(--text-secondary); white-space: nowrap;">
            ${date}
          </td>
          <td>
            <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">${this.escapeHtml(roleSnippet)}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${audit.matchedSkillsCount || 0} matched · ${audit.missingSkillsCount || 0} missing</div>
          </td>
          <td>
            <span class="badge ${scoreBadgeClass}" style="font-weight: 700; font-size: 0.88rem;">${audit.score}%</span>
          </td>
          <td>
            <span class="badge ${confBadgeClass}" style="font-size: 0.75rem;">${confLevel}</span>
          </td>
          <td style="font-size: 0.85rem;">
            ${audit.missingSkillsCount > 0 
              ? `<span style="color: var(--danger-color); font-weight: 500;">${audit.missingSkillsCount} skill gaps</span>`
              : `<span style="color: var(--success-color); font-weight: 500;">Zero gaps</span>`
            }
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <button class="btn btn-xs btn-outline-primary btn-restore-audit" data-id="${audit.id}" title="Restore text into editor">
              <i class="fas fa-undo-alt"></i> Restore
            </button>
            <button class="btn btn-xs btn-outline-danger btn-delete-audit" data-id="${audit.id}" title="Delete snapshot" style="margin-left: 6px;">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    listContainer.innerHTML = html;

    // Attach event listeners for row actions
    listContainer.querySelectorAll('.btn-restore-audit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.restoreAudit(id);
      });
    });

    listContainer.querySelectorAll('.btn-delete-audit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.deleteAudit(id);
      });
    });

    listContainer.querySelectorAll('.audit-compare-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        if (e.target.checked) {
          if (this.selectedForComparison.length >= 2) {
            e.target.checked = false;
            if (window.showToast) window.showToast('You can compare up to 2 audits at once.', 'warning');
            return;
          }
          this.selectedForComparison.push(id);
        } else {
          this.selectedForComparison = this.selectedForComparison.filter(x => x !== id);
        }
        this.updateComparisonToolbar();
      });
    });

    this.updateComparisonToolbar();
  }

  updateComparisonToolbar() {
    const compareBar = document.getElementById('audit-comparison-toolbar');
    const countEl = document.getElementById('compare-selected-count');
    const compareBtn = document.getElementById('btn-run-audit-comparison');

    if (!compareBar) return;

    if (this.selectedForComparison.length > 0) {
      compareBar.style.display = 'flex';
      if (countEl) countEl.textContent = `${this.selectedForComparison.length} of 2 selected`;
      if (compareBtn) compareBtn.disabled = this.selectedForComparison.length !== 2;
    } else {
      compareBar.style.display = 'none';
    }
  }

  renderComparisonDiff() {
    if (this.selectedForComparison.length !== 2) return;

    const audits = storageService.getAudits();
    const auditA = audits.find(a => a.id === this.selectedForComparison[0]);
    const auditB = audits.find(a => a.id === this.selectedForComparison[1]);

    if (!auditA || !auditB) return;

    // Order older -> newer based on timestamp
    const [older, newer] = [auditA, auditB].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const diffContainer = document.getElementById('audit-comparison-diff-view');
    if (!diffContainer) return;

    const deltaScore = newer.score - older.score;
    const deltaColor = deltaScore > 0 ? 'var(--success-color)' : deltaScore < 0 ? 'var(--danger-color)' : 'var(--text-secondary)';
    const deltaSign = deltaScore > 0 ? `+${deltaScore}%` : `${deltaScore}%`;

    const olderMissing = new Set((older.missingSkills || []).map(s => (s.canonical || s).toLowerCase()));
    const newerMissing = new Set((newer.missingSkills || []).map(s => (s.canonical || s).toLowerCase()));

    // Skills resolved (in older missing but not in newer missing)
    const resolvedSkills = [...olderMissing].filter(x => !newerMissing.has(x));

    diffContainer.innerHTML = `
      <div class="comparison-diff-card" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h4 style="margin: 0; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-balance-scale" style="color: var(--primary-accent);"></i> Comparative Progression Analysis
          </h4>
          <button class="btn btn-xs btn-ghost" id="btn-close-comparison-diff" style="font-size: 0.85rem;">
            <i class="fas fa-times"></i> Close Diff
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: center; margin-bottom: 20px; text-align: center;">
          <div style="background: var(--card-bg); padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">Baseline (${new Date(older.timestamp).toLocaleDateString()})</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary);">${older.score}%</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${older.matchedSkillsCount || 0} matched · ${older.missingSkillsCount || 0} gaps</div>
          </div>

          <div style="font-size: 1.4rem; font-weight: 800; color: ${deltaColor}; padding: 0 12px;">
            <i class="fas ${deltaScore >= 0 ? 'fa-arrow-right' : 'fa-arrow-down'}"></i>
            <div>${deltaSign}</div>
          </div>

          <div style="background: var(--card-bg); padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">Current (${new Date(newer.timestamp).toLocaleDateString()})</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary);">${newer.score}%</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${newer.matchedSkillsCount || 0} matched · ${newer.missingSkillsCount || 0} gaps</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <h5 style="font-size: 0.85rem; font-weight: 600; color: var(--success-color); margin-bottom: 8px;">
              <i class="fas fa-check-circle"></i> Skills Added / Resolved (${resolvedSkills.length})
            </h5>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${resolvedSkills.length > 0 
                ? resolvedSkills.map(s => `<span class="badge badge-success" style="font-size: 0.78rem;">+ ${this.escapeHtml(s)}</span>`).join('')
                : '<span style="font-size: 0.82rem; color: var(--text-muted);">No previously missing skills were resolved in this iteration.</span>'
              }
            </div>
          </div>
          <div>
            <h5 style="font-size: 0.85rem; font-weight: 600; color: var(--warning-color); margin-bottom: 8px;">
              <i class="fas fa-exclamation-triangle"></i> Remaining Keyword Gaps (${newerMissing.size})
            </h5>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${newerMissing.size > 0 
                ? [...newerMissing].slice(0, 8).map(s => `<span class="badge badge-warning" style="font-size: 0.78rem;">${this.escapeHtml(s)}</span>`).join('')
                : '<span style="font-size: 0.82rem; color: var(--text-muted);">Zero gaps remaining!</span>'
              }
            </div>
          </div>
        </div>
      </div>
    `;

    diffContainer.style.display = 'block';

    const closeDiffBtn = document.getElementById('btn-close-comparison-diff');
    if (closeDiffBtn) {
      closeDiffBtn.addEventListener('click', () => this.hideComparisonDiff());
    }
  }

  hideComparisonDiff() {
    const diffContainer = document.getElementById('audit-comparison-diff-view');
    if (diffContainer) diffContainer.style.display = 'none';
  }

  restoreAudit(id) {
    const audits = storageService.getAudits();
    const audit = audits.find(a => a.id === id);
    if (!audit) return;

    const resumeEl = document.getElementById('ats-resume-input') || document.getElementById('resume-text');
    const jdEl = document.getElementById('ats-jd-input') || document.getElementById('job-desc-text');

    if (audit.resumeText && resumeEl) {
      resumeEl.value = audit.resumeText;
      resumeEl.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (audit.jdText && jdEl) {
      jdEl.value = audit.jdText;
      jdEl.dispatchEvent(new Event('input', { bubbles: true }));
    }

    this.close();

    // Trigger match computation
    const matchBtn = document.getElementById('btn-run-ats') || document.getElementById('btn-analyze-match');
    if (matchBtn) matchBtn.click();

    if (window.showToast) {
      window.showToast(`Snapshot from ${new Date(audit.timestamp).toLocaleDateString()} restored into editor!`, 'success');
    }
  }

  deleteAudit(id) {
    storageService.deleteAudit(id);
    this.selectedForComparison = this.selectedForComparison.filter(x => x !== id);
    this.renderHistoryList();
    if (window.showToast) {
      window.showToast('Audit snapshot removed.', 'info');
    }
  }

  handleClearHistory() {
    const confirmed = confirm('Clear all saved audit history? This action cannot be undone.');
    if (!confirmed) return;

    storageService.clearAudits();
    this.selectedForComparison = [];
    this.renderHistoryList();
    this.hideComparisonDiff();
    if (window.showToast) {
      window.showToast('Audit history cleared.', 'info');
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
}

export const historyController = new HistoryController();

if (typeof window !== 'undefined') {
  window.historyController = historyController;
}

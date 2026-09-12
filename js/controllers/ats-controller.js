/**
 * RESUMETRACKER: ATS CONTROLLER
 * Manages Multi-Resume Profiles, Score Explainer Decompositions, and Audit Snapshot Saving.
 */

import { storageService } from '../services/storage-service.js';
import { appStore } from '../services/state-manager.js';

export class AtsController {
  constructor() {
    this.explainerModal = null;
    this.currentMatchResult = null;
    this.saveTimeout = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    this.explainerModal = document.getElementById('score-explainer-modal');
    this.renderProfileSelector();
    this.bindEvents();
    this.initialized = true;
  }

  bindEvents() {
    // Profile selector change
    const profileSelect = document.getElementById('profile-selector-dropdown');
    if (profileSelect) {
      profileSelect.addEventListener('change', (e) => {
        const id = e.target.value;
        if (id === '__create_new__') {
          this.handleCreateNewProfile();
        } else {
          this.switchProfile(id);
        }
      });
    }

    // Profile action buttons
    const btnNewProfile = document.getElementById('btn-new-profile');
    if (btnNewProfile) {
      btnNewProfile.addEventListener('click', () => this.handleCreateNewProfile());
    }

    const btnDuplicateProfile = document.getElementById('btn-duplicate-profile');
    if (btnDuplicateProfile) {
      btnDuplicateProfile.addEventListener('click', () => this.handleDuplicateProfile());
    }

    const btnDeleteProfile = document.getElementById('btn-delete-profile');
    if (btnDeleteProfile) {
      btnDeleteProfile.addEventListener('click', () => this.handleDeleteProfile());
    }

    // Auto-save resume edits into active profile (debounced 500ms)
    const resumeTextarea = document.getElementById('ats-resume-input') || document.getElementById('resume-text');
    if (resumeTextarea) {
      resumeTextarea.addEventListener('input', () => {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
          this.persistActiveResumeText(resumeTextarea.value);
        }, 500);
      });
    }

    // Save Audit Snapshot Button
    const saveAuditBtn = document.getElementById('btn-save-audit-snapshot');
    if (saveAuditBtn) {
      saveAuditBtn.addEventListener('click', () => this.handleSaveAudit());
    }

    // Explainer Modal open trigger
    document.querySelectorAll('[data-action="open-score-explainer"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openExplainerModal();
      });
    });

    // Explainer Modal close triggers
    if (this.explainerModal) {
      this.explainerModal.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => this.closeExplainerModal());
      });
      this.explainerModal.addEventListener('click', (e) => {
        if (e.target === this.explainerModal) this.closeExplainerModal();
      });
    }
  }

  renderProfileSelector() {
    const selector = document.getElementById('profile-selector-dropdown');
    if (!selector) return;

    const profiles = storageService.getProfiles();
    const active = storageService.getActiveProfile();

    selector.innerHTML = `
      ${profiles.map(p => `
        <option value="${p.id}" ${p.id === active.id ? 'selected' : ''}>
          ${p.name || 'Untitled Profile'} (${p.targetRole || 'General'})
        </option>
      `).join('')}
      <option value="__create_new__" style="color: var(--primary-accent); font-weight: 600;">+ Add New Resume Profile...</option>
    `;

    // Also update profile badge / role indicator in UI if exists
    const roleBadge = document.getElementById('current-profile-role-badge');
    if (roleBadge) {
      roleBadge.textContent = active.targetRole || 'General Resume';
    }
  }

  switchProfile(profileId) {
    const success = storageService.setActiveProfileId(profileId);
    if (!success) return;

    const active = storageService.getActiveProfile();
    const resumeTextarea = document.getElementById('ats-resume-input') || document.getElementById('resume-text');

    if (resumeTextarea && active) {
      resumeTextarea.value = active.resumeText || '';
      resumeTextarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    this.renderProfileSelector();

    // Trigger match computation if JD has text
    const jdTextarea = document.getElementById('ats-jd-input') || document.getElementById('job-desc-text');
    if (jdTextarea && jdTextarea.value.trim()) {
      const matchBtn = document.getElementById('btn-run-ats') || document.getElementById('btn-analyze-match');
      if (matchBtn) matchBtn.click();
    }

    if (window.showToast) {
      window.showToast(`Switched active profile to "${active.name}"`, 'info');
    }
  }

  handleCreateNewProfile() {
    const name = prompt('Enter a name for this new Resume Profile (e.g., "Full-Stack Tech Lead", "Cloud Architect"):');
    if (!name || !name.trim()) {
      this.renderProfileSelector();
      return;
    }

    const targetRole = prompt('What is the target job title / specialty? (e.g., "Staff Engineer"):', name) || '';

    const currentResume = (document.getElementById('ats-resume-input') || document.getElementById('resume-text'))?.value || '';
    const newProfile = storageService.createProfile({
      name: name.trim(),
      targetRole: targetRole.trim(),
      resumeText: currentResume
    });

    this.switchProfile(newProfile.id);
    if (window.showToast) {
      window.showToast(`Created profile "${newProfile.name}"!`, 'success');
    }
  }

  handleDuplicateProfile() {
    const active = storageService.getActiveProfile();
    const currentResume = (document.getElementById('ats-resume-input') || document.getElementById('resume-text'))?.value || active.resumeText || '';

    const dup = storageService.createProfile({
      name: `${active.name} (Copy)`,
      targetRole: active.targetRole || '',
      resumeText: currentResume
    });

    this.switchProfile(dup.id);
    if (window.showToast) {
      window.showToast(`Duplicated profile as "${dup.name}"!`, 'success');
    }
  }

  handleDeleteProfile() {
    const active = storageService.getActiveProfile();
    const profiles = storageService.getProfiles();

    if (profiles.length <= 1) {
      alert('You cannot delete your only remaining resume profile.');
      return;
    }

    const confirmed = confirm(`Are you sure you want to permanently delete profile "${active.name}"?`);
    if (!confirmed) return;

    storageService.deleteProfile(active.id);
    this.renderProfileSelector();

    const newActive = storageService.getActiveProfile();
    const resumeTextarea = document.getElementById('ats-resume-input') || document.getElementById('resume-text');
    if (resumeTextarea && newActive) {
      resumeTextarea.value = newActive.resumeText || '';
      resumeTextarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (window.showToast) {
      window.showToast(`Profile "${active.name}" deleted.`, 'info');
    }
  }

  persistActiveResumeText(text) {
    const active = storageService.getActiveProfile();
    if (!active) return;

    storageService.updateProfile(active.id, {
      resumeText: text
    });
  }

  setMatchResult(result) {
    this.currentMatchResult = result;
    this.updateConfidenceBadge(result?.confidence);
  }

  updateConfidenceBadge(confidence) {
    const badgeEl = document.getElementById('ats-confidence-badge');
    if (!badgeEl) return;

    if (!confidence) {
      badgeEl.style.display = 'none';
      return;
    }

    badgeEl.style.display = 'inline-flex';
    badgeEl.className = `badge ${confidence.level === 'High' ? 'badge-cyan' : confidence.level === 'Low' ? 'badge-neutral' : 'badge-purple'}`;
    badgeEl.innerHTML = `<i class="fas fa-shield-alt" style="margin-right: 4px;"></i> ${confidence.level} Confidence (${confidence.score}%)`;
    badgeEl.title = confidence.explanation;
  }

  openExplainerModal() {
    if (!this.explainerModal) return;
    this.renderExplainerContent();
    this.explainerModal.classList.add('active');
    this.explainerModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  closeExplainerModal() {
    if (!this.explainerModal) return;
    this.explainerModal.classList.remove('active');
    this.explainerModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  renderExplainerContent() {
    const container = document.getElementById('score-explainer-content');
    if (!container) return;

    const result = this.currentMatchResult;
    if (!result || !result.breakdown) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 2.2rem; margin-bottom: 12px;">🎯</div>
          <h4 style="font-weight: 700; margin-bottom: 6px;">No Active ATS Evaluation</h4>
          <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 380px; margin: 0 auto;">
            Paste your resume and target job description in the ATS Matcher and click "Analyze Match" to see the full 4-pillar mathematical decomposition.
          </p>
        </div>
      `;
      return;
    }

    const { breakdown, confidence, score } = result;
    const pillars = breakdown.pillars || [];
    const recommendations = breakdown.recommendations || [];

    let html = `
      <div class="explainer-overview-card" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Composite ATS Score</div>
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--primary-accent); line-height: 1.1;">
              ${score}% <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-secondary);">/ 100% Total Potential</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">Predictive Confidence</div>
            <span class="badge ${confidence?.level === 'High' ? 'badge-cyan' : confidence?.level === 'Low' ? 'badge-neutral' : 'badge-purple'}" style="font-weight: 600; font-size: 0.85rem;">
              <i class="fas fa-check-double"></i> ${confidence?.level || 'Moderate'} (${confidence?.score || 75}%)
            </span>
          </div>
        </div>
        <div style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 12px; line-height: 1.5; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
          ${breakdown.summaryExplanation || ''}
        </div>
        ${confidence?.explanation ? `
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 6px; font-style: italic;">
            <i class="fas fa-info-circle"></i> ${confidence.explanation}
          </div>
        ` : ''}
      </div>

      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-columns" style="color: var(--primary-accent);"></i> Mathematical Pillars Breakdown
      </h4>

      <div class="pillars-grid" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
        ${pillars.map(p => {
          const isPenalty = p.id === 'ai_slop_penalty';
          const pct = isPenalty 
            ? (p.earned < 0 ? Math.min(Math.abs(p.earned) / 15 * 100, 100) : 0)
            : Math.min((p.earned / p.max) * 100, 100);

          const barColor = isPenalty
            ? (p.earned < 0 ? 'var(--danger-color)' : 'var(--success-color)')
            : (pct >= 75 ? 'var(--success-color)' : pct >= 50 ? 'var(--warning-color)' : 'var(--danger-color)');

          return `
            <div class="pillar-row" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 14px 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <div style="font-weight: 600; font-size: 0.92rem; color: var(--text-primary);">${p.name}</div>
                <div style="font-weight: 700; font-size: 0.92rem; color: ${barColor};">
                  ${isPenalty ? (p.earned === 0 ? '0 pts penalty' : `${p.earned} pts`) : `${p.earned} / ${p.max} pts`}
                  <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 400;">(${p.weight})</span>
                </div>
              </div>
              <div class="progress-bar-track" style="height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
                <div style="height: 100%; width: ${isPenalty ? (p.earned < 0 ? pct : 0) : pct}%; background: ${barColor}; border-radius: 3px; transition: width 0.4s ease;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary);">
                <span>${p.description}</span>
                <span class="badge ${p.status === 'Optimal' || p.status === 'Clean Human Tone' ? 'badge-success' : 'badge-warning'}" style="font-size: 0.72rem;">
                  ${p.status}
                </span>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      ${recommendations.length > 0 ? `
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-lightbulb" style="color: var(--warning-color);"></i> Algorithmic Score Optimization Roadmap
        </h4>
        <div class="recommendations-box" style="background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.25); border-radius: 10px; padding: 14px 18px;">
          <ul style="margin: 0; padding-left: 18px; font-size: 0.88rem; color: var(--text-primary); line-height: 1.6;">
            ${recommendations.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    `;

    container.innerHTML = html;
  }

  handleSaveAudit() {
    if (!this.currentMatchResult) {
      alert('Please analyze a resume and job description first before saving an audit snapshot.');
      return;
    }

    const resumeText = (document.getElementById('ats-resume-input') || document.getElementById('resume-text'))?.value || '';
    const jdText = (document.getElementById('ats-jd-input') || document.getElementById('job-desc-text'))?.value || '';
    const active = storageService.getActiveProfile();

    const auditData = {
      profileId: active?.id || 'prof_default',
      targetRole: active?.targetRole || 'Software Engineer',
      score: this.currentMatchResult.score,
      confidence: this.currentMatchResult.confidence,
      breakdown: this.currentMatchResult.breakdown,
      matchedSkillsCount: this.currentMatchResult.matchedSkills?.length || 0,
      missingSkillsCount: this.currentMatchResult.missingSkills?.length || 0,
      matchedSkills: this.currentMatchResult.matchedSkills || [],
      missingSkills: this.currentMatchResult.missingSkills || [],
      jdSnippet: jdText.slice(0, 100),
      resumeText,
      jdText
    };

    const saved = storageService.saveAudit(auditData);

    if (window.showToast) {
      window.showToast(`Audit snapshot #${saved.id.slice(-4)} saved! View in History comparison.`, 'success');
    }

    // Play click sound if available
    if (window.audioEngine?.play) {
      window.audioEngine.play('success');
    }
  }
}

export const atsController = new AtsController();

if (typeof window !== 'undefined') {
  window.atsController = atsController;
}

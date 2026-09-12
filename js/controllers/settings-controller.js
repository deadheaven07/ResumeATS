/**
 * RESUMETRACKER: SETTINGS CONTROLLER
 * Manages the 3-tab modal for Career Goals, Data Backup/Export, and Privacy/AI Configuration.
 */

import { storageService } from '../services/storage-service.js';
import { appStore } from '../services/state-manager.js';

export class SettingsController {
  constructor() {
    this.modal = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.modal = document.getElementById('settings-modal');
    if (!this.modal) return;

    this.bindEvents();
    this.syncFormFromStorage();
    this.initialized = true;
  }

  bindEvents() {
    // Open modal triggers
    document.querySelectorAll('[data-action="open-settings"], #btn-open-settings').forEach(btn => {
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

    // Tab switching
    const tabs = this.modal.querySelectorAll('.settings-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const targetId = tab.getAttribute('data-target');
        this.modal.querySelectorAll('.settings-tab-pane').forEach(pane => {
          pane.classList.remove('active');
        });
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    // Form Save
    const saveBtn = document.getElementById('btn-save-settings');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveSettingsFromForm();
      });
    }

    // Export Backup JSON
    const exportBtn = document.getElementById('btn-export-backup');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.handleExportBackup();
      });
    }

    // Import Backup JSON
    const importInput = document.getElementById('input-import-backup');
    const importBtn = document.getElementById('btn-import-backup-trigger');
    if (importBtn && importInput) {
      importBtn.addEventListener('click', () => importInput.click());
      importInput.addEventListener('change', (e) => this.handleImportBackup(e));
    }

    // Reset All Data
    const resetBtn = document.getElementById('btn-reset-all-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.handleResetData());
    }
  }

  open() {
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    this.syncFormFromStorage();
    this.updateStorageStats();
  }

  close() {
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  syncFormFromStorage() {
    const settings = storageService.getSettings();
    const roleInput = document.getElementById('setting-target-role');
    const salaryInput = document.getElementById('setting-target-salary');
    const currencyInput = document.getElementById('setting-currency');
    const workModelInput = document.getElementById('setting-work-model');
    const minThresholdInput = document.getElementById('setting-min-threshold');
    const apiKeyInput = document.getElementById('setting-gemini-key');
    const offlineOnlyInput = document.getElementById('setting-offline-only');
    const soundFxInput = document.getElementById('setting-sound-fx');

    if (roleInput) roleInput.value = settings.targetRole || '';
    if (salaryInput) salaryInput.value = settings.targetSalary || '';
    if (currencyInput) currencyInput.value = settings.currency || 'USD';
    if (workModelInput) workModelInput.value = settings.workModel || 'Remote';
    if (minThresholdInput) minThresholdInput.value = settings.minThreshold || 75;
    if (apiKeyInput) apiKeyInput.value = settings.geminiApiKey || '';
    if (offlineOnlyInput) offlineOnlyInput.checked = !!settings.offlineOnly;
    if (soundFxInput) soundFxInput.checked = settings.soundFx !== false;
  }

  saveSettingsFromForm() {
    const current = storageService.getSettings();
    const updated = {
      ...current,
      targetRole: document.getElementById('setting-target-role')?.value.trim() || '',
      targetSalary: document.getElementById('setting-target-salary')?.value.trim() || '',
      currency: document.getElementById('setting-currency')?.value || 'USD',
      workModel: document.getElementById('setting-work-model')?.value || 'Remote',
      minThreshold: parseInt(document.getElementById('setting-min-threshold')?.value, 10) || 75,
      geminiApiKey: document.getElementById('setting-gemini-key')?.value.trim() || '',
      offlineOnly: !!document.getElementById('setting-offline-only')?.checked,
      soundFx: !!document.getElementById('setting-sound-fx')?.checked
    };

    storageService.saveSettings(updated);
    appStore.setState({ settings: updated });

    if (window.showToast) {
      window.showToast('Settings saved successfully!', 'success');
    }
    this.close();
  }

  updateStorageStats() {
    const profiles = storageService.getProfiles();
    const audits = storageService.getAudits();
    const trackerJobs = storageService.getApplications();

    const statsProfileEl = document.getElementById('stat-profile-count');
    const statsAuditEl = document.getElementById('stat-audit-count');
    const statsJobsEl = document.getElementById('stat-job-count');
    const statsBytesEl = document.getElementById('stat-storage-bytes');

    if (statsProfileEl) statsProfileEl.textContent = profiles.length;
    if (statsAuditEl) statsAuditEl.textContent = audits.length;
    if (statsJobsEl) statsJobsEl.textContent = trackerJobs.length;

    let totalBytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('resumetracker_')) {
          totalBytes += (localStorage.getItem(k) || '').length * 2;
        }
      }
    } catch (_) {}

    if (statsBytesEl) {
      const kb = (totalBytes / 1024).toFixed(1);
      statsBytesEl.textContent = `${kb} KB (100% Local / Zero Server Leakage)`;
    }
  }

  handleExportBackup() {
    const jsonStr = storageService.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `resumetracker-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.showToast) {
      window.showToast('Backup JSON exported successfully!', 'success');
    }
  }

  async handleImportBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = storageService.importBackupJson(text);
      if (success) {
        if (window.showToast) {
          window.showToast('Backup restored successfully! Reloading...', 'success');
        }
        setTimeout(() => window.location.reload(), 800);
      } else {
        throw new Error('Corrupted or invalid JSON schema.');
      }
    } catch (err) {
      alert('Failed to import backup: ' + err.message);
    } finally {
      event.target.value = '';
    }
  }

  handleResetData() {
    const confirmed = confirm(
      'Are you sure you want to reset all data? This will permanently delete all custom profiles, audit histories, and tracked applications. Your default profile will be refreshed.'
    );
    if (!confirmed) return;

    storageService.resetAllData();
    if (window.showToast) {
      window.showToast('Workspace reset to clean default state.', 'info');
    }
    setTimeout(() => window.location.reload(), 600);
  }
}

export const settingsController = new SettingsController();

if (typeof window !== 'undefined') {
  window.settingsController = settingsController;
}

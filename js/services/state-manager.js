/**
 * RESUMETRACKER: APPLICATION STATE MANAGER (AppStore)
 * Lightweight reactive Pub/Sub store for predictable, clean data flow.
 */

export class AppStore {
  constructor(initialState = {}) {
    this.state = {
      currentTab: "ats-matcher",
      activeProfile: null,
      activeAtsAnalysis: null,
      activeGoogleAudit: null,
      activeAmazonAudit: null,
      selectedHookFormula: "false_binary",
      settings: null,
      isZenMode: false,
      isAudioEnabled: true,
      ...initialState
    };
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  setState(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    this.notify(this.state, prevState);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(state, prevState) {
    this.listeners.forEach(listener => {
      try {
        listener(state, prevState);
      } catch (err) {
        console.error("[AppStore] Listener error:", err);
      }
    });
  }

  setCurrentTab(tab) {
    this.setState({ currentTab: tab });
  }

  setActiveProfile(profile) {
    this.setState({ activeProfile: profile });
  }

  setActiveAtsAnalysis(analysis) {
    this.setState({ activeAtsAnalysis: analysis });
  }

  setActiveGoogleAudit(audit) {
    this.setState({ activeGoogleAudit: audit });
  }

  setActiveAmazonAudit(audit) {
    this.setState({ activeAmazonAudit: audit });
  }

  setSettings(settings) {
    this.setState({ settings });
  }
}

export const appStore = new AppStore();

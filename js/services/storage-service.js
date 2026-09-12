/**
 * RESUMETRACKER: PERSISTENT STORAGE SERVICE
 * Production-ready repository pattern for browser persistence.
 * Manages Multi-Resume Profiles, Audit History, Career Settings, and Full Backups.
 */

const STORAGE_KEYS = {
  PROFILES: "resumetracker_profiles_v2",
  ACTIVE_PROFILE: "resumetracker_active_profile_v2",
  AUDIT_HISTORY: "resumetracker_audit_history_v2",
  SETTINGS: "resumetracker_settings_v2",
  APPLICATIONS: "resumetracker_applications_v1", // Maintain backwards compatibility
};

export const DEFAULT_PRESET_RESUME = `Alex Chen
Senior Software Engineer | Distributed Systems & Cloud Platforms
Email: alex.chen@example.com | GitHub: github.com/alexchen-dev

SUMMARY:
Results-driven software engineer with 6+ years of experience engineering high-throughput backend services and web applications. Expert in TypeScript, React, Node.js, and SQL. Hands-on experience with Docker containerization, CI/CD pipelines, and AWS cloud deployments.

PROFESSIONAL EXPERIENCE:
Senior Fullstack Engineer | CloudMatrix (2023 - Present)
- Engineered scalable backend microservices using Node.js, TypeScript, and PostgreSQL, servicing 450k daily active users.
- Implemented frontend features in React and Next.js, optimizing Core Web Vitals and reducing Largest Contentful Paint (LCP) by 35%.
- Deployed containerized applications using Docker and AWS ECS; automated testing with GitHub Actions CI/CD workflows.
- Led technical design reviews and established standardized unit testing suites achieving 88% branch coverage.

Software Engineer | Apex FinTech (2020 - 2023)
- Constructed RESTful APIs and event-driven data feeds with Python and PostgreSQL for financial clearing transactions.
- Refactored legacy monolithic endpoints into decoupled microservices, decreasing database connection saturation by 40%.
- Participated in weekly agile sprints, team code reviews, and on-call rotation postmortems.

TECHNICAL SKILLS:
- Languages: JavaScript, TypeScript, Python, SQL, HTML5, CSS3
- Frameworks & Tools: React, Next.js, Node.js, PostgreSQL, Docker, Git, RESTful APIs
- Cloud & Platforms: AWS (EC2, S3, ECS), GitHub Actions, Linux administration`;

export const DEFAULT_PRESET_JD = `About the Role: Senior Fullstack Engineer
We are seeking an experienced Senior Fullstack Engineer to build the next generation of our global cloud platform.

Key Responsibilities:
- Architect, build, and maintain mission-critical web applications using React, Next.js, and TypeScript.
- Design resilient RESTful APIs, GraphQL services, and event-driven data streaming pipelines.
- Manage containerized infrastructure using Docker and Kubernetes (K8s) in an AWS or GCP environment.
- Implement Infrastructure as Code (IaC) using Terraform.
- Drive web performance optimization, accessibility (a11y), and Site Reliability Engineering (SRE) observability with Datadog/Prometheus.
- Collaborate across cross-functional teams, conduct code reviews, and mentor junior engineers in an Agile/Scrum environment.

Qualifications:
- 5+ years of experience with modern TypeScript, React, and Node.js.
- Strong knowledge of relational databases (PostgreSQL/MySQL) and caching systems (Redis).
- Proven track record operating distributed cloud systems with Docker, Kubernetes, and CI/CD pipelines.`;

export const DEFAULT_SETTINGS = {
  targetRole: "Senior Fullstack Engineer",
  targetSeniority: "L5",
  targetSalaryMin: 180000,
  currency: "USD",
  atsStrictness: "standard", // "standard" | "faang"
  soundEnabled: true,
  theme: "light",
  geminiApiKey: "",
  geminiModel: "gemini-2.5-flash"
};

export class StorageService {
  constructor(storage = (typeof window !== "undefined" ? window.localStorage : null)) {
    this.storage = storage;
    this._memoryFallback = {};
    this.KEYS = STORAGE_KEYS;
  }

  getRaw(key) {
    return this._get(key, null);
  }

  getApplications() {
    return this._get(STORAGE_KEYS.APPLICATIONS, []);
  }

  saveApplications(apps) {
    return this._set(STORAGE_KEYS.APPLICATIONS, apps);
  }

  _get(key, fallback = null) {
    if (!this.storage) return this._memoryFallback[key] ?? fallback;
    try {
      const raw = this.storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn(`[StorageService] Failed to read ${key}:`, e);
      return fallback;
    }
  }

  _set(key, value) {
    if (!this.storage) {
      this._memoryFallback[key] = value;
      return true;
    }
    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[StorageService] Failed to save ${key}:`, e);
      return false;
    }
  }

  // --- Profiles (Multi-Resume Support) ---
  getProfiles() {
    let profiles = this._get(STORAGE_KEYS.PROFILES, null);
    if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
      const defaultProfile = {
        id: "prof_default",
        title: "Senior Fullstack (Default)",
        targetRole: "Senior Fullstack Engineer",
        resumeText: DEFAULT_PRESET_RESUME,
        targetJd: DEFAULT_PRESET_JD,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      profiles = [defaultProfile];
      this._set(STORAGE_KEYS.PROFILES, profiles);
      this.setActiveProfileId(defaultProfile.id);
    }
    return profiles;
  }

  getActiveProfileId() {
    let id = this._get(STORAGE_KEYS.ACTIVE_PROFILE, null);
    const profiles = this.getProfiles();
    if (!id || !profiles.some(p => p.id === id)) {
      id = profiles[0]?.id || "prof_default";
      this.setActiveProfileId(id);
    }
    return id;
  }

  getActiveProfile() {
    const id = this.getActiveProfileId();
    const profiles = this.getProfiles();
    return profiles.find(p => p.id === id) || profiles[0];
  }

  setActiveProfileId(id) {
    return this._set(STORAGE_KEYS.ACTIVE_PROFILE, id);
  }

  saveProfile(profileData) {
    const profiles = this.getProfiles();
    const now = new Date().toISOString();
    let updated = null;

    if (profileData.id) {
      const index = profiles.findIndex(p => p.id === profileData.id);
      if (index !== -1) {
        profiles[index] = {
          ...profiles[index],
          ...profileData,
          updatedAt: now
        };
        updated = profiles[index];
      }
    }

    if (!updated) {
      const newProfile = {
        id: profileData.id || `prof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: profileData.title || "Untitled Profile",
        targetRole: profileData.targetRole || "Software Engineer",
        resumeText: profileData.resumeText || "",
        targetJd: profileData.targetJd || "",
        createdAt: now,
        updatedAt: now
      };
      profiles.push(newProfile);
      updated = newProfile;
    }

    this._set(STORAGE_KEYS.PROFILES, profiles);
    return updated;
  }

  deleteProfile(id) {
    let profiles = this.getProfiles();
    if (profiles.length <= 1) {
      throw new Error("Cannot delete the only remaining profile.");
    }
    profiles = profiles.filter(p => p.id !== id);
    this._set(STORAGE_KEYS.PROFILES, profiles);

    if (this.getActiveProfileId() === id) {
      this.setActiveProfileId(profiles[0].id);
    }
    return true;
  }

  // --- Audit History (Chronological Tracking) ---
  getAuditHistory() {
    return this._get(STORAGE_KEYS.AUDIT_HISTORY, []);
  }

  getAudits() {
    return this.getAuditHistory();
  }

  saveAuditRecord(record) {
    const history = this.getAuditHistory();
    const newRecord = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      profileId: record.profileId || this.getActiveProfileId(),
      targetCompany: record.targetCompany || "Target Role",
      targetRole: record.targetRole || "Engineering",
      score: record.score ?? 0,
      statusTier: record.statusTier || "Evaluating",
      confidence: record.confidence || { level: "Medium", score: 75, explanation: "Standard match sample" },
      matchedSkillsCount: record.matchedSkillsCount ?? (record.matchedSkills ? record.matchedSkills.length : 0),
      missingSkillsCount: record.missingSkillsCount ?? (record.missingSkills ? record.missingSkills.length : 0),
      matchedSkills: record.matchedSkills || [],
      missingSkills: record.missingSkills || [],
      jdSnippet: record.jdSnippet || "",
      resumeText: record.resumeText || "",
      jdText: record.jdText || "",
      notes: record.notes || ""
    };

    history.unshift(newRecord);
    // Keep last 40 audits to avoid unbounded growth
    if (history.length > 40) history.pop();

    this._set(STORAGE_KEYS.AUDIT_HISTORY, history);
    return newRecord;
  }

  saveAudit(record) {
    return this.saveAuditRecord(record);
  }

  deleteAuditRecord(id) {
    const history = this.getAuditHistory().filter(h => h.id !== id);
    return this._set(STORAGE_KEYS.AUDIT_HISTORY, history);
  }

  deleteAudit(id) {
    return this.deleteAuditRecord(id);
  }

  clearAuditHistory() {
    return this._set(STORAGE_KEYS.AUDIT_HISTORY, []);
  }

  clearAudits() {
    return this.clearAuditHistory();
  }

  // --- Settings & Configuration ---
  getSettings() {
    const current = this._get(STORAGE_KEYS.SETTINGS, {});
    return { ...DEFAULT_SETTINGS, ...current };
  }

  saveSettings(newSettings) {
    const merged = { ...this.getSettings(), ...newSettings };
    this._set(STORAGE_KEYS.SETTINGS, merged);
    return merged;
  }

  // --- Complete Platform Backup Export & Import ---
  exportBackupJson() {
    const payload = {
      version: "2.0.0",
      exportedAt: new Date().toISOString(),
      profiles: this.getProfiles(),
      activeProfileId: this.getActiveProfileId(),
      auditHistory: this.getAuditHistory(),
      settings: this.getSettings(),
      applications: this._get(STORAGE_KEYS.APPLICATIONS, [])
    };
    return JSON.stringify(payload, null, 2);
  }

  importBackupJson(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== "object") {
        throw new Error("Invalid backup format: Not a JSON object.");
      }

      if (Array.isArray(data.profiles) && data.profiles.length > 0) {
        this._set(STORAGE_KEYS.PROFILES, data.profiles);
      }
      if (data.activeProfileId) {
        this.setActiveProfileId(data.activeProfileId);
      }
      if (Array.isArray(data.auditHistory)) {
        this._set(STORAGE_KEYS.AUDIT_HISTORY, data.auditHistory);
      }
      if (data.settings && typeof data.settings === "object") {
        this.saveSettings(data.settings);
      }
      if (Array.isArray(data.applications)) {
        this._set(STORAGE_KEYS.APPLICATIONS, data.applications);
      }

      return { success: true, profileCount: data.profiles?.length || 0 };
    } catch (err) {
      console.error("[StorageService] Import failed:", err);
      return { success: false, error: err.message };
    }
  }

  resetToFactoryDefaults() {
    if (this.storage) {
      Object.values(STORAGE_KEYS).forEach(k => {
        try { this.storage.removeItem(k); } catch (_) {}
      });
    }
    this._memoryFallback = {};
    return this.getProfiles(); // Will re-seed default profile
  }
}

export const storageService = new StorageService();

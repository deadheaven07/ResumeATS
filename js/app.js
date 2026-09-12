/**
 * RESUMETRACKER: AI CAREER & BRAND COPILOT
 * Main Application Orchestrator
 */

import { analyzeAtsMatch, buildStarBullet, generateStarDraftsForSkill, generateResumeHeatmapHtml, generateAtsPrintHtml, calculateResumePageBudget } from "./ats-matcher.js";
import { STAR_ACTION_VERBS } from "./taxonomy.js";
import { auditContent, humanizeText, calculateReadability, BANNED_PATTERNS } from "./humanizer.js";
import { HOOK_FORMULAS, buildLinkedInPost, analyzePostStructure } from "./linkedin-engine.js";
import { buildHeadline, buildAboutSection, PROFILE_AUDIT_ITEMS } from "./profile-builder.js";
import { JobTracker, STAGES } from "./tracker.js";
import { GeminiClient } from "./gemini-client.js";
import { GOOGLE_JOB_PROFILES, auditGoogleAtsProfile, buildGoogleXyzBullet } from "./google-engine.js";
import { setupDropzone } from "./file-parser.js";
import { auditAmazonLeadershipPrinciples, buildAmazonStarBullet, AMAZON_JOB_PROFILES, AMAZON_LEADERSHIP_PRINCIPLES } from "./amazon-engine.js";
import { generateInterviewQuestions } from "./interview-coach.js";
import { setupCommandPalette } from "./command-palette.js";
import { generateAutoTuneDiffs, applyApprovedDiffs } from "./diff-engine.js";
import { generateOutreachKit, OUTREACH_TONES } from "./outreach-engine.js";

// Initialize Subsystems
const jobTracker = new JobTracker();
const geminiClient = new GeminiClient();

// Toast notification helper
export function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "warning") icon = "⚠️";
  if (type === "error") icon = "❌";

  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Dynamic Ambient Radial Scorecard Glow
export function applyGaugeGlow(containerEl, score) {
  if (!containerEl) return;
  containerEl.classList.remove("glow-emerald", "glow-amber", "glow-rose");
  if (score >= 80) {
    containerEl.classList.add("glow-emerald");
  } else if (score >= 60) {
    containerEl.classList.add("glow-amber");
  } else {
    containerEl.classList.add("glow-rose");
  }
}

// Linear Counter Rollup Animation (Cubic Ease Out)
export function animateNumber(element, start, end, duration = 900) {
  if (!element) return;
  const startTime = performance.now();
  const startNum = Number(start) || 0;
  const endNum = Number(end) || 0;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentVal = Math.round(startNum + (endNum - startNum) * easeOut);
    element.textContent = currentVal;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = endNum;
    }
  }
  requestAnimationFrame(update);
}

// Global Application State
const state = {
  currentTab: "ats-matcher",
  selectedHookFormula: "false_binary",
  activeAtsAnalysis: null,
  profileChecklistState: {}
};

/* ==========================================================================
   SAMPLE DATA PRESETS FOR 1-CLICK DEMO TESTING
   ========================================================================== */
const SAMPLE_PRESETS = {
  resume: `Alex Chen
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
- Cloud & Platforms: AWS (EC2, S3, ECS), GitHub Actions, Linux administration`,

  jobDescription: `About the Role: Senior Fullstack Engineer
We are seeking an experienced Senior Fullstack Engineer to build the next generation of our global cloud platform.

Key Responsibilities:
- Architect, build, and maintain mission-critical web applications using React, Next.js, and TypeScript.
- Design resilient RESTful APIs, GraphQL services, and event-driven data streaming pipelines.
- Manage containerized infrastructure using Docker and Kubernetes (K8s) in an AWS or GCP environment.
- Implement Infrastructure as Code (IaC) using Terraform.
- Drive web performance optimization, accessibility (a11y), and Site Reliability Engineering (SRE) observability with Datadog/Prometheus.
- Collaborate across cross-functional teams, conduct code reviews, and mentor junior engineers in an Agile/Scrum environment.

Qualifications:
- 5+ years of software engineering experience with TypeScript, Python, or Go (Golang).
- Strong knowledge of relational databases (PostgreSQL, MySQL) and caching systems (Redis).
- Hands-on mastery of Kubernetes, CI/CD pipelines, and cloud architecture.
- AWS Certified Solutions Architect or equivalent experience is a strong plus.`,

  slopText: `In today's fast-paced world, organizations must leverage cutting-edge AI to supercharge their digital transformation journey. I am excited to announce that our team decided to delve deep into the realm of modern data systems to spearhead a game-changer platform.

This launch stands as a testament to our beacon of innovation, weaving a rich tapestry of technology and human intuition. Think fast. Act faster. Win big. 🚀🔥

Our key takeaways underscore that synergy and navigating complexity are paramount to harness future value.`,

  proofPoints: [
    "Scaled real-time payment ingestion pipeline from 2,000 to 45,000 TPS with zero transaction drops.",
    "Cut annual AWS compute and database infrastructure spend by $180,000 via automated container autoscaling.",
    "Decreased team production incident frequency by 54% through comprehensive static analysis and automated CI/CD gating."
  ]
};

/* ==========================================================================
   INITIALIZATION & TAB NAVIGATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initTabs();
  initAtsMatcher();
  initGoogleCopilot();
  initAmazonCopilot();
  initInterviewCoach();
  initHumanizer();
  initLinkedInEngine();
  initProfileOptimizer();
  initTracker();
  initSettingsModal();
  initCommandPaletteAndExport();
  initSideDrawer();
  initAutoTunerModal();
  initOutreachModal();
});

function initTheme() {
  const savedTheme = localStorage.getItem("resumetracker_theme") || "light";
  applyTheme(savedTheme);

  const toggleBtn = document.getElementById("btn-toggle-theme");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("resumetracker_theme", next);
      showToast(`Switched to ${next === "dark" ? "Dark" : "Light"} Theme`, "info");
    });
  }
}

function applyTheme(theme) {
  const icon = document.getElementById("theme-toggle-icon");
  const label = document.getElementById("theme-toggle-label");

  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    if (icon) icon.textContent = "☀️";
    if (label) label.textContent = "Light Theme";
  } else {
    document.documentElement.removeAttribute("data-theme");
    if (icon) icon.textContent = "🌙";
    if (label) label.textContent = "Dark Theme";
  }
}

function initTabs() {
  const tabBtns = document.querySelectorAll(".nav-tab-btn");
  const tabPanels = document.querySelectorAll(".tab-content-panel");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });

  // Handle URL hash navigation if present
  const hash = window.location.hash.replace("#", "");
  if (hash && document.getElementById(`panel-${hash}`)) {
    switchTab(hash);
  }
}

export function switchTab(tabId) {
  state.currentTab = tabId;
  window.location.hash = tabId;

  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
  });

  document.querySelectorAll(".drawer-link-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
  });

  document.querySelectorAll(".tab-content-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `panel-${tabId}`);
  });
}

/* ==========================================================================
   MODULE 1: ATS & RESUME MATCHER LOGIC
   ========================================================================== */
function initAtsMatcher() {
  const resumeInput = document.getElementById("ats-resume-input");
  const jdInput = document.getElementById("ats-jd-input");
  const btnAnalyze = document.getElementById("btn-run-ats");
  const btnLoadSample = document.getElementById("btn-load-ats-sample");

  // In-Browser Client-Side File Ingestion Dropzone
  setupDropzone({
    dropzoneEl: document.getElementById("ats-resume-dropzone"),
    textareaEl: resumeInput,
    onFileParsed: (text, filename) => {
      showToast(`Parsed ${filename} (${text.length} chars)`, "success");
      runAtsAnalysis();
    }
  });

  // Raw Text vs Live Heatmap View Toggles
  const btnViewEditor = document.getElementById("btn-view-editor");
  const btnViewHeatmap = document.getElementById("btn-view-heatmap");
  const resumeHeatmap = document.getElementById("ats-resume-heatmap");

  function setResumeView(mode) {
    if (mode === "heatmap") {
      if (btnViewHeatmap) btnViewHeatmap.classList.add("active");
      if (btnViewEditor) btnViewEditor.classList.remove("active");
      resumeInput.style.display = "none";
      if (resumeHeatmap) resumeHeatmap.style.display = "block";
      updateHeatmapDisplay();
    } else {
      if (btnViewEditor) btnViewEditor.classList.add("active");
      if (btnViewHeatmap) btnViewHeatmap.classList.remove("active");
      resumeInput.style.display = "block";
      if (resumeHeatmap) resumeHeatmap.style.display = "none";
    }
  }

  if (btnViewEditor && btnViewHeatmap) {
    btnViewEditor.addEventListener("click", () => setResumeView("editor"));
    btnViewHeatmap.addEventListener("click", () => setResumeView("heatmap"));
  }

  function updateHeatmapDisplay() {
    if (!resumeHeatmap) return;
    const text = resumeInput.value;
    const matched = state.activeAtsAnalysis ? state.activeAtsAnalysis.matchedSkills : [];
    const banned = BANNED_PATTERNS.map(b => b.pattern);
    resumeHeatmap.innerHTML = generateResumeHeatmapHtml(text, matched, banned);
  }

  // Load sample data button
  btnLoadSample.addEventListener("click", () => {
    resumeInput.value = SAMPLE_PRESETS.resume;
    jdInput.value = SAMPLE_PRESETS.jobDescription;
    showToast("Loaded Senior Fullstack sample resume & JD", "success");
    runAtsAnalysis();
  });

  btnAnalyze.addEventListener("click", () => {
    runAtsAnalysis();
  });

  // STAR Rewriter inputs
  const verbSelect = document.getElementById("star-verb-select");
  const contextInput = document.getElementById("star-context-input");
  const outcomeInput = document.getElementById("star-outcome-input");
  const starOutput = document.getElementById("star-output-text");
  const btnCopyStar = document.getElementById("btn-copy-star");
  const btnAppendStar = document.getElementById("btn-append-star");

  // Populate action verbs
  if (verbSelect) {
    verbSelect.innerHTML = "";
    for (const category in STAR_ACTION_VERBS) {
      const optGroup = document.createElement("optgroup");
      optGroup.label = category;
      STAR_ACTION_VERBS[category].forEach(verb => {
        const opt = document.createElement("option");
        opt.value = verb;
        opt.textContent = verb;
        optGroup.appendChild(opt);
      });
      verbSelect.appendChild(optGroup);
    }
  }

  function updateStarPreview() {
    const bullet = buildStarBullet({
      actionVerb: verbSelect.value,
      contextProblem: contextInput.value,
      quantifiableOutcome: outcomeInput.value
    });
    starOutput.textContent = bullet || "Your structured STAR bullet point will appear here in real-time.";
  }

  [verbSelect, contextInput, outcomeInput].forEach(el => {
    if (el) el.addEventListener("input", updateStarPreview);
  });

  btnCopyStar.addEventListener("click", () => {
    const text = starOutput.textContent;
    if (!text || text.startsWith("Your structured")) {
      showToast("Create a STAR bullet point first", "warning");
      return;
    }
    navigator.clipboard.writeText(text);
    showToast("STAR bullet copied to clipboard!", "success");
  });

  btnAppendStar.addEventListener("click", () => {
    const text = starOutput.textContent;
    if (!text || text.startsWith("Your structured")) {
      showToast("Create a STAR bullet point first", "warning");
      return;
    }
    resumeInput.value += `\n- ${text}`;
    showToast("Appended to Resume input!", "success");
    runAtsAnalysis();
  });
}

function runAtsAnalysis() {
  const resumeText = document.getElementById("ats-resume-input").value;
  const jdText = document.getElementById("ats-jd-input").value;

  if (!resumeText.trim() || !jdText.trim()) {
    showToast("Please enter both Candidate Resume and Target JD", "warning");
    return;
  }

  const analysis = analyzeAtsMatch(resumeText, jdText);
  state.activeAtsAnalysis = analysis;

  // Show scorecard
  const scorecard = document.getElementById("ats-results-card");
  scorecard.classList.add("active");

  // Animate circular gauge with counter rollup and ambient glow
  const gaugeNumber = document.getElementById("ats-gauge-score");
  const gaugeProgress = document.getElementById("ats-gauge-circle");
  const gaugeTier = document.getElementById("ats-gauge-tier");
  const gaugeContainer = scorecard.querySelector(".ats-gauge-container");

  animateNumber(gaugeNumber, 0, analysis.score, 900);
  applyGaugeGlow(gaugeContainer, analysis.score);

  gaugeTier.textContent = analysis.statusTier;
  gaugeTier.className = `badge ${analysis.score >= 80 ? "badge-success" : analysis.score >= 60 ? "badge-warning" : "badge-danger"}`;

  // 440 circumference
  const offset = 440 - (440 * analysis.score) / 100;
  gaugeProgress.style.strokeDashoffset = offset;
  gaugeProgress.style.stroke = analysis.statusColor;

  // Render Matched Skills
  const matchedContainer = document.getElementById("ats-matched-skills-cloud");
  matchedContainer.innerHTML = "";
  if (analysis.matchedSkills.length === 0) {
    matchedContainer.innerHTML = `<span class="text-muted" style="font-size: 0.85rem;">No exact canonical matches detected yet.</span>`;
  } else {
    analysis.matchedSkills.forEach(s => {
      const tag = document.createElement("span");
      tag.className = "skill-tag skill-tag-matched";
      tag.innerHTML = `✓ ${s.canonical}`;
      matchedContainer.appendChild(tag);
    });
  }

  // Render Missing Critical Skills
  const missingContainer = document.getElementById("ats-missing-skills-cloud");
  missingContainer.innerHTML = "";
  if (analysis.missingSkills.length === 0) {
    missingContainer.innerHTML = `<span class="badge badge-success">Flawless match! All canonical JD skills detected.</span>`;
  } else {
    analysis.missingSkills.forEach(s => {
      const tag = document.createElement("span");
      tag.className = "skill-tag skill-tag-missing";
      tag.title = "Click to draft a STAR bullet for this skill";
      tag.innerHTML = `⚠ ${s.canonical} <span class="skill-tag-add-btn">+ STAR</span>`;
      tag.addEventListener("click", () => {
        injectSkillIntoStar(s.canonical);
      });
      missingContainer.appendChild(tag);
    });
  }

  // Render Ghost Tags for Missing Keywords under Resume Input
  const ghostWrapper = document.getElementById("ats-ghost-tags-wrapper");
  const ghostContainer = document.getElementById("ats-ghost-tags");
  if (ghostWrapper && ghostContainer) {
    ghostContainer.innerHTML = "";
    if (analysis.missingSkills && analysis.missingSkills.length > 0) {
      ghostWrapper.style.display = "block";
      analysis.missingSkills.forEach(s => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "ghost-tag";
        chip.innerHTML = `+ ${s.canonical}`;
        chip.title = `Click to generate a STAR bullet for ${s.canonical}`;
        chip.addEventListener("click", () => {
          injectSkillIntoStar(s.canonical);
        });
        ghostContainer.appendChild(chip);
      });
    } else {
      ghostWrapper.style.display = "none";
    }
  }

  // Refresh live heatmap if visible
  const resumeHeatmap = document.getElementById("ats-resume-heatmap");
  if (resumeHeatmap && resumeHeatmap.style.display !== "none") {
    const banned = BANNED_PATTERNS.map(b => b.pattern);
    resumeHeatmap.innerHTML = generateResumeHeatmapHtml(resumeText, analysis.matchedSkills, banned);
  }

  showToast(`Analysis Complete: ${analysis.score}% ATS Match`, analysis.score >= 70 ? "success" : "info");
}

function injectSkillIntoStar(skillName) {
  const drafts = generateStarDraftsForSkill(skillName);
  const selected = drafts[0];

  const verbSelect = document.getElementById("star-verb-select");
  const contextInput = document.getElementById("star-context-input");
  const outcomeInput = document.getElementById("star-outcome-input");
  const starOutput = document.getElementById("star-output-text");

  verbSelect.value = selected.verb;
  contextInput.value = selected.context;
  outcomeInput.value = selected.outcome;
  starOutput.textContent = selected.preview;

  // Smooth scroll to STAR builder
  document.querySelector(".star-builder-card").scrollIntoView({ behavior: "smooth" });
  showToast(`Loaded STAR template for ${skillName}`, "success");
}

/* ==========================================================================
   MODULE 2: ANTI-AI HUMANIZER LOGIC
   ========================================================================== */
function initHumanizer() {
  const textarea = document.getElementById("humanizer-input");
  const btnLoadSample = document.getElementById("btn-load-slop-sample");
  const btnHumanize = document.getElementById("btn-humanize-all");
  const btnCopyClean = document.getElementById("btn-copy-humanized");

  btnLoadSample.addEventListener("click", () => {
    textarea.value = SAMPLE_PRESETS.slopText;
    runHumanizerAudit();
    showToast("Loaded AI slop sample text", "info");
  });

  textarea.addEventListener("input", () => {
    runHumanizerAudit();
  });

  btnHumanize.addEventListener("click", () => {
    const raw = textarea.value;
    if (!raw.trim()) {
      showToast("Enter text to humanize first", "warning");
      return;
    }
    const cleaned = humanizeText(raw);
    textarea.value = cleaned;
    runHumanizerAudit();
    showToast("Applied humanizer transformations!", "success");
  });

  btnCopyClean.addEventListener("click", () => {
    const text = textarea.value;
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
    showToast("Copied text to clipboard!", "success");
  });
}

function runHumanizerAudit() {
  const text = document.getElementById("humanizer-input").value;
  const audit = auditContent(text);

  // Stats bar update
  const gradeEl = document.getElementById("stat-readability");
  const emDashEl = document.getElementById("stat-em-dashes");
  const emojiEl = document.getElementById("stat-emojis");
  const staccatoEl = document.getElementById("stat-staccato");
  const slopCountEl = document.getElementById("stat-slop-count");

  // Readability
  if (audit.readability.grade > 0) {
    gradeEl.innerHTML = `${audit.readability.grade}th Grade <span class="badge ${audit.readability.badgeClass}" style="font-size:0.65rem;">${audit.readability.status}</span>`;
  } else {
    gradeEl.textContent = "0 (N/A)";
  }

  // Em-dashes
  emDashEl.innerHTML = `${audit.emDashAudit.count} <span class="badge ${audit.emDashAudit.isValid ? "badge-success" : "badge-danger"}" style="font-size:0.65rem;">${audit.emDashAudit.isValid ? "Valid (≤1)" : "Exceeded (>1)"}</span>`;

  // Emojis
  let emojiBadge = "badge-success";
  let emojiMsg = "Clean";
  if (audit.emojiAudit.hasForbidden) {
    emojiBadge = "badge-danger";
    emojiMsg = "Banned 🚀/🔥 detected";
  } else if (!audit.emojiAudit.isValid) {
    emojiBadge = "badge-warning";
    emojiMsg = "Too many (>2)";
  }
  emojiEl.innerHTML = `${audit.emojiAudit.count} <span class="badge ${emojiBadge}" style="font-size:0.65rem;">${emojiMsg}</span>`;

  // Staccato
  staccatoEl.innerHTML = `${audit.staccatoFlags.length} <span class="badge ${audit.staccatoFlags.length === 0 ? "badge-success" : "badge-danger"}" style="font-size:0.65rem;">${audit.staccatoFlags.length === 0 ? "None" : "Detected"}</span>`;

  // Slop Count
  slopCountEl.innerHTML = `${audit.slopMatches.length} <span class="badge ${audit.slopMatches.length === 0 ? "badge-success" : "badge-danger"}" style="font-size:0.65rem;">${audit.slopMatches.length === 0 ? "Clean" : "Slop Found"}</span>`;

  // Slop Findings Container
  const findingsContainer = document.getElementById("slop-findings-container");
  const slopPillsContainer = document.getElementById("slop-word-pills");
  slopPillsContainer.innerHTML = "";

  if (audit.slopMatches.length > 0) {
    findingsContainer.classList.add("active");
    audit.slopMatches.forEach(match => {
      const pill = document.createElement("div");
      pill.className = "slop-pill";
      pill.innerHTML = `<span>"${match.word}"</span> <span class="slop-arrow">→</span> <span class="slop-replacement">${match.replacement}</span>`;
      slopPillsContainer.appendChild(pill);
    });
  } else {
    findingsContainer.classList.remove("active");
  }
}

/* ==========================================================================
   MODULE 3: LINKEDIN THOUGHT LEADERSHIP & HOOK ENGINE LOGIC
   ========================================================================== */
function initLinkedInEngine() {
  const formulaButtons = document.querySelectorAll(".formula-card-btn");
  const formulaFieldsContainer = document.getElementById("li-formula-fields");
  const rawStoryInput = document.getElementById("li-story-input");
  const ctaInput = document.getElementById("li-cta-input");
  const externalLinkInput = document.getElementById("li-external-link-input");

  const fullPostOutput = document.getElementById("li-full-post-editor");
  const simBody = document.getElementById("li-sim-body");
  const simComment = document.getElementById("li-sim-first-comment");
  const charMeter = document.getElementById("li-char-meter");

  // Setup formula selection
  formulaButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      formulaButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.selectedHookFormula = btn.getAttribute("data-formula");
      renderFormulaFields();
      updateLinkedInPost();
    });
  });

  function renderFormulaFields() {
    const formula = HOOK_FORMULAS[state.selectedHookFormula];
    formulaFieldsContainer.innerHTML = "";

    formula.fields.forEach(f => {
      const group = document.createElement("div");
      group.className = "form-group";
      group.innerHTML = `
        <label class="form-label">${f.label}</label>
        <input type="text" class="form-control formula-field-input" data-field="${f.id}" placeholder="${f.placeholder}">
      `;
      formulaFieldsContainer.appendChild(group);

      group.querySelector("input").addEventListener("input", updateLinkedInPost);
    });

    // Populate defaults based on formula
    if (state.selectedHookFormula === "false_binary") {
      const inputs = formulaFieldsContainer.querySelectorAll("input");
      if (inputs[0]) inputs[0].value = "Microservices";
      if (inputs[1]) inputs[1].value = "Monoliths";
      if (inputs[2]) inputs[2].value = "team domain boundary misalignment";
    } else if (state.selectedHookFormula === "yoy_pivot") {
      const inputs = formulaFieldsContainer.querySelectorAll("input");
      if (inputs[0]) inputs[0].value = "2023";
      if (inputs[1]) inputs[1].value = "writing 15,000 lines of complex distributed logic";
      if (inputs[2]) inputs[2].value = "2026";
      if (inputs[3]) inputs[3].value = "deleting redundant services and accelerating customer time-to-first-value";
    } else if (state.selectedHookFormula === "scarce_math") {
      const inputs = formulaFieldsContainer.querySelectorAll("input");
      if (inputs[0]) inputs[0].value = "4 deep work hours";
      if (inputs[1]) inputs[1].value = "800 total engineering hours";
      if (inputs[2]) inputs[2].value = "Here is the exact framework we used to reclaim 300 hours per engineer this quarter:";
    }
  }

  function updateLinkedInPost() {
    const fieldValues = {};
    formulaFieldsContainer.querySelectorAll(".formula-field-input").forEach(inp => {
      fieldValues[inp.getAttribute("data-field")] = inp.value;
    });

    const post = buildLinkedInPost({
      hookFormulaId: state.selectedHookFormula,
      fieldValues,
      rawContent: rawStoryInput.value,
      ctaText: ctaInput.value
    });

    fullPostOutput.value = post;
    updateSimulator(post);
  }

  function updateSimulator(postText) {
    const analysis = analyzePostStructure(postText);

    // Update Simulator Body with 2-line Above the fold fold highlight
    if (analysis.firstTwoLines) {
      simBody.innerHTML = `
        <div class="above-the-fold-highlight">
          <strong>${analysis.firstTwoLines}</strong>
        </div>
        <div class="li-fold-marker">...see more (LinkedIn truncation fold)</div>
        <div>${analysis.remainingLines || "<em class='text-muted'>Add story proof points below to complete your post...</em>"}</div>
      `;
    } else {
      simBody.innerHTML = `<em class="text-muted">Draft a hook or select a formula above to preview post...</em>`;
    }

    // First comment simulation
    const extLink = externalLinkInput.value.trim();
    if (extLink) {
      simComment.innerHTML = `<strong>First Comment Link:</strong><br><a href="${extLink}" target="_blank" style="color:var(--accent-cyan); font-weight:600;">${extLink}</a><br><span class="text-muted" style="font-size:0.75rem;">(Keeping links out of the main post body prevents algorithmic reach penalization)</span>`;
    } else {
      simComment.innerHTML = `<span class="text-muted" style="font-size:0.78rem;">External links should live here in the first comment to maintain feed reach.</span>`;
    }

    // Char Meter
    charMeter.innerHTML = `
      <span>${analysis.charCount} characters</span>
      <span class="badge ${analysis.isLengthOptimal ? "badge-success" : "badge-warning"}">${analysis.lengthStatus}</span>
      <span style="font-size:0.75rem; color:var(--text-muted);">${analysis.lengthFeedback}</span>
    `;
  }

  // Bind inputs
  rawStoryInput.addEventListener("input", updateLinkedInPost);
  ctaInput.addEventListener("input", updateLinkedInPost);
  externalLinkInput.addEventListener("input", () => updateSimulator(fullPostOutput.value));
  fullPostOutput.addEventListener("input", () => updateSimulator(fullPostOutput.value));

  // Copy buttons
  document.getElementById("btn-copy-li-post").addEventListener("click", () => {
    if (!fullPostOutput.value.trim()) return;
    navigator.clipboard.writeText(fullPostOutput.value);
    showToast("LinkedIn post copied to clipboard!", "success");
  });

  document.getElementById("btn-copy-li-comment").addEventListener("click", () => {
    const link = externalLinkInput.value.trim();
    if (!link) {
      showToast("Enter a first comment link first", "warning");
      return;
    }
    navigator.clipboard.writeText(link);
    showToast("First comment link copied!", "success");
  });

  // Preload initial formula
  renderFormulaFields();
  rawStoryInput.value = `Here is what happens when teams blindly split services without domain alignment:
• Distributed network overhead jumps 4x.
• Debugging cross-service race conditions consumes 60% of on-call sprints.
• Deployment coordination requires 4 managers instead of 1 engineer.

Last quarter, our platform team consolidated 6 microservices back into a cohesive, modular codebase.

The quantifiable outcome:
1. API latency dropped from 210ms to 48ms.
2. Cloud compute costs fell by $14,000 / month.
3. Daily deployment frequency doubled from 4 to 9.`;
  ctaInput.value = "What is your team's rule of thumb before creating a new microservice? Drop your approach below.";
  externalLinkInput.value = "https://github.com/alexchen-dev/distributed-systems-case-study";
  updateLinkedInPost();
}

/* ==========================================================================
   MODULE 4: PROFILE CONVERSION OPTIMIZER LOGIC
   ========================================================================== */
function initProfileOptimizer() {
  const roleInput = document.getElementById("profile-role-input");
  const audienceInput = document.getElementById("profile-audience-input");
  const resultInput = document.getElementById("profile-result-input");
  const techInput = document.getElementById("profile-tech-input");
  const headlineOutput = document.getElementById("profile-headline-output");
  const headlineCounter = document.getElementById("profile-headline-counter");
  const btnCopyHeadline = document.getElementById("btn-copy-headline");

  function updateHeadline() {
    const res = buildHeadline({
      primaryRole: roleInput.value,
      targetAudience: audienceInput.value,
      specificResult: resultInput.value,
      keyTechStack: techInput.value
    });

    headlineOutput.value = res.headline;
    headlineCounter.textContent = `${res.charCount} / 220 chars`;
    headlineCounter.className = `char-limit-indicator ${res.isOverLimit ? "danger" : ""}`;
  }

  [roleInput, audienceInput, resultInput, techInput].forEach(inp => {
    inp.addEventListener("input", updateHeadline);
  });

  btnCopyHeadline.addEventListener("click", () => {
    if (!headlineOutput.value.trim()) return;
    navigator.clipboard.writeText(headlineOutput.value);
    showToast("Headline copied to clipboard!", "success");
  });

  // About Section Builder
  const thesisInput = document.getElementById("about-thesis-input");
  const proofsInput = document.getElementById("about-proofs-input");
  const ctaInput = document.getElementById("about-cta-input");
  const aboutOutput = document.getElementById("about-full-output");
  const btnCopyAbout = document.getElementById("btn-copy-about");

  function updateAbout() {
    const proofs = proofsInput.value.split("\n").filter(p => p.trim().length > 0);
    const about = buildAboutSection({
      coreThesis: thesisInput.value,
      proofPoints: proofs,
      cta: ctaInput.value
    });
    aboutOutput.value = about;
  }

  [thesisInput, proofsInput, ctaInput].forEach(inp => {
    inp.addEventListener("input", updateAbout);
  });

  btnCopyAbout.addEventListener("click", () => {
    if (!aboutOutput.value.trim()) return;
    navigator.clipboard.writeText(aboutOutput.value);
    showToast("About section copied to clipboard!", "success");
  });

  // Checklist audit
  const checklistContainer = document.getElementById("profile-checklist-container");
  checklistContainer.innerHTML = "";

  PROFILE_AUDIT_ITEMS.forEach(item => {
    const itemEl = document.createElement("label");
    itemEl.className = "checklist-item";
    itemEl.innerHTML = `
      <input type="checkbox" data-id="${item.id}" data-weight="${item.weight}">
      <div class="checklist-content">
        <span class="checklist-label">${item.label}</span>
        <span class="checklist-weight">+${item.weight} pts</span>
      </div>
    `;

    const checkbox = itemEl.querySelector("input");
    checkbox.addEventListener("change", updateAuditScore);
    checklistContainer.appendChild(itemEl);
  });

  function updateAuditScore() {
    let score = 0;
    document.querySelectorAll("#profile-checklist-container input[type='checkbox']").forEach(cb => {
      if (cb.checked) {
        score += Number(cb.getAttribute("data-weight"));
      }
    });

    const scoreDisplay = document.getElementById("profile-audit-score");
    scoreDisplay.textContent = `${score}%`;
    scoreDisplay.className = `badge ${score >= 80 ? "badge-success" : score >= 50 ? "badge-warning" : "badge-neutral"}`;
  }

  // Preload initial profile defaults
  roleInput.value = "Staff Platform Engineer";
  audienceInput.value = "hyper-growth FinTech scaleups";
  resultInput.value = "scale distributed microservices to 50k+ TPS with 99.99% reliability";
  techInput.value = "Go | Kubernetes | AWS Certified Solutions Architect";
  updateHeadline();

  thesisInput.value = "I believe the best architecture is the simplest system that reliably solves the user's problem. Most engineering bottlenecks aren't technical hurdles—they are organizational misalignments masquerading as technical debt.";
  proofsInput.value = SAMPLE_PRESETS.proofPoints.join("\n");
  ctaInput.value = "Open to advising high-velocity teams and discussing Staff/Principal Infrastructure roles. Reach out directly via LinkedIn DM or at alex.chen@example.com.";
  updateAbout();
}

/* ==========================================================================
   MODULE 5: JOB & APPLICATION TRACKER LOGIC
   ========================================================================== */
function initTracker() {
  renderKanbanBoard();

  const searchInput = document.getElementById("tracker-search-input");
  searchInput.addEventListener("input", (e) => {
    renderKanbanBoard(e.target.value.toLowerCase());
  });

  document.getElementById("btn-add-job-modal").addEventListener("click", () => {
    openJobModal();
  });

  document.getElementById("btn-save-job").addEventListener("click", () => {
    saveJobFromModal();
  });

  document.getElementById("btn-close-modal").addEventListener("click", () => {
    closeJobModal();
  });

  document.getElementById("btn-export-jobs").addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jobTracker.exportData());
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `resumetracker-backup-${new Date().toISOString().split("T")[0]}.json`);
    dlAnchor.click();
    showToast("Exported jobs backup JSON", "success");
  });

  document.getElementById("btn-import-jobs").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const success = jobTracker.importData(evt.target.result);
          if (success) {
            renderKanbanBoard();
            showToast("Successfully imported job applications!", "success");
          } else {
            showToast("Failed to parse imported JSON file.", "error");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  });
}

function updatePipelineAnalytics(allJobs = jobTracker.getAll()) {
  const totalEl = document.getElementById("stat-total-jobs");
  const interviewRateEl = document.getElementById("stat-interview-rate");
  const offerRateEl = document.getElementById("stat-offer-rate");
  const avgDaysEl = document.getElementById("stat-avg-days");

  if (!totalEl) return;

  const total = allJobs.length;
  totalEl.textContent = total;

  if (total === 0) {
    if (interviewRateEl) interviewRateEl.textContent = "0%";
    if (offerRateEl) offerRateEl.textContent = "0%";
    if (avgDaysEl) avgDaysEl.textContent = "0d";
    return;
  }

  const interviewCount = allJobs.filter(j => j.status === "interview" || j.status === "offer").length;
  const offerCount = allJobs.filter(j => j.status === "offer").length;

  const interviewRate = Math.round((interviewCount / total) * 100);
  const offerRate = Math.round((offerCount / total) * 100);

  if (interviewRateEl) interviewRateEl.textContent = `${interviewRate}%`;
  if (offerRateEl) offerRateEl.textContent = `${offerRate}%`;
  if (avgDaysEl) avgDaysEl.textContent = "14d";

  // Update Drawer Pulse Widget
  const drawerTotal = document.getElementById("drawer-pulse-total");
  const drawerInterview = document.getElementById("drawer-pulse-interview");
  const drawerOffers = document.getElementById("drawer-pulse-offers");
  const drawerBadgeCount = document.getElementById("drawer-badge-job-count");

  if (drawerTotal) drawerTotal.textContent = total;
  if (drawerInterview) drawerInterview.textContent = `${interviewRate}%`;
  if (drawerOffers) drawerOffers.textContent = offerCount;
  if (drawerBadgeCount) drawerBadgeCount.textContent = `${total} Jobs`;
}

function renderKanbanBoard(filterQuery = "") {
  const board = document.getElementById("kanban-board-container");
  if (!board) return;
  board.innerHTML = "";

  const allJobs = jobTracker.getAll();
  updatePipelineAnalytics(allJobs);

  STAGES.forEach(stage => {
    const stageJobs = allJobs.filter(j => {
      const matchesStage = j.status === stage.id;
      if (!filterQuery) return matchesStage;
      const q = filterQuery.toLowerCase();
      return matchesStage && (
        j.company.toLowerCase().includes(q) ||
        j.role.toLowerCase().includes(q) ||
        (j.notes && j.notes.toLowerCase().includes(q))
      );
    });

    const col = document.createElement("div");
    col.className = "kanban-column";
    col.setAttribute("data-stage", stage.id);

    col.innerHTML = `
      <div class="column-header">
        <div class="column-title-group">
          <div class="column-color-indicator" style="background: ${stage.color};"></div>
          <span class="column-title">${stage.title}</span>
        </div>
        <span class="column-count">${stageJobs.length}</span>
      </div>
      <div class="card-list" id="card-list-${stage.id}"></div>
    `;

    const cardList = col.querySelector(".card-list");

    stageJobs.forEach(job => {
      const card = document.createElement("div");
      card.className = "job-card";
      card.setAttribute("data-id", job.id);

      let matchBadgeClass = "badge-neutral";
      if (job.matchScore >= 80) matchBadgeClass = "badge-success";
      else if (job.matchScore >= 60) matchBadgeClass = "badge-warning";
      else if (job.matchScore > 0) matchBadgeClass = "badge-danger";

      card.innerHTML = `
        <div class="job-card-top">
          <span class="job-company">${job.company}</span>
          <span class="badge ${matchBadgeClass} job-match-badge">${job.matchScore ? job.matchScore + "% ATS" : "Unscored"}</span>
        </div>
        <div class="job-role">${job.role}</div>
        <div class="job-meta-row">
          <span>📍 ${job.location || "Remote"}</span>
          ${job.salary ? `<span>💵 ${job.salary}</span>` : ""}
        </div>
        ${job.nextStep ? `<div class="job-next-step"><strong>Next:</strong> ${job.nextStep}</div>` : ""}
        <div class="job-card-actions">
          <div style="font-size:0.72rem; color:var(--text-muted);">${job.dateAdded}</div>
          <div class="job-card-btn-group">
            <button class="card-icon-btn btn-send-ats" title="Test match in ATS Analyzer">🎯</button>
            <button class="card-icon-btn btn-move-next" title="Move to next stage">→</button>
            <button class="card-icon-btn btn-delete-job" title="Delete job">✕</button>
          </div>
        </div>
      `;

      // Event: Send to ATS Matcher
      card.querySelector(".btn-send-ats").addEventListener("click", (e) => {
        e.stopPropagation();
        sendJobToAtsMatcher(job);
      });

      // Event: Move to next stage
      card.querySelector(".btn-move-next").addEventListener("click", (e) => {
        e.stopPropagation();
        moveJobNextStage(job.id, stage.id);
      });

      // Event: Delete job
      card.querySelector(".btn-delete-job").addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`Remove application for ${job.role} at ${job.company}?`)) {
          jobTracker.deleteJob(job.id);
          renderKanbanBoard(filterQuery);
          showToast("Job removed from tracker", "info");
        }
      });

      // Click card to view / edit
      card.addEventListener("click", () => {
        openJobModal(job);
      });

      cardList.appendChild(card);
    });

    board.appendChild(col);
  });
}

function sendJobToAtsMatcher(job) {
  if (!job.jobDescription) {
    showToast(`No Job Description saved for ${job.company}`, "warning");
    return;
  }
  const jdInput = document.getElementById("ats-jd-input");
  jdInput.value = job.jobDescription;
  switchTab("ats-matcher");
  showToast(`Loaded JD for ${job.company} into ATS Matcher`, "success");
  runAtsAnalysis();
}

function moveJobNextStage(jobId, currentStageId) {
  const stageIds = STAGES.map(s => s.id);
  const curIdx = stageIds.indexOf(currentStageId);
  const nextStage = stageIds[(curIdx + 1) % stageIds.length];
  jobTracker.updateStatus(jobId, nextStage);
  renderKanbanBoard();
  showToast(`Moved application to ${nextStage.toUpperCase()}`, "info");
}

let activeEditingJobId = null;

function openJobModal(job = null) {
  const modal = document.getElementById("job-modal");
  const modalTitle = document.getElementById("job-modal-title");

  if (job) {
    activeEditingJobId = job.id;
    modalTitle.textContent = "Edit Job Application";
    document.getElementById("modal-company").value = job.company;
    document.getElementById("modal-role").value = job.role;
    document.getElementById("modal-location").value = job.location;
    document.getElementById("modal-salary").value = job.salary || "";
    document.getElementById("modal-status").value = job.status;
    document.getElementById("modal-score").value = job.matchScore || "";
    document.getElementById("modal-nextstep").value = job.nextStep || "";
    document.getElementById("modal-link").value = job.link || "";
    document.getElementById("modal-jd").value = job.jobDescription || "";
    document.getElementById("modal-notes").value = job.notes || "";
  } else {
    activeEditingJobId = null;
    modalTitle.textContent = "Add Target Job Application";
    document.getElementById("modal-company").value = "";
    document.getElementById("modal-role").value = "";
    document.getElementById("modal-location").value = "Remote";
    document.getElementById("modal-salary").value = "";
    document.getElementById("modal-status").value = "saved";
    document.getElementById("modal-score").value = "";
    document.getElementById("modal-nextstep").value = "";
    document.getElementById("modal-link").value = "";
    document.getElementById("modal-jd").value = "";
    document.getElementById("modal-notes").value = "";
  }

  modal.classList.add("active");
}

function closeJobModal() {
  const modal = document.getElementById("job-modal");
  modal.classList.remove("active");
}

function saveJobFromModal() {
  const company = document.getElementById("modal-company").value.trim();
  const role = document.getElementById("modal-role").value.trim();

  if (!company || !role) {
    showToast("Please provide Company and Role", "warning");
    return;
  }

  const payload = {
    company,
    role,
    location: document.getElementById("modal-location").value.trim(),
    salary: document.getElementById("modal-salary").value.trim(),
    status: document.getElementById("modal-status").value,
    matchScore: Number(document.getElementById("modal-score").value) || 0,
    nextStep: document.getElementById("modal-nextstep").value.trim(),
    link: document.getElementById("modal-link").value.trim(),
    jobDescription: document.getElementById("modal-jd").value.trim(),
    notes: document.getElementById("modal-notes").value.trim()
  };

  if (activeEditingJobId) {
    jobTracker.updateJob(activeEditingJobId, payload);
    showToast("Updated application details", "success");
  } else {
    jobTracker.addJob(payload);
    showToast("Added new job application to tracker", "success");
  }

  closeJobModal();
  renderKanbanBoard();
}

/* ==========================================================================
   SETTINGS & OPTIONAL GEMINI CLIENT MODAL
   ========================================================================== */
function initSettingsModal() {
  const modal = document.getElementById("settings-modal");
  const openBtn = document.getElementById("btn-open-settings");
  const closeBtn = document.getElementById("btn-close-settings");
  const saveBtn = document.getElementById("btn-save-settings");
  const apiKeyInput = document.getElementById("settings-api-key");
  const modelSelect = document.getElementById("settings-model-select");

  openBtn.addEventListener("click", () => {
    apiKeyInput.value = geminiClient.apiKey || "";
    modelSelect.value = geminiClient.model || "gemini-2.5-flash";
    modal.classList.add("active");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  saveBtn.addEventListener("click", () => {
    geminiClient.setApiKey(apiKeyInput.value);
    geminiClient.setModel(modelSelect.value);
    modal.classList.remove("active");
    showToast("Settings saved!", "success");
  });
}

/* ==========================================================================
   MODULE: GOOGLE CAREERS & PROFILE COPILOT LOGIC
   ========================================================================== */
function initGoogleCopilot() {
  const roleSelectorGrid = document.getElementById("google-role-selector-grid");
  const jdInput = document.getElementById("google-jd-input");
  const resumeInput = document.getElementById("google-resume-input");
  const levelBadge = document.getElementById("google-selected-level-badge");
  const btnRunAudit = document.getElementById("btn-run-google-audit");
  const btnLoadSample = document.getElementById("btn-load-google-sample");

  // In-Browser Client-Side File Ingestion Dropzone
  setupDropzone({
    dropzoneEl: document.getElementById("google-resume-dropzone"),
    textareaEl: resumeInput,
    onFileParsed: (text, filename) => {
      showToast(`Parsed ${filename} for Google audit`, "success");
      runGoogleAudit();
    }
  });

  // Google XYZ Formula Rewriter Inputs
  const xInput = document.getElementById("xyz-x-input");
  const yInput = document.getElementById("xyz-y-input");
  const zInput = document.getElementById("xyz-z-input");
  const xyzOutput = document.getElementById("xyz-live-output");
  const btnCopyXyz = document.getElementById("btn-copy-xyz");
  const btnAppendXyz = document.getElementById("btn-append-xyz");

  // Role-specific XYZ formula presets
  const roleXyzDefaults = {
    google_swe_l3: {
      x: "optimized graph traversal latency for social connection queries",
      y: "a 38% decrease in memory consumption and O(V+E) time complexity",
      z: "implementing an optimized bidirectional BFS in C++ with GoogleTest coverage"
    },
    google_swe_l5: {
      x: "accelerated payment transaction throughput to 50k TPS",
      y: "a 42% decrease in p99 response times and zero message drops",
      z: "architecting an event-driven Go and Kafka streaming architecture with distributed Redis caching"
    },
    google_ml_l5: {
      x: "reduced LLM inference latency across 10M daily requests",
      y: "a 3.4x throughput boost and 40% reduction in GPU memory consumption",
      z: "implementing FP16 quantization, speculative decoding, and vLLM batching in Python and C++"
    },
    google_sre: {
      x: "eliminated cluster failover downtime during multi-region outages",
      y: "achieving 99.999% system availability and reducing MTTR by 65%",
      z: "engineering automated Kubernetes cross-region failover controllers and Prometheus alerting in Go"
    }
  };

  function updateXyzPreview() {
    if (!xyzOutput) return;
    const xVal = xInput ? xInput.value.trim() : "";
    const yVal = yInput ? yInput.value.trim() : "";
    const zVal = zInput ? zInput.value.trim() : "";

    if (!xVal && !yVal && !zVal) {
      xyzOutput.innerHTML = `Accomplished <span class="xyz-span-x">[X]</span> as measured by <span class="xyz-span-y">[Y]</span>, by <span class="xyz-span-z">[Z]</span>.`;
      return;
    }

    xyzOutput.innerHTML = `Accomplished <span class="xyz-span-x">${xVal || "[X Result]"}</span> as measured by <span class="xyz-span-y">${yVal || "[Y Metric]"}</span>, by <span class="xyz-span-z">${zVal || "[Z Technical Implementation]"}</span>.`;
  }

  function applyRoleSelection(roleId) {
    const role = GOOGLE_JOB_PROFILES.find(r => r.id === roleId) || GOOGLE_JOB_PROFILES[0];
    document.querySelectorAll(".google-role-card").forEach(c => {
      c.classList.toggle("active", c.getAttribute("data-id") === role.id);
    });
    jdInput.value = role.requirements;
    levelBadge.textContent = role.level;

    if (btnLoadSample) {
      btnLoadSample.textContent = role.id === "google_swe_l3"
        ? "Load Google L3 (SWE II) Sample"
        : "Load Google L5 Senior Sample";
    }

    if (roleXyzDefaults[role.id] && xInput && yInput && zInput) {
      xInput.value = roleXyzDefaults[role.id].x;
      yInput.value = roleXyzDefaults[role.id].y;
      zInput.value = roleXyzDefaults[role.id].z;
      updateXyzPreview();
    }
  }

  // Render role selector cards
  if (roleSelectorGrid) {
    roleSelectorGrid.innerHTML = "";
    GOOGLE_JOB_PROFILES.forEach((role, idx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `google-role-card ${idx === 0 ? "active" : ""}`;
      card.setAttribute("data-id", role.id);
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.25rem;">
          <strong style="font-size:0.86rem; color:var(--text-heading);">${role.title.split(" - ")[0]}</strong>
          <span class="badge badge-neutral" style="font-size:0.68rem;">${role.level}</span>
        </div>
        <div style="font-size:0.75rem; color:var(--text-secondary); line-height:1.35;">${role.overview}</div>
      `;

      card.addEventListener("click", () => {
        applyRoleSelection(role.id);
        showToast(`Loaded Google Rubric: ${role.title.split(" - ")[0]}`, "info");
      });

      roleSelectorGrid.appendChild(card);
    });

    // Default to first profile (Google L3)
    if (GOOGLE_JOB_PROFILES[0]) {
      applyRoleSelection(GOOGLE_JOB_PROFILES[0].id);
    }
  }

  // Google L3 (Software Engineer II / Early Career) Candidate Sample
  const googleL3SampleResume = `Maya Patel
Software Engineer II | Core Systems & Algorithmic Applications
Email: maya.patel@example.com | GitHub: github.com/mayapatel-swe | LeetCode: leetcode.com/mayapatel

SUMMARY:
Software Engineer with a Bachelor of Science in Computer Science and 1.5 years of experience building high-performance backend microservices and algorithmic data processing tools in C++, Go, and Python. Strong theoretical grounding in Data Structures, Big-O space/time complexity analysis, and rigorous unit testing (92% test coverage).

PROFESSIONAL EXPERIENCE:
Software Engineer | NexaTech Systems (2024 - Present)
- Accomplished a 38% decrease in graph traversal response latency as measured by p95 benchmark tests (from 145ms to 90ms), by implementing an optimized bidirectional Breadth-First Search (BFS) algorithm in C++ with custom adjacency list caching.
- Decreased memory consumption by 45MB per active worker pod as measured by Prometheus memory telemetry, by refactoring JSON serialization to binary Protocol Buffers (Protobuf) and eliminating heap allocations.
- Increased test coverage from 68% to 92% across core billing APIs as measured by SonarQube quality gates, by authoring 60+ parameterized unit tests and mock integration suites using GoogleTest and pytest.
- Reduced automated CI build failures by 28% as measured by GitHub Actions pipeline telemetry, by authoring pre-commit linting hooks, AddressSanitizer (ASan) memory checks, and automated code review guidelines.

Software Engineering Intern | Vertex Cloud Labs (Summer 2023)
- Accomplished a 3.2x speedup in indexing 2.5M catalog items as measured by benchmark completion time (from 42s down to 13s), by implementing a multithreaded worker pool in Go utilizing sync.WaitGroup and bounded channels.
- Resolved 14 critical edge-case race conditions as measured by zero thread-sanitizer data race alerts, by introducing read-write mutex locks and immutable data models.

TECHNICAL SKILLS & COMPETITIVE PROGRAMMING:
- Programming Languages: C++, Go (Golang), Python, Java, SQL
- Core Fundamentals: Algorithms, Data Structures, Big-O Analysis, Memory Management, Concurrency, Multithreading
- Tools & Frameworks: Protocol Buffers, gRPC, Docker, Git, GoogleTest, pytest, Linux, CI/CD Pipelines
- Problem Solving: Knight on LeetCode (Rating 1980+); Solved 500+ algorithmic problems across Dynamic Programming, Graphs, and Trees.`;

  // Google L5 Senior Systems Candidate Sample
  const googleSampleResume = `Alex Chen
Senior Software Engineer | High-Throughput Cloud Platforms
Email: alex.chen@example.com | GitHub: github.com/alexchen-dev

SUMMARY:
Senior Systems Software Engineer with 7+ years of experience designing and scaling planetary-scale distributed microservices, fault-tolerant consensus layers, and high-concurrency cloud infrastructure in Go, C++, and Python. Proven track record leading multi-quarter technical initiatives and optimizing p99 latency for millions of users.

PROFESSIONAL EXPERIENCE:
Senior Distributed Systems Engineer | CloudMatrix (2023 - Present)
- Accomplished 50,000 TPS ingestion throughput as measured by a 42% decrease in p99 API response times (from 84ms to 49ms), by architecting an event-driven Go and Kafka streaming architecture with distributed Redis caching.
- Decreased infrastructure compute expenditures by $180,000 annually as measured by automated cluster utilization metrics, by refactoring monolithic services into containerized Kubernetes (K8s) deployments with predictive horizontal pod autoscaling.
- Led technical design reviews across 4 cross-functional engineering teams, authoring architecture RFCs and mentoring 5 junior/mid-level engineers on distributed systems debugging and unit test standardization (88% branch coverage).
- Decreased team production incident frequency by 54% as measured by postmortem SLA reports, by implementing automated canary deployments and OpenTelemetry Prometheus/Grafana observability.

Software Engineer III | Apex FinTech (2020 - 2023)
- Accomplished zero financial clearing transaction drops across 12M daily requests as measured by 99.999% system availability, by constructing fault-tolerant distributed transaction processors using Go, Python, and PostgreSQL.
- Optimized database connection saturation by 40% as measured by PgBouncer pool metrics, by implementing connection pooling, query indexing, and asynchronous queue workers.

TECHNICAL EXPERTISE:
- Languages: Go (Golang), C++, Python, TypeScript, SQL
- Distributed Systems: Microservices, System Design, Concurrency, Multithreading, Fault Tolerance, Scalability, High Availability
- Infrastructure & Cloud: GCP (Google Cloud), Kubernetes (K8s), Docker, gRPC, Protocol Buffers, Kafka, CI/CD Pipelines, SRE`;

  if (btnLoadSample) {
    btnLoadSample.addEventListener("click", () => {
      const activeCard = document.querySelector(".google-role-card.active");
      const activeRoleId = activeCard ? activeCard.getAttribute("data-id") : (GOOGLE_JOB_PROFILES[0] ? GOOGLE_JOB_PROFILES[0].id : "");

      if (activeRoleId === "google_swe_l3") {
        resumeInput.value = googleL3SampleResume;
        showToast("Loaded Google L3 (SWE II) candidate sample!", "success");
      } else {
        resumeInput.value = googleSampleResume;
        showToast("Loaded Google L5 Senior candidate sample!", "success");
      }
      runGoogleAudit();
    });
  }

  if (btnRunAudit) {
    btnRunAudit.addEventListener("click", () => {
      runGoogleAudit();
    });
  }

  [xInput, yInput, zInput].forEach(inp => {
    if (inp) inp.addEventListener("input", updateXyzPreview);
  });

  if (btnCopyXyz) {
    btnCopyXyz.addEventListener("click", () => {
      const text = buildGoogleXyzBullet({
        accomplishedX: xInput ? xInput.value : "",
        measuredY: yInput ? yInput.value : "",
        doingZ: zInput ? zInput.value : ""
      });
      if (!text) {
        showToast("Fill in XYZ fields first", "warning");
        return;
      }
      navigator.clipboard.writeText(text);
      showToast("Google XYZ bullet copied to clipboard!", "success");
    });
  }

  if (btnAppendXyz) {
    btnAppendXyz.addEventListener("click", () => {
      const text = buildGoogleXyzBullet({
        accomplishedX: xInput ? xInput.value : "",
        measuredY: yInput ? yInput.value : "",
        doingZ: zInput ? zInput.value : ""
      });
      if (!text) {
        showToast("Fill in XYZ fields first", "warning");
        return;
      }
      resumeInput.value += `\n- ${text}`;
      showToast("Appended to Google Resume!", "success");
      runGoogleAudit();
    });
  }
}

function runGoogleAudit() {
  const resumeText = document.getElementById("google-resume-input").value;
  const jdText = document.getElementById("google-jd-input").value;

  if (!resumeText.trim()) {
    showToast("Please provide a resume to run the Google audit", "warning");
    return;
  }

  const audit = auditGoogleAtsProfile(resumeText, jdText);

  // Show results card
  const resultsCard = document.getElementById("google-results-card");
  resultsCard.classList.add("active");

  // Animate circular gauge with counter rollup and ambient glow
  const gaugeNumber = document.getElementById("google-gauge-score");
  const gaugeCircle = document.getElementById("google-gauge-circle");
  const gaugeTier = document.getElementById("google-tier-badge");
  const levelBadge = document.getElementById("google-level-badge");
  const gaugeContainer = resultsCard.querySelector(".ats-gauge-container");

  animateNumber(gaugeNumber, 0, audit.googleAtsScore, 900);
  applyGaugeGlow(gaugeContainer, audit.googleAtsScore);

  gaugeTier.textContent = audit.tier;
  gaugeTier.style.color = audit.tierColor;
  levelBadge.textContent = audit.levelEval.title;
  levelBadge.className = `badge ${audit.levelEval.badgeClass}`;

  const offset = 440 - (440 * audit.googleAtsScore) / 100;
  gaugeCircle.style.strokeDashoffset = offset;
  gaugeCircle.style.stroke = audit.tierColor;

  // Update Dimensions
  document.getElementById("score-dim-xyz").textContent = `${audit.dimensions.xyzDensity}%`;
  document.getElementById("bar-dim-xyz").style.width = `${audit.dimensions.xyzDensity}%`;

  document.getElementById("score-dim-rrk").textContent = `${audit.dimensions.rrk}%`;
  document.getElementById("bar-dim-rrk").style.width = `${audit.dimensions.rrk}%`;

  document.getElementById("score-dim-gca").textContent = `${audit.dimensions.gca}%`;
  document.getElementById("bar-dim-gca").style.width = `${audit.dimensions.gca}%`;

  document.getElementById("score-dim-lead").textContent = `${audit.dimensions.leadership}%`;
  document.getElementById("bar-dim-lead").style.width = `${audit.dimensions.leadership}%`;

  // Update Level Recommendations
  const isL3Target = (jdText || "").includes("L3") || (jdText || "").includes("Software Engineer II");
  document.getElementById("google-level-title").textContent = audit.levelEval.title;
  const levelPill = document.getElementById("google-level-badge-pill");

  if (isL3Target) {
    const meetsL3 = audit.googleAtsScore >= 65;
    levelPill.textContent = meetsL3 ? "L3 Bar Met" : "Development Needed";
    levelPill.className = `badge ${meetsL3 ? "badge-success" : "badge-warning"}`;
  } else {
    const meetsSenior = (audit.levelEval.level === "L5" || audit.levelEval.level === "L6") && audit.googleAtsScore >= 70;
    levelPill.textContent = meetsSenior ? "Senior Bar Met" : "Development Needed";
    levelPill.className = `badge ${meetsSenior ? "badge-success" : "badge-warning"}`;
  }

  document.getElementById("google-level-summary").textContent = audit.levelEval.summary;

  const recsList = document.getElementById("google-level-recs");
  recsList.innerHTML = "";
  audit.levelEval.recommendations.forEach(r => {
    const li = document.createElement("li");
    li.textContent = r;
    recsList.appendChild(li);
  });

  showToast(`Google Audit Complete: ${audit.googleAtsScore}% (${audit.levelEval.level} Scope)`, "success");
}

/* ==========================================================================
   MODULE: AMAZON BAR RAISER & 16 LEADERSHIP PRINCIPLES COPILOT
   ========================================================================== */
const amazonSampleResume = `Jordan Taylor
Senior Backend Systems Engineer | Distributed Architecture & Cloud Scale
Email: jordan.taylor@example.com | GitHub: github.com/jtaylor-cloud

SUMMARY:
Customer-obsessed senior distributed systems engineer with 5+ years of experience architecting high-throughput microservices on AWS (ECS, DynamoDB, SQS, S3). Proven track record of owning mission-critical systems end-to-end, driving operational excellence through root cause analysis (5-Whys), and delivering robust software handling 30,000+ TPS.

PROFESSIONAL EXPERIENCE:
Software Development Engineer II | CloudCommerce Corp (2022 - Present)
- Demonstrated Ownership by taking end-to-end accountability for distributed checkout payment service processing $12M daily volume; eliminated single point of failure by decoupling database layer into DynamoDB with global secondary indexes.
- Demonstrated Customer Obsession and Invent and Simplify by re-architecting asynchronous order fulfillment pipelines using AWS SQS and Lambda, decreasing p99 customer latency from 480ms to 42ms.
- Demonstrated Dive Deep and Insist on the Highest Standards during on-call rotation postmortems; authored 4 Correction of Error (COE) docs and instituted automated synthetic canaries, cutting Sev-2 operational incidents by 62%.
- Mentored 3 junior engineers on multi-threading, two-way door decision frameworks, and unit testing standards, elevating team test coverage to 91%.

Software Engineer | HighScale Media (2020 - 2022)
- Built high-throughput telemetry ingestion microservices in Java and Go, streaming 25,000 TPS across multi-region AWS clusters.
- Demonstrated Bias for Action by delivering an urgent GDPR data deletion compliance service 3 weeks ahead of scheduled launch milestone.
- Reduced annual AWS cloud infrastructure spend by $84,000 through automated S3 lifecycle tiering and DynamoDB on-demand autoscaling.

TECHNICAL SKILLS:
- Languages: Java, Python, Go, TypeScript, SQL
- AWS & Cloud: DynamoDB, SQS, SNS, S3, ECS, Lambda, CloudWatch, Terraform
- Architecture: Distributed Systems, Microservices, Event-Driven Architecture, High Availability, OpEx, Postmortems`;

function initAmazonCopilot() {
  const roleSelectorGrid = document.getElementById("amazon-role-selector-grid");
  const jdInput = document.getElementById("amazon-jd-input");
  const resumeInput = document.getElementById("amazon-resume-input");
  const levelBadge = document.getElementById("amazon-selected-level-badge");
  const btnRunAudit = document.getElementById("btn-run-amazon-audit");
  const btnLoadSample = document.getElementById("btn-load-amazon-sample");

  // In-Browser Client-Side File Ingestion Dropzone
  setupDropzone({
    dropzoneEl: document.getElementById("amazon-resume-dropzone"),
    textareaEl: resumeInput,
    onFileParsed: (text, filename) => {
      showToast(`Parsed ${filename} for Amazon Bar Raiser audit`, "success");
      runAmazonAudit();
    }
  });

  // Amazon STAR Formula Inputs
  const lpSelect = document.getElementById("amazon-star-lp-select");
  const stInput = document.getElementById("amazon-star-st-input");
  const actInput = document.getElementById("amazon-star-act-input");
  const resInput = document.getElementById("amazon-star-res-input");
  const liveOutput = document.getElementById("amazon-star-live-output");
  const btnCopyStar = document.getElementById("btn-copy-amazon-star");
  const btnAppendStar = document.getElementById("btn-append-amazon-star");

  function updateAmazonStarPreview() {
    if (!liveOutput) return;
    const bullet = buildAmazonStarBullet({
      chosenLp: lpSelect ? lpSelect.value : "Ownership",
      situationTask: stInput ? stInput.value : "",
      actionLp: actInput ? actInput.value : "",
      measurableResult: resInput ? resInput.value : ""
    });

    if (!bullet) {
      liveOutput.innerHTML = `Demonstrated <span style="color:#d97706; font-weight:700;">[Leadership Principle]</span> by tackling <span style="color:#0284c7;">[Situation]</span>; engineered <span style="color:#7c3aed;">[Action]</span>, resulting in <span style="color:#059669; font-weight:700;">[Result]</span>.`;
      return;
    }
    liveOutput.textContent = bullet;
  }

  [lpSelect, stInput, actInput, resInput].forEach(inp => {
    if (inp) inp.addEventListener("input", updateAmazonStarPreview);
  });

  function applyAmazonRoleSelection(roleId) {
    const role = AMAZON_JOB_PROFILES.find(r => r.id === roleId) || AMAZON_JOB_PROFILES[1];
    document.querySelectorAll(".amazon-role-card").forEach(c => {
      c.classList.toggle("active", c.getAttribute("data-id") === role.id);
    });
    if (jdInput) jdInput.value = role.requirements;
    if (levelBadge) levelBadge.textContent = role.level;
  }

  // Populate Role selector cards
  if (roleSelectorGrid) {
    roleSelectorGrid.innerHTML = "";
    AMAZON_JOB_PROFILES.forEach((role, idx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `google-role-card amazon-role-card ${role.id === "amazon_sde2" ? "active" : ""}`;
      card.setAttribute("data-id", role.id);
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.25rem;">
          <strong style="font-size:0.86rem; color:var(--text-heading);">${role.title.split(" - ")[0]}</strong>
          <span class="badge badge-neutral" style="font-size:0.68rem;">${role.level}</span>
        </div>
        <p style="font-size:0.75rem; color:var(--text-secondary); line-height:1.4; margin:0;">${role.overview}</p>
      `;

      card.addEventListener("click", () => {
        applyAmazonRoleSelection(role.id);
        showToast(`Switched target role to ${role.level}`, "info");
      });

      roleSelectorGrid.appendChild(card);
    });

    // Initialize with SDE II default
    applyAmazonRoleSelection("amazon_sde2");
  }

  if (btnLoadSample) {
    btnLoadSample.addEventListener("click", () => {
      if (resumeInput) resumeInput.value = amazonSampleResume;
      showToast("Loaded Amazon SDE II candidate sample!", "success");
      runAmazonAudit();
    });
  }

  if (btnRunAudit) {
    btnRunAudit.addEventListener("click", () => {
      runAmazonAudit();
    });
  }

  if (btnCopyStar) {
    btnCopyStar.addEventListener("click", () => {
      const bullet = buildAmazonStarBullet({
        chosenLp: lpSelect ? lpSelect.value : "Ownership",
        situationTask: stInput ? stInput.value : "",
        actionLp: actInput ? actInput.value : "",
        measurableResult: resInput ? resInput.value : ""
      });
      if (!bullet) {
        showToast("Fill in STAR fields first", "warning");
        return;
      }
      navigator.clipboard.writeText(bullet);
      showToast("Amazon Bar Raiser STAR bullet copied!", "success");
    });
  }

  if (btnAppendStar) {
    btnAppendStar.addEventListener("click", () => {
      const bullet = buildAmazonStarBullet({
        chosenLp: lpSelect ? lpSelect.value : "Ownership",
        situationTask: stInput ? stInput.value : "",
        actionLp: actInput ? actInput.value : "",
        measurableResult: resInput ? resInput.value : ""
      });
      if (!bullet) {
        showToast("Fill in STAR fields first", "warning");
        return;
      }
      if (resumeInput) resumeInput.value += `\n- ${bullet}`;
      showToast("Appended to Amazon Resume!", "success");
      runAmazonAudit();
    });
  }
}

function runAmazonAudit() {
  const resumeText = document.getElementById("amazon-resume-input")?.value || "";
  const jdText = document.getElementById("amazon-jd-input")?.value || "";

  if (!resumeText.trim()) {
    showToast("Please provide a resume to run the Amazon Bar Raiser audit", "warning");
    return;
  }

  const audit = auditAmazonLeadershipPrinciples(resumeText, jdText);

  // Show results card
  const resultsCard = document.getElementById("amazon-results-card");
  if (resultsCard) resultsCard.classList.add("active");

  // Animate circular gauge with counter rollup and ambient glow
  const gaugeNumber = document.getElementById("amazon-gauge-score");
  const gaugeCircle = document.getElementById("amazon-gauge-circle");
  const gaugeTier = document.getElementById("amazon-tier-badge");
  const lpBadge = document.getElementById("amazon-lp-badge");
  const gaugeContainer = resultsCard ? resultsCard.querySelector(".ats-gauge-container") : null;

  if (gaugeNumber) animateNumber(gaugeNumber, 0, audit.amazonScore, 900);
  if (gaugeContainer) applyGaugeGlow(gaugeContainer, audit.amazonScore);

  if (gaugeTier) {
    gaugeTier.textContent = audit.tier;
    gaugeTier.style.color = audit.tierColor;
  }
  if (lpBadge) {
    lpBadge.textContent = `${audit.lpCoverageCount} / 16 LPs Covered`;
    lpBadge.className = `badge ${audit.lpCoverageCount >= 8 ? "badge-success" : audit.lpCoverageCount >= 4 ? "badge-warning" : "badge-danger"}`;
  }

  if (gaugeCircle) {
    const offset = 440 - (440 * audit.amazonScore) / 100;
    gaugeCircle.style.strokeDashoffset = offset;
    gaugeCircle.style.stroke = audit.tierColor;
  }

  // Update Dimensions
  const setDim = (scoreId, barId, val) => {
    const s = document.getElementById(scoreId);
    const b = document.getElementById(barId);
    if (s) s.textContent = `${val}%`;
    if (b) b.style.width = `${val}%`;
  };

  setDim("score-amazon-lp", "bar-amazon-lp", audit.dimensions.lpCoverage);
  setDim("score-amazon-scale", "bar-amazon-scale", audit.dimensions.scale);
  setDim("score-amazon-opex", "bar-amazon-opex", audit.dimensions.operationalExcellence);
  setDim("score-amazon-cust", "bar-amazon-cust", audit.dimensions.customerObsession);

  // Render 16 LP Chips
  const container = document.getElementById("amazon-lp-chips-container");
  if (container) {
    container.innerHTML = "";
    AMAZON_LEADERSHIP_PRINCIPLES.forEach(lp => {
      const match = audit.lpMatches.find(m => m.lp.id === lp.id);
      const chip = document.createElement("div");
      if (match) {
        chip.className = "amazon-lp-chip matched";
        chip.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
            <strong style="color:#059669;">✓ ${lp.name}</strong>
            <span class="badge badge-success" style="font-size:0.65rem;">Covered</span>
          </div>
          <div style="font-size:0.7rem; color:var(--text-muted);">${lp.short}</div>
          <div style="font-size:0.68rem; color:#059669; margin-top:0.2rem;">Found: ${match.matchedKeywords.slice(0, 3).join(", ")}</div>
        `;
      } else {
        chip.className = "amazon-lp-chip missing";
        chip.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
            <strong style="color:var(--text-secondary);">○ ${lp.name}</strong>
            <span class="badge badge-neutral" style="font-size:0.65rem;">Missing</span>
          </div>
          <div style="font-size:0.7rem; color:var(--text-muted);">${lp.short}</div>
        `;
      }
      container.appendChild(chip);
    });
  }

  showToast(`Amazon Bar Raiser Audit: ${audit.amazonScore}% (${audit.lpCoverageCount}/16 LPs)`, "success");
}

/* ==========================================================================
   MODULE: AI INTERVIEW PREP COACH LOGIC
   ========================================================================== */
function initInterviewCoach() {
  const btnRefresh = document.getElementById("btn-generate-interview-questions");
  const targetCompanyEl = document.getElementById("interview-target-company");
  const focusGapEl = document.getElementById("interview-focus-gap");
  const container = document.getElementById("interview-questions-container");

  function refreshQuestions() {
    if (!container) return;

    // Gather gaps from active ATS analysis or defaults
    let missingSkills = [];
    let matchedSkills = [];
    let company = "Google / Tier-1 Tech";

    if (state.currentTab === "amazon-copilot") {
      company = "Amazon (Bar Raiser)";
    }

    if (state.activeAtsAnalysis && state.activeAtsAnalysis.missingSkills.length > 0) {
      missingSkills = state.activeAtsAnalysis.missingSkills.map(s => s.canonical);
      matchedSkills = state.activeAtsAnalysis.matchedSkills.map(s => s.canonical);
    } else {
      missingSkills = ["Distributed Systems", "Kubernetes", "Observability & SRE", "Concurrency"];
      matchedSkills = ["TypeScript", "React", "Node.js", "Docker", "PostgreSQL"];
    }

    const plan = generateInterviewQuestions({
      missingSkills,
      matchedSkills,
      company
    });

    if (targetCompanyEl) targetCompanyEl.textContent = plan.company;
    if (focusGapEl) focusGapEl.textContent = plan.primaryGap;

    container.innerHTML = "";
    plan.questions.forEach((q, idx) => {
      const card = document.createElement("div");
      card.className = "interview-qa-card";
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="badge ${q.badgeClass}">Question ${idx + 1}: ${q.category}</span>
            <span class="badge badge-neutral" style="font-size:0.7rem;">Targeted Gap: <strong>${q.targetedGap}</strong></span>
          </div>
        </div>

        <h4 style="font-size:1.02rem; font-weight:700; color:var(--text-heading); line-height:1.5; margin-bottom:0.75rem;">
          ${q.question}
        </h4>

        <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.85rem;">
          ${q.keyConcepts.map(c => `<span class="badge badge-neutral" style="font-size:0.72rem; background:rgba(79,70,229,0.06); color:var(--accent-primary);">⚡ ${c}</span>`).join("")}
        </div>

        <div class="interview-guide-box">
          <strong style="color:var(--text-heading); display:block; margin-bottom:0.35rem;">
            📘 Model Answer Blueprint (${q.modelAnswerGuide.framework}):
          </strong>
          <ul style="margin:0 0 0.5rem 1.25rem; padding:0; list-style-type:disc;">
            <li><strong>Step 1:</strong> ${q.modelAnswerGuide.step1}</li>
            <li><strong>Step 2:</strong> ${q.modelAnswerGuide.step2}</li>
            <li><strong>Step 3:</strong> ${q.modelAnswerGuide.step3}</li>
          </ul>
          <div style="color:var(--accent-rose-text); font-weight:600; font-size:0.76rem;">
            ⚠️ Common Pitfall: ${q.modelAnswerGuide.pitfallsToAvoid}
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      refreshQuestions();
      showToast("Generated new targeted interview questions", "success");
    });
  }

  // Initial populate
  refreshQuestions();
}

/* ==========================================================================
   COMMAND PALETTE & ATS PRINT/EXPORT LOGIC
   ========================================================================== */
function initCommandPaletteAndExport() {
  setupCommandPalette({
    onSelectAction: (actionId) => {
      handlePaletteAction(actionId);
    }
  });

  // Export ATS PDF Modal
  const printModal = document.getElementById("ats-print-modal");
  const btnOpenPrint = document.getElementById("btn-export-ats-pdf");
  const btnClosePrint = document.getElementById("btn-close-print-modal");
  const btnTriggerPrint = document.getElementById("btn-trigger-print");
  const btnDownloadJson = document.getElementById("btn-download-json-resume");
  const previewBody = document.getElementById("ats-print-preview-body");
  const printArea = document.getElementById("ats-resume-print-area");

  function getActiveResumeText() {
    const r1 = document.getElementById("ats-resume-input")?.value;
    const r2 = document.getElementById("google-resume-input")?.value;
    const r3 = document.getElementById("amazon-resume-input")?.value;
    return (r1 && r1.trim()) || (r2 && r2.trim()) || (r3 && r3.trim()) || SAMPLE_PRESETS.resume;
  }

  function openPrintModal() {
    if (!printModal || !previewBody) return;
    const resumeText = getActiveResumeText();
    const printHtml = generateAtsPrintHtml(resumeText);
    previewBody.innerHTML = printHtml;
    if (printArea) printArea.innerHTML = printHtml;

    // 1-Page Print Budget Estimator & Warning Meter
    const budget = calculateResumePageBudget(resumeText);
    const budgetBadge = document.getElementById("page-budget-badge");
    const budgetMsg = document.getElementById("page-budget-message");
    if (budgetBadge) {
      budgetBadge.textContent = budget.status;
      budgetBadge.className = `badge ${budget.badgeClass}`;
    }
    if (budgetMsg) {
      budgetMsg.textContent = budget.message;
    }

    printModal.classList.add("active");
  }

  function closePrintModal() {
    if (printModal) printModal.classList.remove("active");
  }

  if (btnOpenPrint) btnOpenPrint.addEventListener("click", openPrintModal);
  if (btnClosePrint) btnClosePrint.addEventListener("click", closePrintModal);

  if (btnTriggerPrint) {
    btnTriggerPrint.addEventListener("click", () => {
      const resumeText = getActiveResumeText();
      const printHtml = generateAtsPrintHtml(resumeText);
      if (printArea) {
        printArea.innerHTML = printHtml;
        printArea.style.display = "block";
      }
      window.print();
      if (printArea) {
        printArea.style.display = "none";
      }
    });
  }

  if (btnDownloadJson) {
    btnDownloadJson.addEventListener("click", () => {
      const resumeText = getActiveResumeText();
      const lines = resumeText.split("\n").map(l => l.trim()).filter(Boolean);
      const jsonResume = {
        basics: {
          name: lines[0] || "Candidate Name",
          label: lines.length > 1 && !lines[1].startsWith("-") ? lines[1] : "Software Engineer",
          email: "alex.chen@example.com",
          summary: resumeText.slice(0, 400)
        },
        skills: state.activeAtsAnalysis ? state.activeAtsAnalysis.matchedSkills.map(s => s.canonical) : ["TypeScript", "React", "Node.js", "Docker", "AWS"],
        rawText: resumeText,
        atsExportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(jsonResume, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Downloaded JSON Resume!", "success");
    });
  }

  function handlePaletteAction(id) {
    if (id === "tab_ats") switchTab("ats-matcher");
    else if (id === "tab_google") switchTab("google-copilot");
    else if (id === "tab_amazon") switchTab("amazon-copilot");
    else if (id === "tab_humanizer") switchTab("humanizer");
    else if (id === "tab_linkedin") switchTab("linkedin-engine");
    else if (id === "tab_profile") switchTab("profile-optimizer");
    else if (id === "tab_tracker") switchTab("tracker");
    else if (id === "tab_interview") switchTab("interview-coach");
    else if (id === "action_run_ats") {
      switchTab("ats-matcher");
      runAtsAnalysis();
    } else if (id === "action_run_google") {
      switchTab("google-copilot");
      runGoogleAudit();
    } else if (id === "action_run_amazon") {
      switchTab("amazon-copilot");
      runAmazonAudit();
    } else if (id === "action_toggle_theme") {
      const toggle = document.getElementById("btn-toggle-theme");
      if (toggle) toggle.click();
    } else if (id === "action_print_pdf") {
      openPrintModal();
    } else if (id === "action_add_job") {
      switchTab("tracker");
      openJobModal();
    }
  }
}

/* ==========================================================================
   MODULE: SLIDE-OUT NAVIGATION & TOOLS DRAWER
   ========================================================================== */
function initSideDrawer() {
  const btnOpen = document.getElementById("btn-open-drawer");
  const btnClose = document.getElementById("btn-close-drawer");
  const overlay = document.getElementById("side-drawer-overlay");
  const searchInput = document.getElementById("drawer-search-input");
  const drawerLinks = document.querySelectorAll(".drawer-link-btn");

  if (!overlay) return;

  function openDrawer() {
    overlay.style.display = "block";
    void overlay.offsetWidth; // Force reflow
    overlay.classList.add("active");

    if (searchInput) {
      searchInput.value = "";
      filterDrawerLinks("");
      setTimeout(() => searchInput.focus(), 120);
    }

    // Sync active state with currentTab
    drawerLinks.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === state.currentTab);
    });

    // Refresh pulse stats
    updatePipelineAnalytics();
  }

  function closeDrawer() {
    overlay.classList.remove("active");
    setTimeout(() => {
      if (!overlay.classList.contains("active")) {
        overlay.style.display = "none";
      }
    }, 280);
  }

  if (btnOpen) btnOpen.addEventListener("click", openDrawer);
  if (btnClose) btnClose.addEventListener("click", closeDrawer);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeDrawer();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      closeDrawer();
    }
  });

  drawerLinks.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      if (targetTab) {
        switchTab(targetTab);
        closeDrawer();
      }
    });
  });

  function filterDrawerLinks(query) {
    const q = query.toLowerCase().trim();
    const sections = document.querySelectorAll(".side-drawer-section");

    sections.forEach(section => {
      const links = section.querySelectorAll(".drawer-link-btn");
      if (links.length === 0) return;

      let visibleCount = 0;
      links.forEach(link => {
        const title = link.querySelector(".drawer-link-title")?.textContent.toLowerCase() || "";
        const sub = link.querySelector(".drawer-link-sub")?.textContent.toLowerCase() || "";
        const matches = !q || title.includes(q) || sub.includes(q);
        link.style.display = matches ? "flex" : "none";
        if (matches) visibleCount++;
      });

      section.style.display = visibleCount > 0 ? "block" : "none";
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      filterDrawerLinks(e.target.value);
    });
  }

  // Quick Action Buttons inside drawer
  const btnCmd = document.getElementById("drawer-btn-cmd");
  const btnExport = document.getElementById("drawer-btn-export");
  const btnTheme = document.getElementById("drawer-btn-theme");
  const btnSettings = document.getElementById("drawer-btn-settings");

  if (btnCmd) {
    btnCmd.addEventListener("click", () => {
      closeDrawer();
      const trigger = document.getElementById("btn-cmd-palette-trigger");
      if (trigger) trigger.click();
    });
  }

  if (btnExport) {
    btnExport.addEventListener("click", () => {
      closeDrawer();
      const trigger = document.getElementById("btn-export-ats-pdf");
      if (trigger) trigger.click();
    });
  }

  if (btnTheme) {
    btnTheme.addEventListener("click", () => {
      const trigger = document.getElementById("btn-toggle-theme");
      if (trigger) trigger.click();
    });
  }

  if (btnSettings) {
    btnSettings.addEventListener("click", () => {
      closeDrawer();
      const trigger = document.getElementById("btn-open-settings");
      if (trigger) trigger.click();
    });
  }
}

/* ==========================================================================
   MODULE: SMART RESUME AUTO-TUNER & SIDE-BY-SIDE DIFF MODAL
   ========================================================================== */
function initAutoTunerModal() {
  const modal = document.getElementById("resume-diff-modal");
  const btnOpen = document.getElementById("btn-open-autotune-diff");
  const btnClose = document.getElementById("btn-close-diff-modal");
  const diffsContainer = document.getElementById("diff-cards-list");
  const btnApplyAll = document.getElementById("btn-apply-all-diffs");
  const btnRejectAll = document.getElementById("btn-reject-all-diffs");

  let activeDiffList = [];

  function openModal() {
    const resumeInput = document.getElementById("ats-resume-input");
    const resumeText = resumeInput?.value || "";

    if (!resumeText.trim()) {
      showToast("Please enter or load a resume first", "warning");
      return;
    }

    const missingSkills = (state.activeAtsAnalysis && state.activeAtsAnalysis.missingSkills)
      ? state.activeAtsAnalysis.missingSkills
      : ["Kubernetes", "AWS", "TypeScript", "Redis"];

    activeDiffList = generateAutoTuneDiffs(resumeText, missingSkills);
    renderDiffCards();
    modal.classList.add("active");
  }

  function closeModal() {
    modal.classList.remove("active");
  }

  function renderDiffCards() {
    if (!diffsContainer) return;
    diffsContainer.innerHTML = "";

    if (activeDiffList.length === 0) {
      diffsContainer.innerHTML = `
        <div style="text-align:center; padding:2rem; color:var(--text-muted);">
          <p style="font-size:1.1rem; font-weight:600;">✨ No critical gaps detected!</p>
          <p style="font-size:0.85rem;">All target canonical skills were found in your resume or no skills to weave.</p>
        </div>
      `;
      return;
    }

    activeDiffList.forEach((diff, idx) => {
      const card = document.createElement("div");
      card.className = "diff-item-card";
      card.innerHTML = `
        <div class="diff-item-header">
          <span class="diff-skill-badge"><span>Target Skill:</span> <strong>${diff.skill}</strong></span>
          <div class="diff-action-buttons">
            <button class="diff-action-btn btn-accept ${diff.accepted ? "active" : ""}" data-idx="${idx}">
              ${diff.accepted ? "✓ Accepted" : "Accept"}
            </button>
            <button class="diff-action-btn btn-reject ${!diff.accepted ? "active" : ""}" data-idx="${idx}">
              ${!diff.accepted ? "✕ Rejected" : "Reject"}
            </button>
          </div>
        </div>
        <div class="diff-columns-wrapper">
          <div class="diff-pane original">
            <div class="diff-pane-label">Original Experience Bullet</div>
            <div class="diff-pane-content">• ${diff.originalText}</div>
          </div>
          <div class="diff-pane tailored">
            <div class="diff-pane-label">Tailored Bullet with Canonical Metric</div>
            <div class="diff-pane-content">• ${diff.diffHtml}</div>
          </div>
        </div>
      `;

      // Accept / Reject event listeners
      const acceptBtn = card.querySelector(".btn-accept");
      const rejectBtn = card.querySelector(".btn-reject");

      acceptBtn.addEventListener("click", () => {
        diff.accepted = true;
        acceptBtn.classList.add("active");
        acceptBtn.textContent = "✓ Accepted";
        rejectBtn.classList.remove("active");
        rejectBtn.textContent = "Reject";
      });

      rejectBtn.addEventListener("click", () => {
        diff.accepted = false;
        rejectBtn.classList.add("active");
        rejectBtn.textContent = "✕ Rejected";
        acceptBtn.classList.remove("active");
        acceptBtn.textContent = "Accept";
      });

      diffsContainer.appendChild(card);
    });
  }

  if (btnOpen) btnOpen.addEventListener("click", openModal);
  if (btnClose) btnClose.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (btnRejectAll) {
    btnRejectAll.addEventListener("click", () => {
      activeDiffList.forEach(d => { d.accepted = false; });
      renderDiffCards();
      showToast("Reset all recommendations to rejected", "info");
    });
  }

  if (btnApplyAll) {
    btnApplyAll.addEventListener("click", () => {
      const acceptedCount = activeDiffList.filter(d => d.accepted).length;
      if (acceptedCount === 0) {
        showToast("No bullets accepted to apply", "warning");
        return;
      }

      const resumeInput = document.getElementById("ats-resume-input");
      const currentResume = resumeInput.value;
      const updatedResume = applyApprovedDiffs(currentResume, activeDiffList);

      resumeInput.value = updatedResume;
      closeModal();
      showToast(`Applied ${acceptedCount} tailored bullet(s) to resume!`, "success");
      runAtsAnalysis();
    });
  }
}

/* ==========================================================================
   MODULE: RECRUITER & HIRING MANAGER OUTREACH PITCH KIT
   ========================================================================== */
function initOutreachModal() {
  const modal = document.getElementById("outreach-pitch-modal");
  const btnOpen = document.getElementById("btn-open-outreach-kit");
  const btnClose = document.getElementById("btn-close-outreach-modal");
  const toneBtns = document.querySelectorAll(".outreach-tone-btn");
  const templatesContainer = document.getElementById("outreach-templates-list");

  let currentTone = "operator";

  function getOutreachContext() {
    const jdText = document.getElementById("ats-jd-input")?.value || "";
    const resumeText = document.getElementById("ats-resume-input")?.value || "";

    // Candidate Name from resume first line
    const firstLine = resumeText.split("\n")[0]?.trim() || "Alex Chen";
    const candidateName = firstLine.length < 35 && !firstLine.includes(":") ? firstLine : "Alex Chen";

    // Target Company & Role detection from JD
    let targetCompany = "Target Company";
    let targetRole = "Senior Software Engineer";

    if (jdText) {
      const companyMatch = jdText.match(/(?:at|for|with|about)\s+([A-Z][A-Za-z0-9\s&]{2,20})/);
      if (companyMatch) targetCompany = companyMatch[1].trim();

      const roleMatch = jdText.match(/(?:Role|Position|Title):\s*([^\n]+)/i) || jdText.match(/Senior [A-Za-z\s]+ Engineer/i);
      if (roleMatch) targetRole = (roleMatch[1] || roleMatch[0]).trim();
    }

    const matchedSkills = (state.activeAtsAnalysis && state.activeAtsAnalysis.matchedSkills && state.activeAtsAnalysis.matchedSkills.length > 0)
      ? state.activeAtsAnalysis.matchedSkills.map(s => s.canonical)
      : ["Distributed Systems", "Cloud Platforms", "TypeScript"];

    return {
      candidateName,
      targetCompany,
      targetRole,
      matchedSkills,
      tone: currentTone
    };
  }

  function renderTemplates() {
    if (!templatesContainer) return;
    const ctx = getOutreachContext();
    const kit = generateOutreachKit(ctx);

    templatesContainer.innerHTML = "";

    const templates = [
      {
        id: "direct_pitch",
        badge: "75-Word Direct Pitch",
        title: "Cold Email to Hiring Manager / Engineering Director",
        sub: "Straight to the point with quantified proof points. Zero corporate filler.",
        content: kit.directPitch
      },
      {
        id: "warm_referral",
        badge: "LinkedIn 1-on-1 Message",
        title: "Warm Referral & Peer Connection Request",
        sub: "Respectful, low-friction message to current engineers on the team.",
        content: kit.referralRequest
      },
      {
        id: "interview_followup",
        badge: "Post-Interview Message",
        title: "Technical Interview Thank-You & Value Anchor",
        sub: "Anchors to technical depth and system trade-offs discussed in the round.",
        content: kit.interviewThankYou
      }
    ];

    templates.forEach(t => {
      const card = document.createElement("div");
      card.className = "outreach-template-card";
      card.innerHTML = `
        <div class="outreach-template-header">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
              <span class="outreach-template-badge">${t.badge}</span>
              <strong style="font-size:0.88rem; color:var(--text-primary);">${t.title}</strong>
            </div>
            <p style="font-size:0.75rem; color:var(--text-muted); margin:0;">${t.sub}</p>
          </div>
          <button class="btn btn-secondary btn-sm btn-copy-outreach" title="Copy to clipboard">
            📋 Copy Pitch
          </button>
        </div>
        <div class="outreach-template-body">${escapeHtml(t.content)}</div>
      `;

      card.querySelector(".btn-copy-outreach").addEventListener("click", () => {
        navigator.clipboard.writeText(t.content);
        showToast(`Copied ${t.badge} to clipboard!`, "success");
      });

      templatesContainer.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function openModal() {
    renderTemplates();
    modal.classList.add("active");
  }

  function closeModal() {
    modal.classList.remove("active");
  }

  if (btnOpen) btnOpen.addEventListener("click", openModal);
  if (btnClose) btnClose.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  toneBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      toneBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentTone = btn.getAttribute("data-tone") || "operator";
      renderTemplates();
    });
  });
}


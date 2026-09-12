/**
 * RESUMETRACKER: AI CAREER & BRAND COPILOT
 * Main Application Orchestrator
 */

import { analyzeAtsMatch, buildStarBullet, generateStarDraftsForSkill } from "./ats-matcher.js";
import { STAR_ACTION_VERBS } from "./taxonomy.js";
import { auditContent, humanizeText, calculateReadability } from "./humanizer.js";
import { HOOK_FORMULAS, buildLinkedInPost, analyzePostStructure } from "./linkedin-engine.js";
import { buildHeadline, buildAboutSection, PROFILE_AUDIT_ITEMS } from "./profile-builder.js";
import { JobTracker, STAGES } from "./tracker.js";
import { GeminiClient } from "./gemini-client.js";

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
  initHumanizer();
  initLinkedInEngine();
  initProfileOptimizer();
  initTracker();
  initSettingsModal();
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

  // Animate circular gauge
  const gaugeNumber = document.getElementById("ats-gauge-score");
  const gaugeProgress = document.getElementById("ats-gauge-circle");
  const gaugeTier = document.getElementById("ats-gauge-tier");

  gaugeNumber.textContent = analysis.score;
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

function renderKanbanBoard(filterQuery = "") {
  const board = document.getElementById("kanban-board-container");
  if (!board) return;
  board.innerHTML = "";

  const allJobs = jobTracker.getAll();

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

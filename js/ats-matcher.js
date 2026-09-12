/**
 * Module 1: Resume & ATS Matcher Engine
 * Calculates canonical gap analysis and ATS Match Score (0-100%)
 * Generates STAR formatted bullet rewrites.
 */

import { extractCanonicalSkills, STAR_ACTION_VERBS } from "./taxonomy.js";

/**
 * Runs full ATS Gap Analysis between candidate resume and job description.
 */
export function analyzeAtsMatch(resumeText, jobDescriptionText) {
  if (!resumeText || !jobDescriptionText) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: [],
      candidateSkills: [],
      jdSkills: [],
      summary: "Please provide both a Candidate Resume and Target Job Description."
    };
  }

  const jdSkills = extractCanonicalSkills(jobDescriptionText);
  const resumeSkills = extractCanonicalSkills(resumeText);

  const resumeCanonicalSet = new Set(resumeSkills.map(s => s.canonical.toLowerCase()));

  const matchedSkills = [];
  const missingSkills = [];

  let totalWeight = 0;
  let earnedWeight = 0;

  jdSkills.forEach(jdSkill => {
    const weight = jdSkill.weight || 1.0;
    totalWeight += weight;

    if (resumeCanonicalSet.has(jdSkill.canonical.toLowerCase())) {
      earnedWeight += weight;
      matchedSkills.push(jdSkill);
    } else {
      missingSkills.push(jdSkill);
    }
  });

  // Calculate weighted score (0 - 100)
  let rawScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;

  // Additional length and keyword coverage heuristic
  const jdLength = jobDescriptionText.trim().split(/\s+/).length;
  const resumeLength = resumeText.trim().split(/\s+/).length;
  if (resumeLength < 100 && jdLength > 150) {
    rawScore = Math.max(10, rawScore * 0.7); // Penalize excessively thin resume
  }

  const matchScore = Math.min(100, Math.round(rawScore));

  // Determine ATS tier
  let statusTier = "Critical Gap";
  let statusColor = "var(--accent-rose)";
  if (matchScore >= 80) {
    statusTier = "Strong ATS Match";
    statusColor = "var(--accent-emerald)";
  } else if (matchScore >= 60) {
    statusTier = "Competitive Match";
    statusColor = "var(--accent-amber)";
  } else if (matchScore >= 40) {
    statusTier = "Moderate Gap";
    statusColor = "var(--accent-amber)";
  }

  // Sort missing skills: hard skills and cloud/devops first
  missingSkills.sort((a, b) => b.weight - a.weight);

  return {
    score: matchScore,
    statusTier,
    statusColor,
    matchedCount: matchedSkills.length,
    missingCount: missingSkills.length,
    totalJdSkills: jdSkills.length,
    matchedSkills,
    missingSkills,
    candidateSkills: resumeSkills,
    jdSkills,
    summary: `${matchedSkills.length} of ${jdSkills.length} canonical requirements detected in resume.`
  };
}

/**
 * Builds a clean STAR method bullet point.
 * Format: [Action Verb] + [Context/Problem] + [Quantifiable Outcome]
 */
export function buildStarBullet({ actionVerb, contextProblem, quantifiableOutcome }) {
  const verb = (actionVerb || "").trim();
  const context = (contextProblem || "").trim();
  const outcome = (quantifiableOutcome || "").trim();

  if (!verb && !context && !outcome) return "";

  // Ensure outcome has punctuation or separator
  let bullet = verb;
  if (context) {
    // Avoid double prepositions
    bullet += ` ${context}`;
  }
  if (outcome) {
    if (!bullet.endsWith(",")) {
      bullet += `, ${outcome}`;
    } else {
      bullet += ` ${outcome}`;
    }
  }

  if (bullet && !bullet.endsWith(".")) {
    bullet += ".";
  }

  return bullet;
}

/**
 * Generates sample STAR rewrite recommendations based on missing critical skills
 */
export function generateStarDraftsForSkill(skillName) {
  const templates = [
    {
      verb: "Architected",
      context: `distributed backend microservices leveraging modern ${skillName} architecture to resolve intermittent pipeline latency`,
      outcome: `slashing API response times by 42% and supporting 1.2M daily active users`
    },
    {
      verb: "Engineered",
      context: `an enterprise-grade automation workflow integrating ${skillName} across 14 internal staging environments`,
      outcome: `reducing deployment cycle times by 65% while maintaining zero downtime`
    },
    {
      verb: "Refactored",
      context: `legacy data ingestion pipelines to adopt canonical ${skillName} standards`,
      outcome: `cutting AWS infrastructure compute spend by $24,000 annually`
    }
  ];

  // Clean any accidental banned words just in case
  return templates.map(t => ({
    verb: t.verb,
    context: t.context.replace(/\bleveraging\b/gi, "using"),
    outcome: t.outcome,
    preview: buildStarBullet({
      actionVerb: t.verb,
      contextProblem: t.context.replace(/\bleveraging\b/gi, "using"),
      quantifiableOutcome: t.outcome
    })
  }));
}

/**
 * Generates rich HTML with color-coded heatmap highlights for matched skills & AI slop.
 */
export function generateResumeHeatmapHtml(resumeText, matchedSkills = [], bannedWords = []) {
  if (!resumeText) return "<em>Paste or upload a resume to view the live heatmap...</em>";

  // Escape basic HTML
  let html = resumeText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Highlight matched canonical skills (Emerald)
  matchedSkills.forEach(s => {
    const rawPattern = s.rawMatch || s.canonical;
    const escaped = rawPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b(${escaped})\\b`, "gi");
    html = html.replace(regex, `<span class="heatmap-match" title="Verified Skill: ${s.canonical}">$1</span>`);
  });

  // Highlight AI slop words (Rose line-through)
  bannedWords.forEach(word => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b(${escaped})\\b`, "gi");
    html = html.replace(regex, `<span class="heatmap-slop" title="AI Buzzword / Corporate Slop: '$1'">$1</span>`);
  });

  return html;
}

/**
 * Formats raw resume text into ATS-Compliant Single-Column Printable Layout
 */
export function generateAtsPrintHtml(resumeText) {
  if (!resumeText || !resumeText.trim()) return "<p>No resume content provided.</p>";

  const lines = resumeText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const name = lines[0] || "Candidate Name";
  const contact = lines.length > 1 && (lines[1].includes("@") || lines[1].includes("Email") || lines[1].includes("|"))
    ? lines[1]
    : "Email: candidate@example.com | Phone: (555) 019-2834 | LinkedIn: linkedin.com/in/candidate";

  const remainingLines = lines.slice(contact === lines[1] ? 2 : 1);

  let bodyHtml = "";
  let inBulletList = false;

  remainingLines.forEach(line => {
    const isSectionHeader = /^(summary|professional experience|experience|technical skills|skills|education|projects|certifications):?$/i.test(line)
      || (/^[A-Z\s]{4,25}:?$/.test(line) && !line.includes("@") && !line.startsWith("-"));

    const isBullet = line.startsWith("-") || line.startsWith("•") || line.startsWith("*");

    if (isSectionHeader) {
      if (inBulletList) {
        bodyHtml += "</ul>";
        inBulletList = false;
      }
      bodyHtml += `
        <div class="ats-print-section">
          <div class="ats-print-section-title">${line.replace(/:$/, "")}</div>
      `;
    } else if (isBullet) {
      if (!inBulletList) {
        bodyHtml += `<ul class="ats-print-bullets">`;
        inBulletList = true;
      }
      const bulletText = line.replace(/^[-•*]\s*/, "");
      bodyHtml += `<li>${bulletText}</li>`;
    } else {
      if (inBulletList) {
        bodyHtml += "</ul>";
        inBulletList = false;
      }
      // Check if line looks like a job title / company / dates
      if (line.includes("|") || line.includes(" - ") || /\b(20\d\d|19\d\d|Present)\b/i.test(line)) {
        bodyHtml += `<div class="ats-print-job"><div class="ats-print-job-header"><span>${line}</span></div></div>`;
      } else {
        bodyHtml += `<p style="margin-bottom:0.4rem; font-size:10pt;">${line}</p>`;
      }
    }
  });

  if (inBulletList) {
    bodyHtml += "</ul>";
  }

  return `
    <div class="ats-print-header">
      <div class="ats-print-name">${name}</div>
      <div class="ats-print-contact">${contact}</div>
    </div>
    <div class="ats-print-body">
      ${bodyHtml}
    </div>
  `;
}

/**
 * Calculates print page budget and line overflow warning
 */
export function calculateResumePageBudget(resumeText) {
  if (!resumeText || !resumeText.trim()) {
    return {
      lineCount: 0,
      bulletCount: 0,
      pageEstimate: 0,
      status: "Empty",
      message: "No resume text provided",
      badgeClass: "badge-neutral"
    };
  }

  const rawLines = resumeText.split("\n").map(l => l.trim()).filter(Boolean);
  let effectiveLines = 0;
  let bulletCount = 0;

  rawLines.forEach(line => {
    if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
      bulletCount++;
      // Long bullets wrap to 2 or 3 lines on letter page with standard margins
      effectiveLines += Math.max(1, Math.ceil(line.length / 85));
    } else if (/^[A-Z\s]{4,25}:?$/.test(line) || /^(summary|experience|skills|education):?$/i.test(line)) {
      effectiveLines += 2; // Header + spacing
    } else {
      effectiveLines += Math.max(1, Math.ceil(line.length / 90));
    }
  });

  // Standard ATS 1-page budget threshold: ~44-48 effective print lines
  const MAX_ONE_PAGE = 48;
  const MAX_TWO_PAGE = 96;

  if (effectiveLines <= MAX_ONE_PAGE) {
    const remaining = MAX_ONE_PAGE - effectiveLines;
    return {
      lineCount: effectiveLines,
      bulletCount,
      pageEstimate: 1,
      status: "Optimal 1-Page Layout",
      message: `Fits cleanly on 1 page (${effectiveLines} / ${MAX_ONE_PAGE} lines. ${remaining} lines of budget left).`,
      badgeClass: "badge-success"
    };
  } else if (effectiveLines <= MAX_ONE_PAGE + 8) {
    const overflow = effectiveLines - MAX_ONE_PAGE;
    return {
      lineCount: effectiveLines,
      bulletCount,
      pageEstimate: 1.2,
      status: "Minor Spill Risk",
      message: `⚠️ Spilling ${overflow} lines onto a 2nd page! Tighten 1-2 bullets to fit cleanly on 1 page.`,
      badgeClass: "badge-warning"
    };
  } else if (effectiveLines <= MAX_TWO_PAGE) {
    return {
      lineCount: effectiveLines,
      bulletCount,
      pageEstimate: 2,
      status: "Solid 2-Page Layout",
      message: `Clean 2-page senior executive layout (${effectiveLines} lines).`,
      badgeClass: "badge-cyan"
    };
  } else {
    return {
      lineCount: effectiveLines,
      bulletCount,
      pageEstimate: 3,
      status: "Excessive Length",
      message: `⚠️ Over 2 pages (${effectiveLines} lines). Cut low-relevance bullets.`,
      badgeClass: "badge-danger"
    };
  }
}


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

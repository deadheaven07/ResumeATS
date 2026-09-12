/**
 * RESUMETRACKER: SCORING EXPLAINER & CONFIDENCE ENGINE
 * Decomposes black-box ATS predictions into transparent mathematical pillars.
 * Calculates predictive confidence and generates actionable improvement roadmaps.
 */

export function calculateConfidenceScore({ jdText, resumeText, jdSkillsCount, resumeLength }) {
  const jdWords = (jdText || "").trim().split(/\s+/).filter(Boolean).length;
  const resumeWords = (resumeText || "").trim().split(/\s+/).filter(Boolean).length;

  let confidenceScore = 50; // Base

  // JD Depth Signal (Up to +25)
  if (jdWords >= 250) confidenceScore += 15;
  else if (jdWords >= 120) confidenceScore += 8;

  if (jdSkillsCount >= 10) confidenceScore += 10;
  else if (jdSkillsCount >= 5) confidenceScore += 5;

  // Resume Depth Signal (Up to +25)
  if (resumeWords >= 300) confidenceScore += 15;
  else if (resumeWords >= 150) confidenceScore += 8;

  if (resumeWords >= 200 && jdWords >= 150 && jdSkillsCount >= 6) {
    confidenceScore += 10;
  }

  confidenceScore = Math.min(Math.max(confidenceScore, 35), 98);

  let level = "Moderate";
  let explanation = "";

  if (confidenceScore >= 82) {
    level = "High";
    explanation = `High statistical confidence (${confidenceScore}%): Deep evaluation across ${jdSkillsCount} canonical JD requirements and ${resumeWords} words.`;
  } else if (confidenceScore >= 60) {
    level = "Moderate";
    explanation = `Moderate confidence (${confidenceScore}%): Evaluation grounded in ${jdSkillsCount} detected requirements. Adding more specific JD details increases accuracy.`;
  } else {
    level = "Low";
    explanation = `Low confidence (${confidenceScore}%): Target JD or resume is concise (${jdWords} words in JD). Paste full requirements for enterprise ATS precision.`;
  }

  return {
    score: confidenceScore,
    level,
    explanation
  };
}

export function decomposeAtsScore({
  matchedSkills = [],
  missingSkills = [],
  slopCount = 0,
  hasMetrics = false,
  metricsCount = 0,
  actionVerbCount = 0,
  strictness = "standard"
}) {
  const totalRequired = matchedSkills.length + missingSkills.length;
  const hardSkillRatio = totalRequired > 0 ? matchedSkills.length / totalRequired : 0;

  // Strictness multipliers
  const hardSkillWeight = strictness === "faang" ? 50 : 45;
  const titleSeniorityWeight = strictness === "faang" ? 25 : 20;
  const starImpactWeight = strictness === "faang" ? 25 : 20;

  // Pillar 1: Canonical Hard Skills
  const hardSkillScore = Math.round(hardSkillRatio * hardSkillWeight);

  // Pillar 2: Title, Scope & Seniority Alignment
  let titleScore = Math.min(Math.round((matchedSkills.length >= 6 ? 1 : matchedSkills.length / 6) * titleSeniorityWeight), titleSeniorityWeight);

  // Pillar 3: STAR Impact & Quantifiable Results Density
  const verbFactor = Math.min(actionVerbCount / 6, 1);
  const metricFactor = Math.min(metricsCount / 4, 1);
  const starImpactScore = Math.round((verbFactor * 0.5 + metricFactor * 0.5) * starImpactWeight);

  // Pillar 4: AI Slop & Buzzword Penalty
  const slopPenalty = Math.min(slopCount * 3, 15);

  // Composite raw score
  let rawScore = hardSkillScore + titleScore + starImpactScore - slopPenalty;
  const finalScore = Math.min(Math.max(rawScore, 0), 100);

  const pillars = [
    {
      id: "hard_skills",
      name: "Canonical Hard Skills Match",
      weight: `${hardSkillWeight}%`,
      earned: hardSkillScore,
      max: hardSkillWeight,
      status: hardSkillRatio >= 0.75 ? "Optimal" : hardSkillRatio >= 0.5 ? "Acceptable" : "Critical Gap",
      description: `${matchedSkills.length} of ${totalRequired} core technical skills verified via O*NET/Lightcast taxonomy.`
    },
    {
      id: "seniority_scope",
      name: "Role & Seniority Breadth",
      weight: `${titleSeniorityWeight}%`,
      earned: titleScore,
      max: titleSeniorityWeight,
      status: titleScore >= titleSeniorityWeight * 0.7 ? "Optimal" : "Needs Expansion",
      description: "Evaluation of architecture, systems scope, and seniority depth signals across experience."
    },
    {
      id: "star_metrics",
      name: "STAR & Quantifiable Outcome Density",
      weight: `${starImpactWeight}%`,
      earned: starImpactScore,
      max: starImpactWeight,
      status: starImpactScore >= starImpactWeight * 0.7 ? "Optimal" : "Needs Metrics",
      description: `Detected ${actionVerbCount} strong action verbs and ${metricsCount} quantifiable outcomes (%, $, latency, scale).`
    },
    {
      id: "ai_slop_penalty",
      name: "Anti-AI Slop & Tone Audit",
      weight: "-15% max",
      earned: slopPenalty === 0 ? 0 : -slopPenalty,
      max: 0,
      status: slopPenalty === 0 ? "Clean Human Tone" : "Penalty Applied",
      description: slopPenalty === 0 
        ? "Zero corporate buzzwords or generative AI fluff detected."
        : `Deducted ${slopPenalty} points for ${slopCount} flagged buzzwords (delve, leverage, spearhead, etc.).`
    }
  ];

  // Actionable Top Recommendations to bridge score gap
  const recommendations = [];
  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 3).map(s => s.canonical || s).join(", ");
    recommendations.push(`Incorporate high-salience missing skills into recent project bullets: ${topMissing}.`);
  }
  if (metricsCount < 3) {
    recommendations.push("Quantify outcomes in at least 3 bullets with percentages, latency reductions, or dollar savings.");
  }
  if (slopPenalty > 0) {
    recommendations.push("Use the 1-click Anti-AI Humanizer to replace flagged buzzwords with conversational engineering verbs.");
  }

  return {
    finalScore,
    pillars,
    recommendations,
    slopPenalty,
    summaryExplanation: `Final ATS Score of ${finalScore}% comprises ${hardSkillScore}/${hardSkillWeight} pts from Hard Skills, ${titleScore}/${titleSeniorityWeight} pts from Seniority/Scope, and ${starImpactScore}/${starImpactWeight} pts from STAR Metrics${slopPenalty > 0 ? `, with a -${slopPenalty} pts AI slop penalty` : ""}.`
  };
}

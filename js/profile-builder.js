/**
 * Module 4: Profile Conversion Optimizer
 * Builds high-converting LinkedIn headlines and 3-part About sections.
 */

import { humanizeText } from "./humanizer.js";

/**
 * Builds standard high-conversion LinkedIn headline.
 * Formula: [Primary Role] helping [Target Audience] achieve [Specific Result] | [Key Tech Stack / Credential]
 */
export function buildHeadline({ primaryRole, targetAudience, specificResult, keyTechStack }) {
  const role = (primaryRole || "").trim();
  const audience = (targetAudience || "").trim();
  const result = (specificResult || "").trim();
  const tech = (keyTechStack || "").trim();

  let headline = "";

  if (role && audience && result) {
    headline = `${role} helping ${audience} achieve ${result}`;
  } else if (role && result) {
    headline = `${role} focused on ${result}`;
  } else {
    headline = role || "Senior Software Engineer";
  }

  if (tech) {
    headline += ` | ${tech}`;
  }

  const clean = humanizeText(headline);
  const charCount = clean.length;
  const isOverLimit = charCount > 220; // LinkedIn character limit

  return {
    headline: clean,
    charCount,
    maxLimit: 220,
    isOverLimit,
    remaining: 220 - charCount
  };
}

/**
 * Builds 3-Part LinkedIn About section
 * Part 1: The Core Thesis (What you believe/solve)
 * Part 2: Career Proof Points (Key metrics, scaled systems, impact)
 * Part 3: Call-to-Action (How to reach out / work together)
 */
export function buildAboutSection({ coreThesis, proofPoints, cta }) {
  const thesis = (coreThesis || "").trim();
  const rawProofs = Array.isArray(proofPoints) ? proofPoints : [proofPoints];
  const callToAction = (cta || "").trim();

  let formatted = "";

  // Part 1: The Core Thesis
  if (thesis) {
    formatted += `${thesis}\n\n`;
  }

  // Part 2: Career Proof Points
  if (rawProofs.length > 0 && rawProofs.some(p => p && p.trim())) {
    formatted += `Key Career Proof Points:\n`;
    rawProofs.forEach(point => {
      if (point && point.trim()) {
        const cleanPoint = point.trim().replace(/^[-*•]\s*/, "");
        formatted += `• ${cleanPoint}\n`;
      }
    });
    formatted += `\n`;
  }

  // Part 3: Call-to-Action
  if (callToAction) {
    formatted += `How to connect:\n${callToAction}`;
  }

  return humanizeText(formatted.trim());
}

/**
 * Audit checklist for LinkedIn Profile Conversion Readiness
 */
export const PROFILE_AUDIT_ITEMS = [
  { id: "custom_url", label: "Custom LinkedIn URL claimed (e.g., /in/firstname-lastname)", weight: 10 },
  { id: "action_headline", label: "Headline follows value-proposition formula (<220 chars)", weight: 20 },
  { id: "structured_about", label: "About section follows 3-part structure (Thesis, Proof, CTA)", weight: 25 },
  { id: "quant_bullets", label: "Experience bullets use STAR format with quantifiable metrics", weight: 25 },
  { id: "creator_mode", label: "Featured section highlights top 2-3 projects or high-performing posts", weight: 10 },
  { id: "no_ai_slop", label: "Zero generic AI buzzwords ('passionate', 'delve', 'spearhead')", weight: 10 }
];

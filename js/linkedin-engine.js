/**
 * Module 3: LinkedIn Thought Leadership & Hook Engine
 * High-impact hook templates, character sweet spot counter, and first-comment link staging.
 */

import { humanizeText } from "./humanizer.js";

export const HOOK_FORMULAS = {
  false_binary: {
    id: "false_binary",
    name: "False Binary Dissolve",
    description: "Breaks a false dichotomy to position you as a nuanced systems thinker.",
    template: (x, y, z) => `Everyone argues ${x || "[Option A]"} vs ${y || "[Option B]"}.\nThe real problem is ${z || "[The Nuanced Core Root Cause]"}.`,
    fields: [
      { id: "x", label: "Polarized Option A (e.g., Microservices)", placeholder: "Microservices" },
      { id: "y", label: "Polarized Option B (e.g., Monoliths)", placeholder: "Monoliths" },
      { id: "z", label: "The Deeper Root Truth (e.g., Org Boundary Alignment)", placeholder: "Organizational team boundary alignment" }
    ]
  },
  yoy_pivot: {
    id: "yoy_pivot",
    name: "Year-over-Year Pivot",
    description: "Highlights rapid maturity, seasoned experience, and evolution in thinking.",
    template: (pastYear, x, targetYear, y) => `In ${pastYear || "2023"}, I prioritized ${x || "[Vanity Metric / Tool]"}.\nIn ${targetYear || "2026"}, I only care about ${y || "[High-Leverage Business Outcome]"}.`,
    fields: [
      { id: "pastYear", label: "Past Year", placeholder: "2023" },
      { id: "x", label: "What you used to prioritize", placeholder: "writing 10,000 lines of complex code" },
      { id: "targetYear", label: "Current/Target Year", placeholder: "2026" },
      { id: "y", label: "What you actually prioritize now", placeholder: "deleting unnecessary systems and improving time-to-first-commit" }
    ]
  },
  scarce_math: {
    id: "scarce_math",
    name: "The Scarce-Shots Math",
    description: "Transforms an everyday metric into counter-intuitive, eye-opening math.",
    template: (metric, denominator, conclusion) => `A single engineer gets roughly ${metric || "4 deep work hours"} a day.\nOver a 200-day engineering year, that is only ${denominator || "800 focused hours"} to ship your entire roadmap.\n\n${conclusion || "Here is how our team stopped squandering 50% of them on unnecessary status meetings:"}`,
    fields: [
      { id: "metric", label: "Core Daily/Weekly Metric", placeholder: "4 deep work hours" },
      { id: "denominator", label: "Annualized Constraint Breakdown", placeholder: "800 focused engineering hours" },
      { id: "conclusion", label: "Counter-Intuitive Takeaway / Hook Hook", placeholder: "Here is why our team eliminated 60% of our synchronization meetings:" }
    ]
  }
};

/**
 * Builds a complete LinkedIn post from hook, story/proof points, and call-to-action
 */
export function buildLinkedInPost({ hookFormulaId, fieldValues, rawContent, ctaText }) {
  const formula = HOOK_FORMULAS[hookFormulaId] || HOOK_FORMULAS.false_binary;

  let hook = "";
  if (hookFormulaId === "false_binary") {
    hook = formula.template(fieldValues.x, fieldValues.y, fieldValues.z);
  } else if (hookFormulaId === "yoy_pivot") {
    hook = formula.template(fieldValues.pastYear, fieldValues.x, fieldValues.targetYear, fieldValues.y);
  } else if (hookFormulaId === "scarce_math") {
    hook = formula.template(fieldValues.metric, fieldValues.denominator, fieldValues.conclusion);
  }

  // Story & Proof points
  const story = (rawContent || "").trim();

  // CTA
  const cta = (ctaText || "").trim();

  let post = `${hook}\n\n`;
  if (story) {
    post += `${story}\n\n`;
  }
  if (cta) {
    post += `${cta}`;
  }

  // Ensure humanizer cleanups are applied
  return humanizeText(post.trim());
}

/**
 * Evaluates LinkedIn post length & structure against best practices
 */
export function analyzePostStructure(postText) {
  if (!postText) {
    return {
      charCount: 0,
      wordCount: 0,
      lineCount: 0,
      firstTwoLines: "",
      remainingLines: "",
      isLengthOptimal: false,
      lengthStatus: "Empty",
      lengthFeedback: "Target length: 900–1,300 characters for maximum algorithmic engagement."
    };
  }

  const charCount = postText.length;
  const wordCount = postText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const lines = postText.split("\n");

  const firstTwoLines = lines.slice(0, 2).join("\n");
  const remainingLines = lines.slice(2).join("\n");

  let isLengthOptimal = false;
  let lengthStatus = "Too Short";
  let lengthFeedback = "";

  if (charCount < 400) {
    lengthStatus = "Under-developed (<400 chars)";
    lengthFeedback = "Add 2–3 concrete career proof points or tactical examples to reach optimal engagement depth.";
  } else if (charCount < 900) {
    lengthStatus = "Moderate (400–899 chars)";
    lengthFeedback = "Solid, but approaching the 900–1,300 sweet spot will yield higher dwell time.";
  } else if (charCount <= 1300) {
    isLengthOptimal = true;
    lengthStatus = "Sweet Spot (900–1,300 chars)";
    lengthFeedback = "Optimal length! Balances dwell time and scannability perfectly.";
  } else if (charCount <= 1800) {
    lengthStatus = "Long (1,301–1,800 chars)";
    lengthFeedback = "Slightly long. Consider trimming non-essential context for higher completion rates.";
  } else {
    lengthStatus = "Very Long (>1,800 chars)";
    lengthFeedback = "Warning: Reader fatigue drops engagement sharply past 1,800 characters.";
  }

  return {
    charCount,
    wordCount,
    lineCount: lines.length,
    firstTwoLines,
    remainingLines,
    isLengthOptimal,
    lengthStatus,
    lengthFeedback
  };
}

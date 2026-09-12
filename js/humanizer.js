/**
 * Module 2: Anti-AI Humanizer Engine
 * Real-time linter, slop detector, readability grader, and formatting auditor.
 */

// Banned AI Buzzwords and their natural human alternatives
export const BANNED_PATTERNS = [
  { term: "delve", replacement: "explore / examine" },
  { term: "leverage", replacement: "use / apply" },
  { term: "supercharge", replacement: "accelerate / boost" },
  { term: "game-changer", replacement: "major shift / decisive improvement" },
  { term: "spearhead", replacement: "led / directed" },
  { term: "testaments", replacement: "evidence / proof" },
  { term: "testament", replacement: "evidence / proof" },
  { term: "beacon", replacement: "guide / model" },
  { term: "tapestry", replacement: "mix / framework" },
  { term: "key takeaway", replacement: "main point / bottom line" },
  { term: "key takeaways", replacement: "main points / findings" },
  { term: "excited to announce", replacement: "happy to share / we just shipped" },
  { term: "in today's fast-paced world", replacement: "today / currently" },
  { term: "in today's fast-paced digital landscape", replacement: "right now / across the industry" },
  { term: "navigating", replacement: "handling / working through" },
  { term: "harness", replacement: "use / direct" },
  { term: "realm", replacement: "domain / field" },
  { term: "paramount", replacement: "vital / critical" },
  { term: "revolutionize", replacement: "substantially overhaul / modernize" },
  { term: "synergy", replacement: "coordination / teamwork" },
  { term: "cutting-edge", replacement: "modern / recent" },
  { term: "plethora", replacement: "range / many" }
];

export const FORBIDDEN_EMOJIS = ["🚀", "🔥"];

/**
 * Calculates Flesch-Kincaid & Coleman-Liau reading grade level
 */
export function calculateReadability(text) {
  if (!text || text.trim().length === 0) {
    return { gradeLevel: 0, gradeName: "N/A", status: "Neutral" };
  }

  const clean = text.trim();
  const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = clean.split(/\s+/).filter(w => w.length > 0);
  const letters = clean.replace(/[^a-zA-Z]/g, "").length;

  const numSentences = Math.max(1, sentences.length);
  const numWords = Math.max(1, words.length);

  // Coleman-Liau Formula: 0.0588 * L - 0.296 * S - 15.8
  // L = average number of letters per 100 words
  // S = average number of sentences per 100 words
  const L = (letters / numWords) * 100;
  const S = (numSentences / numWords) * 100;
  const colemanLiau = Math.round((0.0588 * L - 0.296 * S - 15.8) * 10) / 10;

  // Grade target: 8th - 10th grade
  const grade = Math.max(1, Math.min(18, Math.round(colemanLiau)));

  let status = "Optimal (8th–10th Grade)";
  let badgeClass = "badge-success";

  if (grade < 7) {
    status = "Very Simple (<7th Grade)";
    badgeClass = "badge-neutral";
  } else if (grade > 11) {
    status = "Academic / Complex (>11th Grade)";
    badgeClass = "badge-warning";
  }

  return {
    grade,
    gradeLevel: grade,
    rawScore: colemanLiau,
    status,
    badgeClass,
    words: numWords,
    sentences: numSentences
  };
}

/**
 * Detects robotic staccato fragment stacks (e.g. "Think fast. Act faster. Win big.")
 */
export function detectStaccatoStacks(text) {
  if (!text) return [];

  // Match sequences of 3 or more short sentences (1-4 words each) ending in periods/exclamations
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const flags = [];

  for (let i = 0; i <= sentences.length - 3; i++) {
    const s1 = sentences[i].trim();
    const s2 = sentences[i + 1].trim();
    const s3 = sentences[i + 2].trim();

    const w1 = s1.split(/\s+/).length;
    const w2 = s2.split(/\s+/).length;
    const w3 = s3.split(/\s+/).length;

    if (w1 <= 4 && w2 <= 4 && w3 <= 4) {
      flags.push({
        snippet: `${s1} ${s2} ${s3}`,
        reason: "Robotic staccato fragment stack detected (3+ ultra-short sentences back-to-back)."
      });
      i += 2; // skip forward
    }
  }

  return flags;
}

/**
 * Counts and validates emojis against rules
 */
export function auditEmojis(text) {
  if (!text) return { count: 0, hasForbidden: false, forbiddenList: [], allEmojis: [] };

  // Emoji regex
  const emojiRegex = /[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}]/gu;
  const matches = text.match(emojiRegex) || [];

  const forbiddenFound = matches.filter(e => FORBIDDEN_EMOJIS.includes(e));

  return {
    count: matches.length,
    hasForbidden: forbiddenFound.length > 0,
    forbiddenList: [...new Set(forbiddenFound)],
    allEmojis: matches,
    isValid: matches.length <= 2 && forbiddenFound.length === 0
  };
}

/**
 * Counts em-dashes (—)
 */
export function auditEmDashes(text) {
  if (!text) return { count: 0, isValid: true };
  const matches = text.match(/—|--/g) || [];
  return {
    count: matches.length,
    isValid: matches.length <= 1
  };
}

/**
 * Comprehensive Humanizer Audit
 */
export function auditContent(text) {
  if (!text || text.trim().length === 0) {
    return {
      isValid: true,
      slopMatches: [],
      emDashAudit: { count: 0, isValid: true },
      emojiAudit: { count: 0, isValid: true, hasForbidden: false, forbiddenList: [] },
      staccatoFlags: [],
      readability: { grade: 0, status: "N/A" },
      totalViolations: 0
    };
  }

  const slopMatches = [];
  for (const item of BANNED_PATTERNS) {
    const escaped = item.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    let match;
    while ((match = regex.exec(text)) !== null) {
      slopMatches.push({
        word: match[0],
        term: item.term,
        replacement: item.replacement,
        index: match.index
      });
    }
  }

  const emDashAudit = auditEmDashes(text);
  const emojiAudit = auditEmojis(text);
  const staccatoFlags = detectStaccatoStacks(text);
  const readability = calculateReadability(text);

  let violations = slopMatches.length;
  if (!emDashAudit.isValid) violations += 1;
  if (!emojiAudit.isValid) violations += 1;
  if (staccatoFlags.length > 0) violations += staccatoFlags.length;
  if (readability.grade > 11) violations += 1;

  return {
    isValid: violations === 0,
    totalViolations: violations,
    slopMatches,
    emDashAudit,
    emojiAudit,
    staccatoFlags,
    readability
  };
}

/**
 * Automatically applies humanized replacements to clean up the text
 */
export function humanizeText(text) {
  if (!text) return "";

  let cleaned = text;

  // 1. Replace banned words
  for (const item of BANNED_PATTERNS) {
    const escaped = item.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    const primaryReplacement = item.replacement.split(" / ")[0];
    cleaned = cleaned.replace(regex, (match) => {
      // Preserve uppercase if original started uppercase
      if (match[0] === match[0].toUpperCase()) {
        return primaryReplacement.charAt(0).toUpperCase() + primaryReplacement.slice(1);
      }
      return primaryReplacement;
    });
  }

  // 2. Strip forbidden emojis (🚀, 🔥)
  cleaned = cleaned.replace(/🚀|🔥/gu, "");

  // 3. Cap em-dashes: keep only the first em-dash, replace remainder with commas or semicolons
  let dashCount = 0;
  cleaned = cleaned.replace(/—|--/g, () => {
    dashCount++;
    if (dashCount > 1) {
      return ",";
    }
    return "—";
  });

  return cleaned.trim();
}

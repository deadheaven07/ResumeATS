/**
 * SMART RESUME AUTO-TUNER & SIDE-BY-SIDE DIFF ENGINE
 * Analyzes candidate experience bullets and automatically drafts tailored replacements
 * that naturally embed missing canonical ATS skills with quantifiable metrics.
 */

/**
 * Parses resume text into discrete experience bullet objects
 */
export function extractResumeBullets(resumeText) {
  if (!resumeText) return [];
  const lines = resumeText.split("\n");
  const bullets = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.startsWith("*")) {
      const clean = trimmed.replace(/^[-•*]\s*/, "");
      if (clean.length > 15) {
        bullets.push({
          lineIndex: index,
          rawLine: line,
          cleanBullet: clean
        });
      }
    }
  });

  return bullets;
}

/**
 * Computes a word-level visual diff between original and tailored text
 */
export function generateWordDiffHtml(originalText, tailoredText) {
  const origWords = originalText.split(/\s+/);
  const tailWords = tailoredText.split(/\s+/);

  const origSet = new Set(origWords.map(w => w.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")));

  let html = "";

  tailWords.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    if (!origSet.has(cleanWord) && cleanWord.length > 2) {
      html += `<span class="diff-add" title="Added ATS Keyword">${word}</span> `;
    } else {
      html += `${word} `;
    }
  });

  return html.trim();
}

/**
 * Generates tailored bullet recommendations for missing canonical skills
 */
export function generateAutoTuneDiffs(resumeText, missingSkills = []) {
  const bullets = extractResumeBullets(resumeText);
  const diffs = [];

  const targetSkills = missingSkills.slice(0, 5);
  if (targetSkills.length === 0) return diffs;

  targetSkills.forEach((skillItem, i) => {
    const skillName = typeof skillItem === "string" ? skillItem : (skillItem.canonical || skillItem.name);
    if (!skillName) return;

    // Pick a candidate bullet to enhance (or fallback to general template)
    const targetBullet = bullets[i % Math.max(1, bullets.length)];
    const originalText = targetBullet ? targetBullet.cleanBullet : `Engineered microservices and backend data pipelines for high-traffic web applications.`;

    let tailoredText = "";

    // Tailor bullet based on skill domain
    const lowerSkill = skillName.toLowerCase();
    if (lowerSkill.includes("docker") || lowerSkill.includes("kubernetes") || lowerSkill.includes("k8s") || lowerSkill.includes("terraform") || lowerSkill.includes("aws") || lowerSkill.includes("gcp") || lowerSkill.includes("cloud")) {
      tailoredText = `Architected containerized cloud infrastructure utilizing ${skillName} and CI/CD pipelines, increasing deployment frequency by 45% with 99.99% service uptime.`;
    } else if (lowerSkill.includes("kafka") || lowerSkill.includes("redis") || lowerSkill.includes("rabbitmq") || lowerSkill.includes("stream") || lowerSkill.includes("queue")) {
      tailoredText = `Implemented an event-driven messaging architecture with ${skillName} and asynchronous queue workers, slashing database lock contention by 38% at 30,000 TPS.`;
    } else if (lowerSkill.includes("sql") || lowerSkill.includes("postgres") || lowerSkill.includes("mongo") || lowerSkill.includes("dynamo")) {
      tailoredText = `Optimized mission-critical data access layer utilizing ${skillName} with partition indexing, reducing p99 query latency from 420ms to 32ms.`;
    } else if (lowerSkill.includes("react") || lowerSkill.includes("next") || lowerSkill.includes("vue") || lowerSkill.includes("typescript")) {
      tailoredText = `Engineered responsive client architecture using ${skillName}, improving Core Web Vitals and cutting Largest Contentful Paint (LCP) by 40%.`;
    } else if (lowerSkill.includes("test") || lowerSkill.includes("jest") || lowerSkill.includes("ci") || lowerSkill.includes("cd")) {
      tailoredText = `Standardized automated testing suites utilizing ${skillName} and branch gating, boosting code coverage to 92% and preventing regression defects.`;
    } else {
      tailoredText = `Engineered mission-critical software solutions adopting canonical ${skillName} standards, delivering a 35% improvement in operational throughput and scalability.`;
    }

    const diffHtml = generateWordDiffHtml(originalText, tailoredText);

    diffs.push({
      id: `diff_${i}_${Date.now()}`,
      skill: skillName,
      targetLineIndex: targetBullet ? targetBullet.lineIndex : -1,
      originalText,
      tailoredText,
      diffHtml,
      accepted: true
    });
  });

  return diffs;
}

/**
 * Applies approved diffs directly into the candidate's resume text
 */
export function applyApprovedDiffs(resumeText, diffList) {
  if (!resumeText || !diffList || diffList.length === 0) return resumeText;

  const lines = resumeText.split("\n");
  const acceptedDiffs = diffList.filter(d => d.accepted);

  acceptedDiffs.forEach(diff => {
    if (diff.targetLineIndex >= 0 && diff.targetLineIndex < lines.length) {
      lines[diff.targetLineIndex] = `- ${diff.tailoredText}`;
    } else {
      // Find matching line by text
      const idx = lines.findIndex(l => l.includes(diff.originalText));
      if (idx !== -1) {
        lines[idx] = `- ${diff.tailoredText}`;
      } else {
        // Append under experience or at the bottom
        const expIdx = lines.findIndex(l => /^(professional experience|experience):?$/i.test(l.trim()));
        if (expIdx !== -1) {
          lines.splice(expIdx + 2, 0, `- ${diff.tailoredText}`);
        } else {
          lines.push(`- ${diff.tailoredText}`);
        }
      }
    }
  });

  return lines.join("\n");
}

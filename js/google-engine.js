/**
 * GOOGLE CAREERS & PROFILE COPILOT ENGINE
 * Powered by Google's Laszlo Bock XYZ Formula and Google Engineering Leveling Rubrics.
 */

import { extractCanonicalSkills } from "./taxonomy.js";

// Google Core Technical Taxonomy (High-value keywords for Google Engineering ATS)
export const GOOGLE_TECH_TAXONOMY = [
  "Distributed Systems", "System Design", "Scalability", "High Availability",
  "Fault Tolerance", "Concurrency", "Multithreading", "Memory Management",
  "Algorithms", "Data Structures", "Big-O Analysis", "C++", "Go (Golang)",
  "Java", "Python", "Google Cloud Platform (GCP)", "Kubernetes (K8s)",
  "gRPC", "Protocol Buffers (Protobuf)", "Microservices Architecture",
  "PostgreSQL", "Spanner", "BigQuery", "Redis", "Kafka", "Linux",
  "CI/CD Pipelines", "Observability", "Prometheus", "Grafana",
  "Machine Learning (ML)", "Generative AI & LLMs", "Site Reliability Engineering (SRE)"
];

// Curated Google Engineering Job Profiles
export const GOOGLE_JOB_PROFILES = [
  {
    id: "google_swe_l5",
    title: "Google Senior Software Engineer (L5) - Distributed Systems & Cloud Platforms",
    level: "L5 (Senior)",
    overview: "Architect, develop, and scale mission-critical distributed systems and backend cloud infrastructure serving billions of queries per day.",
    requirements: `Minimum qualifications:
- Bachelor's degree in Computer Science or equivalent practical experience.
- 5+ years of software development experience with Go, C++, Java, or Python.
- 3+ years architecting, designing, and scaling distributed backend systems, microservices, or high-throughput data platforms.
- Experience with Kubernetes, Docker, container orchestration, and cloud infrastructure (GCP/AWS).

Preferred qualifications:
- Master's or PhD in Computer Science or related technical field.
- Experience with gRPC, Protocol Buffers, event streaming (Kafka/PubSub), and relational/NoSQL distributed databases (Spanner, BigQuery).
- Proven track record of leading multi-quarter technical initiatives and mentoring junior engineers.
- Strong grounding in General Cognitive Ability, Site Reliability Engineering (SRE) principles, and latency optimization (p99 < 50ms).`
  },
  {
    id: "google_ml_l5",
    title: "Google Software Engineer (L4/L5) - Machine Learning & Generative AI Systems",
    level: "L4 / L5",
    overview: "Build, optimize, and deploy cutting-edge Machine Learning and Large Language Model (LLM) inference pipelines at Google scale.",
    requirements: `Minimum qualifications:
- Bachelor's degree in Computer Science, Mathematics, or equivalent practical experience.
- 4+ years of software engineering experience in Python or C++.
- 2+ years deploying production Machine Learning, NLP, or Generative AI models.
- Deep understanding of PyTorch, TensorFlow, vector databases, and Retrieval-Augmented Generation (RAG).

Preferred qualifications:
- Experience optimizing GPU/TPU inference pipelines, model quantization, and distributed training clusters.
- Strong knowledge of data structures, algorithms, and high-throughput feature ingestion.
- Contributions to open-source AI frameworks or published research in ML/AI systems.`
  },
  {
    id: "google_sre",
    title: "Google Site Reliability Engineer (SRE) - Global Reliability & Infrastructure",
    level: "L4 / L5",
    overview: "Ensure Google's planetary-scale services remain ultra-reliable, highly available, and resilient through automated software engineering.",
    requirements: `Minimum qualifications:
- Bachelor's degree in Computer Science or equivalent practical experience.
- 4+ years of experience with Unix/Linux operating system internals, networking (TCP/IP, HTTP/2, gRPC), and systems programming (Go, Python, C++).
- Hands-on mastery of Kubernetes, Terraform, and automated CI/CD deployment pipelines.

Preferred qualifications:
- Experience defining Service Level Objectives (SLOs), Service Level Indicators (SLIs), and error budgets.
- Proven experience leading incident management, postmortems, disaster recovery drills, and capacity planning.
- Deep expertise in observability frameworks (Prometheus, Grafana, OpenTelemetry).`
  }
];

/**
 * Extracts and scores quantifiable metrics in resume bullets (Y in the XYZ formula).
 */
export function extractQuantifiableMetrics(text) {
  if (!text) return { count: 0, matches: [], densityScore: 0 };

  // Patterns matching %, $, ms, throughput, large numbers (k, M, B), and TPS
  const patterns = [
    /\b\d+(\.\d+)?%/i,                                              // 35%, 99.99%
    /\$\d+([kKmMbB]|\,\d{3})*(\.\d+)?/i,                            // $180k, $1.2M, $45,000
    /\b\d+(\.\d+)?\s*(ms|seconds|minutes|hours|days|x|fold)\b/i,      // 45ms, 2.5x, 3x
    /\b\d+(\.\d+)?[kKmMbB]\+?\s*(users|requests|queries|events|tps|qps|dau|mau)\b/i, // 1.2M users, 50k TPS
    /\b(reduced|decreased|increased|accelerated|improved|saved)\s+by\s+\d+(\.\d+)?%/i
  ];

  const matches = [];
  const lines = text.split("\n").filter(l => l.trim().length > 0 && (l.trim().startsWith("-") || l.trim().startsWith("•") || l.trim().length > 25));

  let bulletsWithMetrics = 0;

  lines.forEach(line => {
    let lineHasMetric = false;
    patterns.forEach(p => {
      const m = line.match(new RegExp(p.source, "gi"));
      if (m) {
        lineHasMetric = true;
        m.forEach(val => {
          if (!matches.includes(val)) matches.push(val);
        });
      }
    });

    if (lineHasMetric) {
      bulletsWithMetrics++;
    }
  });

  const total = Math.max(1, lines.length);
  const density = (bulletsWithMetrics / total) * 100;
  const densityScore = Math.min(100, Math.round(density));

  return {
    count: matches.length,
    matches,
    bulletsWithMetrics,
    totalBullets: lines.length,
    densityScore
  };
}

/**
 * Evaluates scope indicators to estimate Google Engineering Level (L3 vs L4 vs L5 vs L6).
 */
export function evaluateGoogleEngineeringLevel(text) {
  if (!text) {
    return {
      level: "L3",
      title: "L3 (Software Engineer II / Entry)",
      confidence: "Low",
      summary: "Resume shows task-level execution. Elevate scope to multi-team architecture to reach L5 Senior.",
      recommendations: [
        "Include quantifiable cross-team architectural decisions.",
        "Highlight mentorship of junior engineers and technical design docs authored."
      ]
    };
  }

  const normalized = text.toLowerCase();

  // Signals for L6 Staff: org-wide, company-wide, multi-team, strategic, VP/exec, architecture standards
  const l6Signals = [
    "org-wide", "company-wide", "across 4+ teams", "across multiple teams",
    "strategic roadmap", "principal", "staff engineer", "engineering standards",
    "architecture committee", "executive alignment", "charter"
  ];

  // Signals for L5 Senior: system design, multi-quarter, led, architected, mentored, postmortems, end-to-end
  const l5Signals = [
    "architected", "system design", "distributed systems", "led", "mentored",
    "multi-quarter", "cross-functional", "end-to-end", "postmortem", "sla", "slo",
    "million", "billion", "p99", "reliability", "infrastructure"
  ];

  // Signals for L4 SWE III: independently developed, implemented, feature ownership, refactored
  const l4Signals = [
    "implemented", "developed", "deployed", "refactored", "optimized",
    "unit tests", "integration tests", "apis", "features"
  ];

  let l6Count = 0;
  l6Signals.forEach(s => { if (normalized.includes(s)) l6Count++; });

  let l5Count = 0;
  l5Signals.forEach(s => { if (normalized.includes(s)) l5Count++; });

  let l4Count = 0;
  l4Signals.forEach(s => { if (normalized.includes(s)) l4Count++; });

  if (l6Count >= 3 || (l6Count >= 2 && l5Count >= 5)) {
    return {
      level: "L6",
      title: "L6 (Staff Software Engineer)",
      badgeClass: "badge-success",
      summary: "Strong signals of organizational leadership, architectural direction, and multi-team technical influence.",
      recommendations: [
        "Quantify business and engineering productivity outcomes across organizations.",
        "Emphasize technical governance, design doc RFCs, and high-stakes system resilience."
      ]
    };
  }

  if (l5Count >= 4 || (l5Count >= 2 && l6Count >= 1)) {
    return {
      level: "L5",
      title: "L5 (Senior Software Engineer)",
      badgeClass: "badge-success",
      summary: "High alignment with Google L5 Senior SWE bar. Demonstrates system design ownership, technical leadership, and metric impact.",
      recommendations: [
        "Ensure every single experience bullet uses the Google XYZ format.",
        "Highlight handling ambiguous requirements and mentoring peers."
      ]
    };
  }

  if (l4Count >= 3 || l5Count >= 2) {
    return {
      level: "L4",
      title: "L4 (Software Engineer III)",
      badgeClass: "badge-warning",
      summary: "Solid mid-level engineering foundation. Shows independent feature delivery, but needs deeper multi-system architectural ownership for L5.",
      recommendations: [
        "Replace passive verbs ('assisted', 'helped', 'worked on') with active ownership ('Architected', 'Engineered').",
        "Add multi-quarter scope and quantifiable scale metrics (e.g. TPS, p99 latency, cost savings)."
      ]
    };
  }

  return {
    level: "L3",
    title: "L3 (Software Engineer II / Associate)",
    badgeClass: "badge-neutral",
    summary: "Task-oriented execution. To reach Google L4/L5, emphasize end-to-end component ownership and measurable outcomes.",
    recommendations: [
      "Connect every technical task to a quantifiable business or latency metric.",
      "Highlight distributed system patterns (caching, queuing, concurrency) over basic CRUD operations."
    ]
  };
}

/**
 * Runs comprehensive Google-Specific ATS Profile Audit
 */
export function auditGoogleAtsProfile(resumeText, targetGoogleJdText) {
  if (!resumeText || !resumeText.trim()) {
    return {
      googleAtsScore: 0,
      tier: "Incomplete",
      dimensions: { gca: 0, rrk: 0, leadership: 0, xyzDensity: 0 },
      matchedGoogleTech: [],
      missingGoogleTech: [],
      metricAudit: { count: 0, matches: [], densityScore: 0 },
      levelEval: evaluateGoogleEngineeringLevel(""),
      summary: "Please provide a resume to run the Google ATS audit."
    };
  }

  const jd = targetGoogleJdText || GOOGLE_JOB_PROFILES[0].requirements;

  // 1. Metric Density (XYZ Formula adherence)
  const metricAudit = extractQuantifiableMetrics(resumeText);

  // 2. Role-Related Knowledge (RRK): Match against Google Technical Taxonomy
  const candidateSkills = extractCanonicalSkills(resumeText);
  const candidateCanonicalSet = new Set(candidateSkills.map(s => s.canonical.toLowerCase()));

  const matchedGoogleTech = [];
  const missingGoogleTech = [];

  GOOGLE_TECH_TAXONOMY.forEach(tech => {
    if (candidateCanonicalSet.has(tech.toLowerCase()) || resumeText.toLowerCase().includes(tech.toLowerCase())) {
      matchedGoogleTech.push(tech);
    } else {
      missingGoogleTech.push(tech);
    }
  });

  const rrkScore = Math.min(100, Math.round((matchedGoogleTech.length / 8) * 100));

  // 3. General Cognitive Ability (GCA) Signals: complex problem solving, optimization, algorithms
  const gcaKeywords = ["optimized", "refactored", "analyzed", "diagnosed", "algorithms", "latency", "bottleneck", "scale", "throughput", "concurrency", "architecture", "engineered"];
  let gcaMatches = 0;
  gcaKeywords.forEach(k => { if (resumeText.toLowerCase().includes(k)) gcaMatches++; });
  const gcaScore = Math.min(100, Math.round((gcaMatches / 4) * 100));

  // 4. Leadership & Googleyness: mentorship, postmortem, cross-functional, open-source
  const leadKeywords = ["mentored", "led", "cross-functional", "postmortem", "collaborated", "aligned", "directed", "authored", "standardized", "established"];
  let leadMatches = 0;
  leadKeywords.forEach(k => { if (resumeText.toLowerCase().includes(k)) leadMatches++; });
  const leadershipScore = Math.min(100, Math.round((leadMatches / 3) * 100));

  // 5. Engineering Level Evaluation
  const levelEval = evaluateGoogleEngineeringLevel(resumeText);

  // Google Weighted Score Calculation:
  // XYZ Density: 35%, Technical Depth (RRK): 30%, GCA: 20%, Leadership: 15%
  const compositeScore = Math.round(
    (metricAudit.densityScore * 0.35) +
    (rrkScore * 0.30) +
    (gcaScore * 0.20) +
    (leadershipScore * 0.15)
  );

  const googleAtsScore = Math.min(100, Math.max(15, compositeScore));

  let tier = "High Gap for Google Bar";
  let tierColor = "var(--accent-rose)";
  if (googleAtsScore >= 85) {
    tier = "Google Strong Match (L5 / L6 Candidate)";
    tierColor = "var(--accent-emerald)";
  } else if (googleAtsScore >= 70) {
    tier = "Competitive for Google Screening (L4 / L5)";
    tierColor = "var(--accent-cyan)";
  } else if (googleAtsScore >= 55) {
    tier = "Moderate Alignment (Needs XYZ Metric Focus)";
    tierColor = "var(--accent-amber)";
  }

  return {
    googleAtsScore,
    tier,
    tierColor,
    dimensions: {
      xyzDensity: metricAudit.densityScore,
      rrk: rrkScore,
      gca: gcaScore,
      leadership: leadershipScore
    },
    matchedGoogleTech,
    missingGoogleTech,
    metricAudit,
    levelEval,
    summary: `Profile scored ${googleAtsScore}% against Google's technical hiring rubric with ${levelEval.level} scope alignment.`
  };
}

/**
 * Builds Google Laszlo Bock XYZ Bullet Point
 * "Accomplished [X] as measured by [Y], by doing [Z]"
 */
export function buildGoogleXyzBullet({ accomplishedX, measuredY, doingZ }) {
  const x = (accomplishedX || "").trim();
  const y = (measuredY || "").trim();
  const z = (doingZ || "").trim();

  if (!x && !y && !z) return "";

  // Canonical Google XYZ format:
  // "Accomplished [X] as measured by [Y], by doing [Z]."
  let bullet = "";
  if (x && y && z) {
    bullet = `Accomplished ${x} as measured by ${y}, by ${z}.`;
  } else if (x && y) {
    bullet = `Accomplished ${x} as measured by ${y}.`;
  } else if (x && z) {
    bullet = `Accomplished ${x} by ${z}.`;
  } else {
    bullet = x || y || z;
  }

  // Capitalize first letter and ensure ends with period
  bullet = bullet.charAt(0).toUpperCase() + bullet.slice(1);
  if (!bullet.endsWith(".")) bullet += ".";

  return bullet;
}

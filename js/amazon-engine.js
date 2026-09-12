/**
 * AMAZON LEADERSHIP PRINCIPLES (LP) & BAR RAISER ENGINE
 * Evaluates candidate resumes against Amazon's 16 Leadership Principles,
 * AWS scale dimensions, and Bar Raiser STAR interview standards.
 */

export const AMAZON_LEADERSHIP_PRINCIPLES = [
  {
    id: "customer_obsession",
    name: "Customer Obsession",
    short: "Work backwards from customer need",
    keywords: ["customer", "client", "user experience", "user feedback", "customer pain", "working backwards", "sla", "satisfaction", "nps", "end user"]
  },
  {
    id: "ownership",
    name: "Ownership",
    short: "Act for the long term; never say 'not my job'",
    keywords: ["ownership", "long-term", "on-call", "postmortem", "cross-team", "end-to-end", "technical debt", "unblocked", "championed", "accountability"]
  },
  {
    id: "invent_simplify",
    name: "Invent and Simplify",
    short: "Create new solutions and remove complexity",
    keywords: ["invented", "simplified", "automated", "streamlined", "patented", "re-architected", "framework", "tooling", "reduced complexity", "abstractions"]
  },
  {
    id: "are_right_a_lot",
    name: "Are Right, A Lot",
    short: "Strong technical judgment & disconfirming beliefs",
    keywords: ["judgment", "trade-off", "tradeoffs", "design doc", "rfc", "benchmarks", "data-driven", "validated", "decision", "proof of concept"]
  },
  {
    id: "learn_curious",
    name: "Learn and Be Curious",
    short: "Explore new possibilities and technologies",
    keywords: ["learned", "curious", "prototyped", "explored", "upskilled", "adopted", "investigated", "evaluated", "emerging", "continuous learning"]
  },
  {
    id: "hire_develop",
    name: "Hire and Develop the Best",
    short: "Coach, mentor, and raise the team bar",
    keywords: ["mentored", "hired", "interviewed", "coached", "trained", "onboarded", "bar raiser", "promoted", "developed", "knowledge sharing"]
  },
  {
    id: "highest_standards",
    name: "Insist on the Highest Standards",
    short: "Relentlessly drive high-quality products & systems",
    keywords: ["code quality", "unit tests", "test coverage", "integration tests", "ci/cd", "linters", "code reviews", "zero defect", "sla", "uptime"]
  },
  {
    id: "think_big",
    name: "Think Big",
    short: "Inspire bold direction and scalable impact",
    keywords: ["scaled", "millions", "billions", "multi-region", "planetary", "multi-year", "roadmap", "vision", "global", "high throughput"]
  },
  {
    id: "bias_for_action",
    name: "Bias for Action",
    short: "Speed matters; calculate two-way doors",
    keywords: ["speed", "rapidly", "two-way door", "mvp", "accelerated", "fast-tracked", "unblocked", "shipped", "executed", "decisive"]
  },
  {
    id: "frugality",
    name: "Frugality",
    short: "Accomplish more with less; self-sufficiency",
    keywords: ["cost savings", "reduced costs", "optimized spend", "cloud spend", "ec2", "aws bill", "frugal", "resource utilization", "efficiency", "savings"]
  },
  {
    id: "earn_trust",
    name: "Earn Trust",
    short: "Listen attentively, speak candidly, respect others",
    keywords: ["trust", "transparent", "candid", "stakeholders", "cross-functional", "collaborative", "listened", "empathy", "consensus", "aligned"]
  },
  {
    id: "dive_deep",
    name: "Dive Deep",
    short: "Stay connected to the details, metrics, and audits",
    keywords: ["root cause", "5 whys", "deep dive", "profiling", "memory leak", "race condition", "telemetry", "metrics", "audited", "debugged"]
  },
  {
    id: "disagree_commit",
    name: "Have Backbone; Disagree and Commit",
    short: "Respectfully challenge, then execute completely",
    keywords: ["disagreed", "challenged", "advocated", "committed", "alternative approach", "constructive conflict", "aligned"]
  },
  {
    id: "deliver_results",
    name: "Deliver Results",
    short: "Rise to the occasion and deliver quality outputs",
    keywords: ["delivered", "shipped", "on time", "milestone", "exceeded", "achieved", "revenue", "conversion", "production release", "met deadline"]
  },
  {
    id: "earths_best_employer",
    name: "Strive to be Earth's Best Employer",
    short: "Create a safe, diverse, and productive environment",
    keywords: ["work environment", "diversity", "inclusion", "wellbeing", "ergonomics", "developer experience", "productivity", "safety"]
  },
  {
    id: "scale_responsibility",
    name: "Success and Scale Bring Broad Responsibility",
    short: "Thoughtful impact on society, security, and world",
    keywords: ["security", "compliance", "gdpr", "sustainability", "carbon", "privacy", "ethics", "responsible", "governance"]
  }
];

export const AMAZON_JOB_PROFILES = [
  {
    id: "amazon_sde1",
    title: "Amazon Software Development Engineer I (SDE I)",
    level: "SDE I (L4)",
    overview: "Build reliable, scalable distributed features for AWS, Prime Video, or Amazon Retail with clean code, testing, and operational excellence.",
    requirements: `Role: Amazon Software Development Engineer I (SDE I)
Level: SDE I (L4)

Basic Qualifications:
- Bachelor's degree in Computer Science, Computer Engineering, or related technical discipline.
- 0-2 years of software engineering experience in Java, C++, Python, or Go.
- Strong foundational grounding in Algorithms, Data Structures, Big-O complexity, and Object-Oriented Design.
- Experience with unit testing, git, and automated builds.

Preferred Qualifications:
- Experience building RESTful microservices, AWS services (S3, DynamoDB, Lambda, SQS).
- Demonstrated alignment with Amazon Leadership Principles: Customer Obsession, Ownership, and Dive Deep.`
  },
  {
    id: "amazon_sde2",
    title: "Amazon Software Development Engineer II (SDE II) - AWS / Core Services",
    level: "SDE II (L5)",
    overview: "Design, develop, and operate high-availability distributed backend systems serving global AWS and e-commerce customers.",
    requirements: `Role: Amazon Software Development Engineer II (SDE II) - AWS / Core Services
Level: SDE II (L5)

Basic Qualifications:
- 3+ years of professional non-internship software development experience in Java, C++, Go, or Python.
- 2+ years architecting and scaling multi-tier distributed systems, microservices, and databases.
- Deep familiarity with AWS ecosystem (EC2, ECS/EKS, DynamoDB, SQS/SNS, CloudWatch).
- Strong track record of operational excellence, on-call support, and root-cause analysis (COE / Postmortems).

Preferred Qualifications:
- Master's degree in Computer Science.
- Demonstrated Bar Raiser execution on Ownership, Invent and Simplify, and Delivering Results.`
  },
  {
    id: "amazon_sde3",
    title: "Amazon Senior Software Development Engineer (SDE III) - Planetary Scale",
    level: "SDE III (L6)",
    overview: "Lead multi-team system architectures, establish engineering standards across AWS organizations, and mentor principal talent.",
    requirements: `Role: Amazon Senior Software Development Engineer (SDE III) - Planetary Scale
Level: SDE III (L6)

Basic Qualifications:
- 7+ years of software development experience leading architecture for mission-critical distributed systems.
- Proven expertise in multi-region failover, fault tolerance, high-throughput caching, and asynchronous workflows.
- Track record of authoring architectural design docs and driving cross-organization consensus.

Preferred Qualifications:
- Amazon Bar Raiser certification or equivalent technical hiring leadership.
- Demonstrates mastery across all 16 Leadership Principles with org-wide business and operational outcomes.`
  }
];

/**
 * Audits resume against Amazon's 16 Leadership Principles
 */
export function auditAmazonLeadershipPrinciples(resumeText, targetAmazonJdText = "") {
  if (!resumeText || !resumeText.trim()) {
    return {
      amazonScore: 0,
      tier: "Incomplete",
      tierColor: "var(--accent-rose)",
      lpCoverageCount: 0,
      lpCoveragePercentage: 0,
      lpMatches: [],
      missingLps: AMAZON_LEADERSHIP_PRINCIPLES.map(lp => lp.name),
      operationalExcellenceScore: 0,
      customerObsessionScore: 0,
      scaleScore: 0,
      summary: "Please provide a resume to run the Amazon Bar Raiser audit."
    };
  }

  const normalized = resumeText.toLowerCase();

  // 1. Audit each of the 16 Leadership Principles
  const lpMatches = [];
  const missingLps = [];

  AMAZON_LEADERSHIP_PRINCIPLES.forEach(lp => {
    let matchedKeywords = [];
    lp.keywords.forEach(kw => {
      if (normalized.includes(kw)) {
        matchedKeywords.push(kw);
      }
    });

    if (matchedKeywords.length > 0) {
      lpMatches.push({
        id: lp.id,
        name: lp.name,
        short: lp.short,
        matchedKeywords,
        count: matchedKeywords.length
      });
    } else {
      missingLps.push(lp.name);
    }
  });

  const lpCoverageCount = lpMatches.length;
  const lpCoveragePercentage = Math.round((lpCoverageCount / 16) * 100);

  // 2. Operational Excellence Signals (On-call, postmortems, COE, SLA, monitoring)
  const opExKeywords = ["on-call", "postmortem", "root cause", "coe", "sla", "slo", "cloudwatch", "telemetry", "datadog", "incident", "mttr", "runbook"];
  let opExMatches = 0;
  opExKeywords.forEach(k => { if (normalized.includes(k)) opExMatches++; });
  const operationalExcellenceScore = Math.min(100, Math.round((opExMatches / 3) * 100));

  // 3. Customer Obsession & Business Impact Signals
  const custKeywords = ["customer", "user", "client", "nps", "satisfaction", "experience", "revenue", "conversion", "retention"];
  let custMatches = 0;
  custKeywords.forEach(k => { if (normalized.includes(k)) custMatches++; });
  const customerObsessionScore = Math.min(100, Math.round((custMatches / 3) * 100));

  // 4. AWS & Distributed Systems Scale Signals
  const scaleKeywords = ["aws", "dynamodb", "s3", "lambda", "sqs", "sns", "ecs", "eks", "distributed", "microservices", "tps", "p99", "high availability"];
  let scaleMatches = 0;
  scaleKeywords.forEach(k => { if (normalized.includes(k)) scaleMatches++; });
  const scaleScore = Math.min(100, Math.round((scaleMatches / 4) * 100));

  // 5. Amazon Bar Raiser Composite Score
  // LP Coverage: 35%, Scale/Tech: 30%, Operational Excellence: 20%, Customer Obsession: 15%
  const composite = Math.round(
    (lpCoveragePercentage * 0.35) +
    (scaleScore * 0.30) +
    (operationalExcellenceScore * 0.20) +
    (customerObsessionScore * 0.15)
  );

  const amazonScore = Math.min(100, Math.max(15, composite));

  let tier = "High Gap for Amazon Bar";
  let tierColor = "var(--accent-rose)";

  if (amazonScore >= 85) {
    tier = "Bar Raiser Ready (Strong SDE II / SDE III Match)";
    tierColor = "var(--accent-emerald)";
  } else if (amazonScore >= 70) {
    tier = "Competitive for Amazon Onsite Screening";
    tierColor = "var(--accent-cyan)";
  } else if (amazonScore >= 55) {
    tier = "Moderate LP Alignment (Needs OpEx & Dive Deep Evidence)";
    tierColor = "var(--accent-amber)";
  }

  return {
    amazonScore,
    tier,
    tierColor,
    lpCoverageCount,
    lpCoveragePercentage,
    lpMatches,
    missingLps,
    dimensions: {
      lpCoverage: lpCoveragePercentage,
      scale: scaleScore,
      operationalExcellence: operationalExcellenceScore,
      customerObsession: customerObsessionScore
    },
    summary: `Profile demonstrates ${lpCoverageCount}/16 Amazon Leadership Principles with ${operationalExcellenceScore}% Operational Excellence index.`
  };
}

/**
 * Builds Amazon Bar Raiser STAR Bullet
 */
export function buildAmazonStarBullet({ situationTask, actionLp, measurableResult, chosenLp }) {
  const st = (situationTask || "").trim();
  const act = (actionLp || "").trim();
  const res = (measurableResult || "").trim();
  const lp = (chosenLp || "Ownership").trim();

  if (!st && !act && !res) return "";

  let bullet = "";
  if (st && act && res) {
    bullet = `Demonstrated ${lp} by tackling ${st}; engineered ${act}, resulting in ${res}.`;
  } else if (act && res) {
    bullet = `Demonstrated ${lp} by ${act}, achieving ${res}.`;
  } else {
    bullet = act || res || st;
  }

  bullet = bullet.charAt(0).toUpperCase() + bullet.slice(1);
  if (!bullet.endsWith(".")) bullet += ".";
  return bullet;
}

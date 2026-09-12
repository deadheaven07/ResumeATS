/**
 * AUTOMATED INTERVIEW PREP COACH
 * Analyzes candidate skill gaps and generates tailored System Design,
 * Behavioral STAR, and Algorithmic interview prep blueprints.
 */

export function generateInterviewQuestions({ missingSkills = [], matchedSkills = [], targetRole = "Software Engineer", company = "Google" }) {
  const questions = [];

  const topMissing = missingSkills.slice(0, 4);
  const primaryGap = topMissing[0] || "Distributed Systems";
  const secondaryGap = topMissing[1] || "Concurrency & Memory Management";

  // 1. System Design Question targeted at identified gaps
  questions.push({
    id: "sys_design_1",
    category: "System Design & Architecture",
    badgeClass: "badge-cyan",
    question: `Architect a highly available, fault-tolerant ingestion pipeline utilizing ${primaryGap} and caching that supports 100,000 queries per second with p99 latency under 30ms.`,
    targetedGap: primaryGap,
    keyConcepts: ["Horizontal scaling", "Idempotency", "Backpressure handling", "Data partition sharding", "Cache invalidation"],
    modelAnswerGuide: {
      framework: "STAR / 4-Step System Design",
      step1: "Clarify functional requirements (read/write ratio, consistency vs availability trade-offs, SLA/SLO).",
      step2: "Establish high-level architecture: Load Balancers -> API Gateways -> Microservices -> Distributed Queues/Storage.",
      step3: "Deep dive into bottleneck mitigation: Database indexing, connection pooling, and multi-region replication.",
      pitfallsToAvoid: "Don't jump into drawing databases without stating QPS math and storage requirements first."
    }
  });

  // 2. Behavioral / Leadership Question targeted at company culture
  if (company.toLowerCase().includes("amazon")) {
    questions.push({
      id: "behavioral_amazon",
      category: "Amazon Leadership Principle: Ownership & Dive Deep",
      badgeClass: "badge-amber",
      question: "Tell me about a time when you owned a project with ambiguous requirements, discovered a critical edge-case during execution, and had to dive deep to resolve it before launch.",
      targetedGap: "Amazon Bar Raiser Alignment",
      keyConcepts: ["5-Whys Root Cause", "Working Backwards", "Two-way doors", "Operational excellence"],
      modelAnswerGuide: {
        framework: "Amazon STAR Format (Situation, Task, Action, Measurable Result)",
        step1: "Situation: Briefly describe the business context, customer impact, and initial constraints (15% of time).",
        step2: "Action: Emphasize what YOU personally investigated, coded, or led—use 'I', not 'we' (60% of time).",
        step3: "Result: Quantify customer outcomes, metrics saved, or latency improvements (25% of time).",
        pitfallsToAvoid: "Avoid generic teamwork narratives; the Bar Raiser must hear your individual technical contribution."
      }
    });
  } else {
    questions.push({
      id: "behavioral_google",
      category: "Google General Cognitive Ability & Googleyness",
      badgeClass: "badge-success",
      question: "Describe a situation where you had a fundamental technical disagreement with a senior engineer or team lead regarding system architecture. How did you validate your hypothesis and achieve alignment?",
      targetedGap: "General Cognitive Ability (GCA) & Consensus",
      keyConcepts: ["Data-driven benchmarks", "Intellectual humility", "Architecture RFCs", "Collaborative problem-solving"],
      modelAnswerGuide: {
        framework: "Google GCA Inquiry Method",
        step1: "Explain the architectural trade-off neutrally without emotion or ego.",
        step2: "Demonstrate how you ran empirical benchmark tests or wrote a concise prototype to disconfirm assumptions.",
        step3: "Highlight how the final decision elevated team engineering standards.",
        pitfallsToAvoid: "Never disparage past coworkers or claim you were 100% right from the start."
      }
    });
  }

  // 3. Deep Algorithmic / Performance Engineering Question
  questions.push({
    id: "algorithmic_deep",
    category: "Coding & Complexity Analysis",
    badgeClass: "badge-rose",
    question: `Explain how you would diagnose and eliminate a severe memory leak or thread contention issue in a high-concurrency service utilizing ${secondaryGap}.`,
    targetedGap: secondaryGap,
    keyConcepts: ["Heap profiling", "Thread dumps", "Lock contention", "Garbage collection pauses", "Big-O space complexity"],
    modelAnswerGuide: {
      framework: "Empirical Diagnosis Workflow",
      step1: "Isolate symptoms: Alert telemetry, Prometheus/Grafana graphs, or memory growth trends.",
      step2: "Tools used: pprof, async-profiler, JProfiler, or AddressSanitizer (ASan).",
      step3: "The fix: Eliminating pointer cycles, switching to immutable structures, or adopting ring buffers.",
      pitfallsToAvoid: "Don't guess; describe reproducible benchmark steps and automated canary validation."
    }
  });

  return {
    targetRole,
    company,
    primaryGap,
    questions
  };
}

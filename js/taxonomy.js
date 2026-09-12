/**
 * Standardized Skill Taxonomy & Canonical Mapping Engine
 * Aligned with O*NET and Lightcast taxonomy logic.
 */

export const SKILL_TAXONOMY = {
  // Software Engineering & Architecture
  software_engineering: {
    category: "Software Engineering & Architecture",
    type: "hard_skill",
    weight: 1.2,
    skills: [
      { canonical: "JavaScript", synonyms: ["js", "es6", "vanilla js", "ecmascript"] },
      { canonical: "TypeScript", synonyms: ["ts"] },
      { canonical: "Python", synonyms: ["python3", "py"] },
      { canonical: "Java", synonyms: ["java 17", "java 21", "jvm"] },
      { canonical: "C++", synonyms: ["cpp", "c/c++"] },
      { canonical: "Go (Golang)", synonyms: ["golang", "go"] },
      { canonical: "Rust", synonyms: ["rustlang"] },
      { canonical: "C#", synonyms: ["csharp", ".net", "dotnet", ".net core"] },
      { canonical: "Ruby", synonyms: ["ruby on rails", "rails"] },
      { canonical: "PHP", synonyms: ["modern php", "laravel"] },
      { canonical: "SQL", synonyms: ["relational database", "ansi sql"] },
      { canonical: "Microservices Architecture", synonyms: ["microservices", "service-oriented architecture", "soa"] },
      { canonical: "RESTful APIs", synonyms: ["rest api", "restful api", "rest apis", "rest endpoints"] },
      { canonical: "GraphQL", synonyms: ["graphql apis", "apollo"] },
      { canonical: "gRPC", synonyms: ["protobuf", "protocol buffers"] },
      { canonical: "Event-Driven Architecture", synonyms: ["eda", "event streaming", "event-driven"] },
      { canonical: "System Design", synonyms: ["distributed systems", "high availability", "scalability", "fault tolerance"] },
      { canonical: "Data Structures & Algorithms", synonyms: ["dsa", "algorithms", "data structures"] },
      { canonical: "Design Patterns", synonyms: ["solid principles", "oop", "clean code"] },
      { canonical: "Test-Driven Development", synonyms: ["tdd", "unit testing", "integration testing", "e2e testing"] }
    ]
  },

  // Frontend & Web Technologies
  frontend: {
    category: "Frontend & UI/UX Engineering",
    type: "hard_skill",
    weight: 1.0,
    skills: [
      { canonical: "React", synonyms: ["reactjs", "react.js", "react hooks"] },
      { canonical: "Next.js", synonyms: ["nextjs", "next.js", "app router"] },
      { canonical: "Vue.js", synonyms: ["vue", "vuejs", "vue 3"] },
      { canonical: "Angular", synonyms: ["angularjs", "angular 16", "angular 17"] },
      { canonical: "HTML5 & Semantic Markup", synonyms: ["html5", "html", "semantic html"] },
      { canonical: "CSS3 & Modern Layouts", synonyms: ["css", "css3", "flexbox", "css grid"] },
      { canonical: "Tailwind CSS", synonyms: ["tailwindcss", "tailwind"] },
      { canonical: "Web Performance & Core Web Vitals", synonyms: ["cwv", "lcp", "inp", "cls", "page speed optimization"] },
      { canonical: "Web Accessibility (a11y)", synonyms: ["accessibility", "a11y", "wcag", "aria"] },
      { canonical: "State Management", synonyms: ["redux", "zustand", "mobx", "pinia", "recoil"] }
    ]
  },

  // Cloud, DevOps & Infrastructure
  cloud_devops: {
    category: "Cloud, DevOps & Infrastructure",
    type: "hard_skill",
    weight: 1.2,
    skills: [
      { canonical: "Amazon Web Services (AWS)", synonyms: ["aws", "amazon cloud", "ec2", "s3", "lambda", "ecs"] },
      { canonical: "Google Cloud Platform (GCP)", synonyms: ["gcp", "google cloud", "bigquery", "cloud run", "gke"] },
      { canonical: "Microsoft Azure", synonyms: ["azure", "azure devops", "aks"] },
      { canonical: "Docker & Containerization", synonyms: ["docker", "containers", "containerization"] },
      { canonical: "Kubernetes (K8s)", synonyms: ["k8s", "kubernetes", "helm"] },
      { canonical: "Terraform (IaC)", synonyms: ["terraform", "iac", "infrastructure as code", "terragrunt"] },
      { canonical: "CI/CD Pipelines", synonyms: ["ci/cd", "continuous integration", "github actions", "gitlab ci", "jenkins", "argocd"] },
      { canonical: "Linux / Unix Administration", synonyms: ["linux", "unix", "bash scripting", "shell scripting"] },
      { canonical: "Site Reliability Engineering (SRE)", synonyms: ["sre", "observability", "prometheus", "grafana", "datadog", "new relic"] },
      { canonical: "Cloud Security & IAM", synonyms: ["iam", "cloud security", "least privilege", "soc2 compliance"] }
    ]
  },

  // Data Engineering, AI & Machine Learning
  data_ai: {
    category: "Data Engineering, AI & ML",
    type: "hard_skill",
    weight: 1.1,
    skills: [
      { canonical: "PostgreSQL", synonyms: ["postgres", "postgresql"] },
      { canonical: "MySQL", synonyms: ["mysql"] },
      { canonical: "MongoDB", synonyms: ["mongo", "mongodb"] },
      { canonical: "Redis", synonyms: ["redis cache", "redis in-memory"] },
      { canonical: "Apache Kafka", synonyms: ["kafka", "kafka streams"] },
      { canonical: "Snowflake", synonyms: ["snowflake dw"] },
      { canonical: "dbt (Data Build Tool)", synonyms: ["dbt", "dbt core"] },
      { canonical: "Apache Spark", synonyms: ["spark", "pyspark", "spark streaming"] },
      { canonical: "Generative AI & LLMs", synonyms: ["genai", "llm", "large language models", "gemini", "chatgpt", "gpt-4", "claude"] },
      { canonical: "Prompt Engineering", synonyms: ["prompting", "system prompts", "in-context learning"] },
      { canonical: "Retrieval-Augmented Generation (RAG)", synonyms: ["rag", "vector search", "vector database", "pinecone", "chroma", "weaviate"] },
      { canonical: "Machine Learning (ML)", synonyms: ["machine learning", "supervised learning", "scikit-learn", "pytorch", "tensorflow"] }
    ]
  },

  // Methodologies & Product Delivery
  methodologies: {
    category: "Product Delivery & Methodologies",
    type: "methodology",
    weight: 0.9,
    skills: [
      { canonical: "Agile & Scrum", synonyms: ["agile", "scrum", "sprints", "sprint planning", "retrospectives"] },
      { canonical: "Cross-Functional Collaboration", synonyms: ["cross-functional leadership", "cross-functional teams", "stakeholder management"] },
      { canonical: "Technical Roadmap Planning", synonyms: ["roadmapping", "technical strategy", "okrs", "kpis"] },
      { canonical: "Code Review & Quality Assurance", synonyms: ["code reviews", "qa", "code quality", "linting", "static analysis"] },
      { canonical: "Incident Response & Postmortems", synonyms: ["incident management", "on-call", "postmortems", "rca", "root cause analysis"] }
    ]
  },

  // High-Impact Soft Skills & Leadership
  soft_skills: {
    category: "Strategic Leadership & Soft Skills",
    type: "soft_skill",
    weight: 0.8,
    skills: [
      { canonical: "Technical Leadership & Mentorship", synonyms: ["mentoring", "coaching", "team leadership", "tech lead"] },
      { canonical: "Executive Stakeholder Communication", synonyms: ["stakeholder alignment", "executive presentations", "c-suite communication"] },
      { canonical: "Strategic Problem Solving", synonyms: ["analytical thinking", "critical thinking", "complex problem solving"] },
      { canonical: "High-Velocity Execution", synonyms: ["rapid delivery", "bias for action", "shipping fast"] },
      { canonical: "Customer-Centric Mindset", synonyms: ["user empathy", "customer focus", "customer success"] }
    ]
  },

  // Professional Certifications
  certifications: {
    category: "Industry Certifications",
    type: "certification",
    weight: 1.0,
    skills: [
      { canonical: "AWS Certified Solutions Architect", synonyms: ["aws csa", "aws solutions architect"] },
      { canonical: "Google Cloud Certified Professional Cloud Architect", synonyms: ["gcp cloud architect", "google cloud architect"] },
      { canonical: "Certified Kubernetes Administrator (CKA)", synonyms: ["cka", "ckad"] },
      { canonical: "Project Management Professional (PMP)", synonyms: ["pmp"] },
      { canonical: "CISSP (Cybersecurity)", synonyms: ["cissp"] }
    ]
  }
};

/**
 * Normalizes input text into clean lowercase tokens
 */
export function normalizeText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s\+\#\.\-\/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts and maps skills from any raw text against the taxonomy
 */
export function extractCanonicalSkills(rawText) {
  const normalized = normalizeText(rawText);
  const foundSkills = [];
  const foundCanonicals = new Set();

  for (const groupKey in SKILL_TAXONOMY) {
    const group = SKILL_TAXONOMY[groupKey];
    for (const skillObj of group.skills) {
      const canonical = skillObj.canonical;
      const terms = [canonical.toLowerCase(), ...skillObj.synonyms.map(s => s.toLowerCase())];

      for (const term of terms) {
        // Regex boundary matching: handles +, #, and dots gracefully
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(^|[\\s,;()\\/])${escaped}([\\s,;()\\/]|$)`, "i");

        if (regex.test(normalized)) {
          if (!foundCanonicals.has(canonical)) {
            foundCanonicals.add(canonical);
            foundSkills.push({
              canonical,
              category: group.category,
              type: group.type,
              weight: group.weight,
              matchedTerm: term
            });
          }
          break;
        }
      }
    }
  }

  return foundSkills;
}

/**
 * Curated list of high-impact Action Verbs for STAR rewrites
 * Strictly excludes banned AI buzzwords (spearhead, leverage, supercharge, etc.)
 */
export const STAR_ACTION_VERBS = {
  Engineering: ["Architected", "Engineered", "Constructed", "Developed", "Deployed", "Implemented", "Refactored", "Automated"],
  Optimization: ["Accelerated", "Streamlined", "Reduced", "Consolidated", "Eliminated", "Minimized", "Optimized", "Scaled"],
  Leadership: ["Directed", "Orchestrated", "Guided", "Mentored", "Aligned", "Delivered", "Authored", "Established"],
  Analytics: ["Identified", "Quantified", "Audited", "Pinpointed", "Measured", "Evaluated", "Diagnosed", "Discovered"]
};

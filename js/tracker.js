/**
 * Module 5: Job & Application Tracker (ResumeTracker Core)
 * Handles Kanban stages, persistence, ATS integration, and import/export.
 */

const STORAGE_KEY = "resumetracker_applications_v1";

export const STAGES = [
  { id: "saved", title: "Target / Saved", color: "var(--accent-indigo)" },
  { id: "applied", title: "Applied", color: "var(--accent-cyan)" },
  { id: "interviewing", title: "Interviewing", color: "var(--accent-amber)" },
  { id: "offer", title: "Offer Received", color: "var(--accent-emerald)" },
  { id: "archived", title: "Archived", color: "var(--text-muted)" }
];

export const INITIAL_DEMO_JOBS = [
  {
    id: "job_1",
    company: "Vercel",
    role: "Senior Fullstack Engineer",
    location: "Remote (US/Global)",
    salary: "$180,000 - $220,000",
    status: "interviewing",
    dateAdded: "2026-09-08",
    matchScore: 88,
    nextStep: "Technical Architecture round with VP of Eng on Thursday",
    link: "https://vercel.com/careers",
    jobDescription: `About the Role:
We are seeking a Senior Fullstack Engineer proficient in TypeScript, React, Next.js, and Node.js.
You will architect high-scale web infrastructure, design RESTful APIs and GraphQL endpoints, and optimize Core Web Vitals (LCP, INP, CLS).
Experience with AWS, Docker, Kubernetes, CI/CD pipelines, and PostgreSQL is required.
You will lead cross-functional teams, conduct code reviews, and drive system design decisions for millions of global developers.`,
    notes: "Followed up with hiring manager on LinkedIn via custom false-binary post."
  },
  {
    id: "job_2",
    company: "Stripe",
    role: "Staff Backend Infrastructure Engineer",
    location: "San Francisco, CA (Hybrid)",
    salary: "$230,000 - $280,000",
    status: "applied",
    dateAdded: "2026-09-10",
    matchScore: 79,
    nextStep: "Awaiting recruiter screen confirmation",
    link: "https://stripe.com/jobs",
    jobDescription: `Stripe is looking for a Staff Backend Infrastructure Engineer to scale our core payments engine.
Requirements:
- Deep expertise in Distributed Systems, System Design, Go (Golang), and Java.
- Proven experience with Apache Kafka, Event-Driven Architecture, Redis, and high-throughput SQL databases.
- Strong grounding in AWS cloud infrastructure, Kubernetes, and Terraform.
- Excellent stakeholder communication and ability to lead incident postmortems.`,
    notes: "Referral submitted by Alex from Platform Team."
  },
  {
    id: "job_3",
    company: "Datadog",
    role: "Lead Cloud Platform Engineer",
    location: "New York, NY (Remote)",
    salary: "$200,000 - $240,000",
    status: "saved",
    dateAdded: "2026-09-12",
    matchScore: 92,
    nextStep: "Tailor resume using STAR rewriter and apply by Monday",
    link: "https://datadoghq.com/careers",
    jobDescription: `Looking for a Lead Cloud Platform Engineer to spearhead observability tooling.
Must have:
- Hands-on mastery of Kubernetes, Docker, and Linux administration.
- Advanced Infrastructure as Code using Terraform and CI/CD pipelines via GitHub Actions.
- Proficiency in Python, Go, and Prometheus/Grafana monitoring.
- AWS Certified Solutions Architect or CKA preferred.`,
    notes: "Matches my recent Kubernetes cluster refactor experience."
  }
];

export class JobTracker {
  constructor() {
    this.jobs = this.loadJobs();
  }

  loadJobs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading stored jobs:", e);
    }
    // Fallback to demo jobs
    this.saveJobs(INITIAL_DEMO_JOBS);
    return [...INITIAL_DEMO_JOBS];
  }

  saveJobs(jobs) {
    this.jobs = jobs || this.jobs;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.jobs));
    } catch (e) {
      console.error("Error saving jobs to localStorage:", e);
    }
  }

  getAll() {
    return [...this.jobs];
  }

  getById(id) {
    return this.jobs.find(j => j.id === id);
  }

  addJob(jobData) {
    const newJob = {
      id: "job_" + Date.now(),
      company: jobData.company || "Unknown Company",
      role: jobData.role || "Target Role",
      location: jobData.location || "Remote",
      salary: jobData.salary || "",
      status: jobData.status || "saved",
      dateAdded: jobData.dateAdded || new Date().toISOString().split("T")[0],
      matchScore: Number(jobData.matchScore) || 0,
      nextStep: jobData.nextStep || "",
      link: jobData.link || "",
      jobDescription: jobData.jobDescription || "",
      notes: jobData.notes || ""
    };

    this.jobs.unshift(newJob);
    this.saveJobs();
    return newJob;
  }

  updateJob(id, updates) {
    const index = this.jobs.findIndex(j => j.id === id);
    if (index !== -1) {
      this.jobs[index] = { ...this.jobs[index], ...updates };
      this.saveJobs();
      return this.jobs[index];
    }
    return null;
  }

  updateStatus(id, newStatus) {
    return this.updateJob(id, { status: newStatus });
  }

  deleteJob(id) {
    this.jobs = this.jobs.filter(j => j.id !== id);
    this.saveJobs();
  }

  exportData() {
    return JSON.stringify(this.jobs, null, 2);
  }

  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        this.jobs = parsed;
        this.saveJobs();
        return true;
      }
    } catch (e) {
      console.error("Failed to import data:", e);
    }
    return false;
  }

  resetToDemo() {
    this.jobs = [...INITIAL_DEMO_JOBS];
    this.saveJobs();
  }
}

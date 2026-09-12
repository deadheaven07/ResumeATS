# ResumeATS: AI Career & Personal Brand Copilot

A modern, high-performance web application designed for professionals to optimize their resumes for ATS systems and craft high-impact personal branding without corporate jargon or "AI slop".

---

## ⚡ Core Modules

### 1. Module 1: Resume & ATS Matcher (Powered by O*NET / Lightcast Logic)
- **Canonical Skill Taxonomy:** Standardized dictionary of 400+ technical, cloud, AI, data, and soft skills.
- **Weighted ATS Scoring (0–100%):** Computes match tier (*Strong Match*, *Competitive*, *Moderate Gap*, *Critical Gap*).
- **Gap Analysis:** Identifies verified canonical matches vs missing critical keywords.
- **STAR Method Rewriter:** Interactive generator for `[Action Verb] + [Context/Problem] + [Quantifiable Outcome]` with dynamic non-slop verbs and 1-click append.

### 2. Module 2: Google Careers & Profile Copilot (Laszlo Bock XYZ Standard)
- **Google ATS Rubric & Scoring:** Benchmarked against Google's 4 hiring pillars: General Cognitive Ability (GCA), Role-Related Knowledge (RRK), Leadership, and Googleyness.
- **Google XYZ Formula Rewriter:** Interactive builder for Google's gold-standard `Accomplished [X] as measured by [Y], by doing [Z]` structure.
- **Engineering Level Evaluator (L3/L4/L5/L6):** Analyzes resume scope to diagnose Google leveling alignment with a concrete roadmap to hit the L5 Senior SWE bar.
- **Curated Google Role Rubrics:** 1-click evaluation against Google SWE (Distributed Systems & Cloud), Google ML/AI SWE, and Google Site Reliability Engineer (SRE).

### 3. Module 3: Anti-AI Humanizer Engine
- **Live Slop Detector:** Real-time linter flagging banned AI buzzwords (*delve*, *leverage*, *supercharge*, *game-changer*, *spearhead*, *testaments*, *beacon*, *tapestry*, *key takeaway*, *excited to announce*, *in today's fast-paced world*).
- **Readability Calculator:** Coleman-Liau & Flesch-Kincaid formula targeting an 8th–10th grade conversational level.
- **Formatting Enforcer:**
  - Em-dash auditor (caps at 1 per document).
  - Emoji auditor (strictly bans 🚀 and 🔥; enforces 0–2 total).
  - Staccato fragment stack detector (flags robotic micro-sentences).
- **1-Click Humanizer:** Automatically converts text into natural conversational phrasing.

### 3. Module 3: LinkedIn Thought Leadership & Hook Engine
- **Hook Formulas:**
  - *False Binary Dissolve:* `"Everyone argues X vs Y. The real problem is Z."`
  - *Year-over-Year Pivot:* `"In 2023, I prioritized X. In 2026, I only care about Y."`
  - *The Scarce-Shots Math:* Break down an industry metric into counter-intuitive math.
- **Feed Simulator:** Realistic preview with 2-line above-the-fold cutoff highlight and "...see more" truncation marker.
- **Engagement Sweet Spot:** 900–1,300 character range gauge.
- **First Comment Box:** Staging area for external links to preserve algorithmic reach.

### 4. Module 4: Profile Conversion Optimizer
- **Value-Proposition Headline Builder:** `[Primary Role] helping [Target Audience] achieve [Specific Result] | [Key Tech Stack / Credential]`.
- **3-Part About Section Generator:**
  1. The Core Thesis (What you believe / problem solved).
  2. Career Proof Points (Hard metrics, system scale, impact).
  3. Call-to-Action (Clear outreach path).
- **Profile Readiness Audit:** Interactive checklist with real-time scoring.

### 5. Module 5: Application Tracker (Kanban)
- 5-stage pipeline: `Saved`, `Applied`, `Interviewing`, `Offer`, `Archived`.
- 1-click **🎯 Test in ATS Analyzer** routing from any saved job card.
- LocalStorage persistence with JSON backup export and import.

---

## 🚀 Getting Started

### Run Locally
No complex installation or build step required. The application runs with pure modern HTML, CSS, and ES6+ modules:

```bash
# Clone the repository
git clone https://github.com/deadheaven07/ResumeATS.git
cd ResumeATS

# Start a local static server
python3 -m http.server 8088
```

Open [http://localhost:8088](http://localhost:8088) in your browser.

---

## 🛠️ Tech Stack
- **Frontend:** Semantic HTML5, Modern Vanilla CSS (Light theme default + Dark theme toggle)
- **Logic:** Native ES6+ JavaScript modules (zero third-party dependencies)
- **Taxonomies:** O*NET & Lightcast-aligned standard skill taxonomy
- **AI Acceleration (Optional):** Gemini API client integration toggle

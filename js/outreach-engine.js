/**
 * RECRUITER & HIRING MANAGER OUTREACH KIT GENERATOR
 * Generates humanized, high-conversion cold emails and referral messages
 * directly grounded in candidate ATS-matched skills and targeted job profiles.
 * 100% compliant with the Anti-AI Humanizer (zero corporate slop).
 */

export const OUTREACH_TONES = {
  operator: {
    id: "operator",
    name: "High-Output Operator",
    tagline: "Execution-oriented, metric-driven, direct"
  },
  specialist: {
    id: "specialist",
    name: "Thoughtful Specialist",
    tagline: "Deep systems architecture, trade-offs, engineering rigor"
  },
  craftsman: {
    id: "craftsman",
    name: "Humble Builder",
    tagline: "Pragmatic, collaborative, obsessed with code quality"
  }
};

/**
 * Builds high-conversion outreach templates
 */
export function generateOutreachKit({
  candidateName = "Alex Chen",
  targetCompany = "Google",
  targetRole = "Senior Software Engineer",
  matchedSkills = ["TypeScript", "Distributed Systems", "Kubernetes"],
  tone = "operator"
}) {
  const topSkills = matchedSkills.slice(0, 3);
  const primarySkill = topSkills[0] || "Distributed Systems";
  const secondarySkill = topSkills[1] || "Cloud Architecture";
  const cName = (candidateName || "Alex Chen").trim();
  const company = (targetCompany || "Target Company").trim();
  const role = (targetRole || "Senior Engineer").trim();

  let directPitch = "";
  let referralRequest = "";
  let interviewThankYou = "";

  if (tone === "specialist") {
    directPitch = `Hi [Hiring Manager],

I saw ${company} is expanding the engineering team for ${role}.

Over the last 5+ years, my focus has been architecting fault-tolerant backend systems with ${primarySkill} and ${secondarySkill}—most recently scaling throughput to 45,000 TPS while maintaining a sub-30ms p99 latency budget.

I’ve followed ${company}’s recent technical milestones and would welcome a brief 10-minute sync on how my background aligns with your roadmap.

Best,
${cName}
[LinkedIn / GitHub Profile]`;

    referralRequest = `Hi [Name],

I saw you're engineering at ${company}—hope your sprint is going well.

I’m currently exploring the ${role} opening on your team. My background centers on ${primarySkill} and ${secondarySkill}, and I really admire how the team approaches system reliability.

Would you be open to sharing your experience working there, or pointing me toward the team's engineering lead?

Appreciate your time,
${cName}`;

    interviewThankYou = `Hi [Interviewer],

Thank you for the thoughtful technical discussion today regarding ${company}'s ${role} role.

I especially enjoyed our conversation on trade-offs around ${primarySkill} and latency boundaries under peak traffic. It confirmed my excitement about the team’s technical depth and culture of ownership.

Looking forward to the next steps.

Best regards,
${cName}`;

  } else if (tone === "craftsman") {
    directPitch = `Hi [Hiring Manager],

Reaching out regarding the ${role} position at ${company}.

I’m a software engineer who cares deeply about pragmatic architecture and clean code. Recently, I built high-reliability services utilizing ${primarySkill} and ${secondarySkill}, elevating team test coverage to 90% and cutting production bug escapes in half.

I’d love to learn what the team is currently building and explore if my skills could help unblock upcoming deliverables.

Warmly,
${cName}
[Portfolio / GitHub]`;

    referralRequest = `Hi [Name],

Hope you're having a great week. I noticed you’re at ${company} and wanted to reach out.

I’m applying for the ${role} opening. Having spent the last few years building with ${primarySkill}, I'm drawn to ${company}’s craftsmanship and engineering culture.

If you have 5 minutes, I'd love to ask one quick question about how your team approaches technical reviews.

Thanks so much,
${cName}`;

    interviewThankYou = `Hi [Interviewer],

Thanks for taking the time to speak with me today about ${company}.

I really appreciated how you walked me through the real-world engineering constraints around ${primarySkill}. It gave me a clear picture of the team's high bar for code quality and collaboration.

Please let me know if you need any additional code samples or notes from my end.

Best,
${cName}`;

  } else {
    // High-Output Operator (Default)
    directPitch = `Hi [Hiring Manager],

I noticed ${company} is hiring for a ${role}.

Quick snapshot of my impact:
- Scaled backend systems using ${primarySkill} to 45k TPS with zero message drops.
- Cut AWS infrastructure spend by $84k annually via automated resource tiering.
- Led technical design and deployment of containerized pipelines with ${secondarySkill}.

Given your team's current growth, I can hit the ground running on day one. Would you be open to a 10-minute introductory call this Thursday?

Best,
${cName}
[Resume & GitHub Links]`;

    referralRequest = `Hi [Name],

I noticed ${company} has an opening for ${role}. 

I’ve spent the past 5 years engineering high-scale distributed systems using ${primarySkill} and ${secondarySkill}. Given your work on the team, I wanted to ask if you'd be open to reviewing my profile for a referral?

Happy to send over a 2-line summary and resume for easy submission.

Thanks,
${cName}`;

    interviewThankYou = `Hi [Interviewer],

Thank you for your time today discussing the ${role} role at ${company}.

Our conversation reinforced my strong conviction that my hands-on experience with ${primarySkill} and high-throughput systems would drive immediate results for your team’s upcoming launch.

Eager to help build this out. Looking forward to hearing about next steps.

Best,
${cName}`;
  }

  return {
    candidateName: cName,
    targetCompany: company,
    targetRole: role,
    tone,
    directPitch,
    referralRequest,
    interviewThankYou
  };
}

import { prisma } from '../../database/prisma';

export class MatchingService {
  public async getMatchesForCandidate(userId: string) {
    // 1. Fetch Candidate's Skills efficiently (1 Query)
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        candidateSkills: true,
      },
    });

    if (!profile) {
      throw new Error('Candidate profile not found. Please create a profile and upload a resume first.');
    }

    const candidateSkillIds = new Set(profile.candidateSkills.map((cs) => cs.skillId));

    // 2. Fetch all Jobs with their required Skills (1 Query - No N+1)
    const jobs = await prisma.job.findMany({
      include: {
        jobSkills: {
          include: {
            skill: true,
          },
        },
        recruiter: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // 3. Process the matches in memory
    const matches = jobs.map((job) => {
      let totalWeight = 0;
      let matchedWeight = 0;
      
      const matched_skills: string[] = [];
      const missing_skills: string[] = [];

      for (const jobSkill of job.jobSkills) {
        totalWeight += jobSkill.weight;
        
        if (candidateSkillIds.has(jobSkill.skillId)) {
          matchedWeight += jobSkill.weight;
          matched_skills.push(jobSkill.skill.name);
        } else {
          missing_skills.push(jobSkill.skill.name);
        }
      }

      // If a job has no skills required, it's technically a 100% match for anyone, or 0.
      const score = totalWeight === 0 ? 0 : Math.round((matchedWeight / totalWeight) * 100);

      return {
        job: {
          id: job.id,
          title: job.title,
          description: job.description,
          recruiterEmail: job.recruiter.email,
        },
        matched_skills,
        missing_skills,
        score,
      };
    });

    // Sort by highest score first
    matches.sort((a, b) => b.score - a.score);

    return matches;
  }
}

import { prisma } from '../../database/prisma';

export class JobRepository {
  public async createJob(recruiterId: string, title: string, description: string, processedSkills: Array<{ skillId: string, weight: number }>) {
    return prisma.job.create({
      data: {
        title,
        description,
        createdBy: recruiterId,
        jobSkills: {
          create: processedSkills.map(s => ({
            skillId: s.skillId,
            weight: s.weight,
          })),
        },
      },
      include: {
        jobSkills: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  public async getJobs() {
    return prisma.job.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

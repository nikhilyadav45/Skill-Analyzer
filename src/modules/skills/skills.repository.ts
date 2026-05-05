import { prisma } from '../../database/prisma';
import { NormalizationService } from './normalization.service';

export class SkillsRepository {
  private normalizationService: NormalizationService;

  constructor() {
    this.normalizationService = new NormalizationService();
    // Seed initial on startup (MVP)
    this.normalizationService.seedInitialAliases().catch(console.error);
  }

  public async processSkills(rawSkills: string[]): Promise<string[]> {
    return this.normalizationService.normalizeAndStoreSkills(rawSkills);
  }

  public async mapSkillsToCandidate(candidateId: string, skillIds: string[]) {
    // Avoid duplicates by clearing existing first, or just using upsert/createMany skipDuplicates
    await prisma.candidateSkill.deleteMany({
      where: { candidateId },
    });

    return prisma.candidateSkill.createMany({
      data: skillIds.map((skillId) => ({
        candidateId,
        skillId,
      })),
      skipDuplicates: true,
    });
  }
}

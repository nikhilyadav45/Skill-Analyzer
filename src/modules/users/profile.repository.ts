import { prisma } from '../../database/prisma';
import { UpdateProfileDto } from './dto/profile.dto';

export class ProfileRepository {
  public async getProfileByUserId(userId: string) {
    return prisma.candidateProfile.findUnique({
      where: { userId },
    });
  }

  public async upsertProfile(userId: string, data: UpdateProfileDto) {
    return prisma.candidateProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }
}

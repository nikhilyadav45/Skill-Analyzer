import { ProfileRepository } from './profile.repository';
import { UpdateProfileDto } from './dto/profile.dto';

export class ProfileService {
  private profileRepository: ProfileRepository;

  constructor() {
    this.profileRepository = new ProfileRepository();
  }

  public async getProfile(userId: string) {
    const profile = await this.profileRepository.getProfileByUserId(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }
    return profile;
  }

  public async updateProfile(userId: string, data: UpdateProfileDto) {
    return this.profileRepository.upsertProfile(userId, data);
  }
}

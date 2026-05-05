import { JobRepository } from './job.repository';
import { CreateJobDto } from './dto/job.dto';
import { NormalizationService } from '../skills/normalization.service';

export class JobService {
  private jobRepository: JobRepository;
  private normalizationService: NormalizationService;

  constructor() {
    this.jobRepository = new JobRepository();
    this.normalizationService = new NormalizationService();
  }

  public async createJob(recruiterId: string, data: CreateJobDto) {
    // 1. Extract raw skill names and normalize them
    const rawSkillNames = data.skills.map(s => s.name);
    const normalizedSkillIds = await this.normalizationService.normalizeAndStoreSkills(rawSkillNames);
    
    // We need to map the returned normalized IDs back to their original weights.
    // normalizeAndStoreSkills just returns unique skill IDs, but in this case we
    // need to know which ID corresponds to which original raw name to assign the weight.
    // However, our NormalizationService currently only returns canonical IDs without the mapping.
    // As a workaround, we can normalize them one by one to keep track of the weight.
    
    const processedSkills: Array<{ skillId: string, weight: number }> = [];
    
    // Using a simple Map to avoid duplicate skill IDs within the same job (taking highest weight)
    const skillIdToWeight = new Map<string, number>();

    for (const skillReq of data.skills) {
      // Normalize one by one (or batch and map back if we modify the service)
      const ids = await this.normalizationService.normalizeAndStoreSkills([skillReq.name]);
      if (ids.length > 0) {
        const canonicalId = ids[0];
        const existingWeight = skillIdToWeight.get(canonicalId) || 0;
        if (skillReq.weight > existingWeight) {
          skillIdToWeight.set(canonicalId, skillReq.weight);
        }
      }
    }

    for (const [skillId, weight] of skillIdToWeight.entries()) {
      processedSkills.push({ skillId, weight });
    }

    return this.jobRepository.createJob(recruiterId, data.title, data.description, processedSkills);
  }

  public async getJobs() {
    return this.jobRepository.getJobs();
  }
}

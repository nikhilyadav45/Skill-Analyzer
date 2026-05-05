import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { SkillsRepository } from '../skills/skills.repository';
import { ProfileRepository } from './profile.repository';

// Simple MVP keyword list for extraction
const TECH_KEYWORDS = new Set([
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust',
  'react', 'angular', 'vue', 'svelte', 'node.js', 'express', 'nestjs', 'django',
  'flask', 'spring boot', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'aws',
  'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'git', 'agile', 'machine learning',
  'data analysis', 'html', 'css', 'sass', 'tailwind'
]);

export class ResumeService {
  private skillsRepository: SkillsRepository;
  private profileRepository: ProfileRepository;

  constructor() {
    this.skillsRepository = new SkillsRepository();
    this.profileRepository = new ProfileRepository();
  }

  public async extractAndStoreSkills(userId: string, filePath: string) {
    const candidateProfile = await this.profileRepository.getProfileByUserId(userId);
    if (!candidateProfile) {
      throw new Error('Candidate profile not found. Please create a profile first.');
    }

    // 1. Read and parse PDF
    const dataBuffer = fs.readFileSync(filePath);
    const uint = new Uint8Array(dataBuffer)
    const data = new PDFParse(uint)
    const text = (await data.getText()).text.toLowerCase();

    // 2. Extract keywords (MVP)
    const words = text.split(/[\s,.-]+/);
    const extractedSkills = new Set<string>();

    for (const word of words) {
      if (TECH_KEYWORDS.has(word)) {
        extractedSkills.add(word);
      }
    }

    // Also check for multi-word phrases (MVP implementation)
    TECH_KEYWORDS.forEach(keyword => {
      if (keyword.includes(' ') && text.includes(keyword)) {
        extractedSkills.add(keyword);
      }
    });

    const normalizedSkills = Array.from(extractedSkills);

    if (normalizedSkills.length === 0) {
      return { message: 'No predefined technical skills found in resume.', skills: [] };
    }

    // 3. Normalize and Upsert skills in DB (Returns Canonical IDs)
    const skillIds = await this.skillsRepository.processSkills(normalizedSkills);

    // 4. Map skills to candidate
    await this.skillsRepository.mapSkillsToCandidate(candidateProfile.id, skillIds);

    // 5. Update resume URL in profile
    await this.profileRepository.upsertProfile(userId, {
      resumeUrl: filePath
    });

    return {
      message: 'Resume parsed and skills extracted successfully',
      skillsExtracted: normalizedSkills,
    };
  }
}

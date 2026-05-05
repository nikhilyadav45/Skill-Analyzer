import { prisma } from '../../database/prisma';
import { GraphService } from './graph.service';

export class NormalizationService {
  private graphService: GraphService;

  constructor() {
    this.graphService = new GraphService();
  }

  // Seed the initial MVP aliases
  public async seedInitialAliases() {
    const defaultAliases: Record<string, string> = {
      'nodejs': 'node.js',
      'node': 'node.js',
      'ml': 'machine learning',
      'reactjs': 'react',
      'vuejs': 'vue',
      'k8s': 'kubernetes',
    };
    
    for (const [alias, canonical] of Object.entries(defaultAliases)) {
      const skill = await prisma.skill.upsert({
        where: { name: canonical },
        update: {},
        create: { name: canonical }
      });
      
      // Sync to Neo4j
      await this.graphService.syncSkill(skill.id, skill.name);

      await prisma.skillAlias.upsert({
        where: { alias },
        update: { skillId: skill.id },
        create: { alias, skillId: skill.id }
      });
    }
  }

  /**
   * Normalizes an array of raw skill strings.
   * If a string is a known alias, it maps to the canonical skill ID.
   * If it's a known canonical skill, it maps to that ID.
   * If it's completely new, it creates a new canonical skill.
   */
  public async normalizeAndStoreSkills(rawSkills: string[]): Promise<string[]> {
    const finalSkillIds = new Set<string>();
    const processedRaw = rawSkills.map(s => s.toLowerCase().trim());
    
    // 1. Check existing aliases
    const aliases = await prisma.skillAlias.findMany({
      where: { alias: { in: processedRaw } },
      include: { skill: true }
    });
    
    const matchedAliases = new Set<string>();
    for (const a of aliases) {
      finalSkillIds.add(a.skill.id);
      matchedAliases.add(a.alias);
    }
    
    // 2. Identify remaining skills (might be direct canonical names or new)
    const remainingSkills = processedRaw.filter(w => !matchedAliases.has(w));
    
    if (remainingSkills.length > 0) {
      // Check existing canonical skills
      const existingSkills = await prisma.skill.findMany({
        where: { name: { in: remainingSkills } }
      });
      
      const existingSkillNames = new Set(existingSkills.map(s => s.name));
      for (const s of existingSkills) {
        finalSkillIds.add(s.id);
      }
      
      // 3. Create new canonical skills for anything completely unknown
      const newSkills = remainingSkills.filter(w => !existingSkillNames.has(w));
      
      if (newSkills.length > 0) {
        await Promise.all(
          newSkills.map(name => 
            prisma.skill.create({
              data: { name }
            })
          )
        );
        
        // Fetch newly created to get their IDs
        const createdSkills = await prisma.skill.findMany({
          where: { name: { in: newSkills } }
        });
        
        for (const s of createdSkills) {
          finalSkillIds.add(s.id);
          // Sync to Neo4j Graph Database
          this.graphService.syncSkill(s.id, s.name).catch(console.error);
        }
      }
    }
    
    return Array.from(finalSkillIds);
  }
}

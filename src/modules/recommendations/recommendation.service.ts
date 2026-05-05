import { prisma } from '../../database/prisma';
import { NormalizationService } from '../skills/normalization.service';
import { GraphService } from '../skills/graph.service';

export class RecommendationService {
  private normalizationService: NormalizationService;
  private graphService: GraphService;

  constructor() {
    this.normalizationService = new NormalizationService();
    this.graphService = new GraphService();
  }

  // Pre-seed some dummy relationships for MVP demonstration
  public async seedInitialRelationships() {
    try {
      const parentChildPairs = [
        ['javascript', 'react'],
        ['javascript', 'node.js'],
        ['node.js', 'express'],
        ['python', 'machine learning'],
      ];

      for (const [parentName, childName] of parentChildPairs) {
        const parentIds = await this.normalizationService.normalizeAndStoreSkills([parentName]);
        const childIds = await this.normalizationService.normalizeAndStoreSkills([childName]);

        if (parentIds.length > 0 && childIds.length > 0) {
          await prisma.skillRelationship.upsert({
            where: {
              parentSkillId_childSkillId: {
                parentSkillId: parentIds[0],
                childSkillId: childIds[0],
              },
            },
            update: {},
            create: {
              parentSkillId: parentIds[0],
              childSkillId: childIds[0],
            },
          });

          // Sync to Neo4j (child REQUIRES parent)
          await this.graphService.addPrerequisite(parentIds[0], childIds[0]);
        }
      }
    } catch (error) {
      console.error('Failed to seed relationships:', error);
    }
  }

  public async getLearningPath(userId: string, missingSkillNames: string[]) {
    // 1. Get canonical IDs for missing skills
    const missingSkillIds = await this.normalizationService.normalizeAndStoreSkills(missingSkillNames);

    // 2. Fetch User's existing skills
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { candidateSkills: true },
    });
    
    if (!profile) {
      throw new Error('Profile not found.');
    }
    
    const userSkillIds = new Set(profile.candidateSkills.map(s => s.skillId));

    // 3. Build full dependency graph in memory (MVP is small enough)
    const allRelationships = await prisma.skillRelationship.findMany();
    
    // prerequisitesGraph[skill] = [list of immediate prerequisites]
    const prerequisitesGraph = new Map<string, string[]>();
    for (const rel of allRelationships) {
      if (!prerequisitesGraph.has(rel.childSkillId)) {
        prerequisitesGraph.set(rel.childSkillId, []);
      }
      prerequisitesGraph.get(rel.childSkillId)!.push(rel.parentSkillId);
    }

    // 4. Find all required skills (including deep prerequisites)
    const allRequiredSkillIds = new Set<string>();
    
    const collectPrerequisites = (skillId: string) => {
      if (allRequiredSkillIds.has(skillId)) return;
      allRequiredSkillIds.add(skillId);
      
      const prereqs = prerequisitesGraph.get(skillId) || [];
      for (const req of prereqs) {
        collectPrerequisites(req);
      }
    };

    for (const missingId of missingSkillIds) {
      collectPrerequisites(missingId);
    }

    // 5. Filter out skills the user already has
    const skillsToLearn = new Set<string>();
    for (const reqId of allRequiredSkillIds) {
      if (!userSkillIds.has(reqId)) {
        skillsToLearn.add(reqId);
      }
    }

    // 6. Topological Sort to establish learning order
    // Order from most fundamental (no prereqs in set) to most advanced
    const orderedLearningPath: string[] = [];
    const visited = new Set<string>();
    const processing = new Set<string>(); // to detect cycles

    const visit = (node: string) => {
      if (!skillsToLearn.has(node)) return; // Only process skills we actually need to learn
      if (visited.has(node)) return;
      if (processing.has(node)) return; // Ignore circular dependency edge

      processing.add(node);
      
      const prereqs = prerequisitesGraph.get(node) || [];
      for (const prereq of prereqs) {
        visit(prereq);
      }
      
      processing.delete(node);
      visited.add(node);
      orderedLearningPath.push(node);
    };

    for (const skill of skillsToLearn) {
      visit(skill);
    }

    // 7. Resolve names
    const skillsDb = await prisma.skill.findMany({
      where: { id: { in: orderedLearningPath } }
    });
    
    const idToName = new Map(skillsDb.map(s => [s.id, s.name]));
    
    const roadmap = orderedLearningPath.map(id => idToName.get(id)).filter(Boolean);

    return roadmap;
  }
}

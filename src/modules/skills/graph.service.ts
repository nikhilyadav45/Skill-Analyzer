import { neo4jDriver } from '../../database/neo4j';

export class GraphService {
  /**
   * Syncs a skill to Neo4j.
   */
  public async syncSkill(skillId: string, name: string) {
    const session = neo4jDriver.session();
    try {
      await session.run(
        `MERGE (s:Skill { id: $skillId })
         SET s.name = $name`,
        { skillId, name }
      );
    } catch (e: any) {
      console.warn('Neo4j sync failed:', e.message);
    } finally {
      await session.close();
    }
  }

  /**
   * Adds a prerequisite relationship in Neo4j.
   */
  public async addPrerequisite(parentSkillId: string, childSkillId: string) {
    const session = neo4jDriver.session();
    try {
      await session.run(
        `MATCH (p:Skill { id: $parentSkillId })
         MATCH (c:Skill { id: $childSkillId })
         MERGE (c)-[:REQUIRES]->(p)`,
        { parentSkillId, childSkillId }
      );
    } catch (e: any) {
      console.warn('Neo4j prerequisite sync failed:', e.message);
    } finally {
      await session.close();
    }
  }

  /**
   * Adds a related relationship in Neo4j.
   */
  public async addRelated(skillId1: string, skillId2: string) {
    const session = neo4jDriver.session();
    try {
      await session.run(
        `MATCH (s1:Skill { id: $skillId1 })
         MATCH (s2:Skill { id: $skillId2 })
         MERGE (s1)-[:RELATED_TO]-(s2)`,
        { skillId1, skillId2 }
      );
    } catch (e: any) {
      console.warn('Neo4j related sync failed:', e.message);
    } finally {
      await session.close();
    }
  }

  /**
   * Finds related skills up to 2 hops away.
   */
  public async findRelatedSkills(skillId: string): Promise<Array<{ id: string; name: string }>> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (s:Skill { id: $skillId })-[:RELATED_TO*1..2]-(related)
         RETURN DISTINCT related.id AS id, related.name AS name
         LIMIT 10`,
        { skillId }
      );
      
      return result.records.map((record) => ({
        id: record.get('id'),
        name: record.get('name'),
      }));
    } catch (e: any) {
      console.warn('Neo4j findRelated failed:', e.message);
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Infers missing prerequisite skills.
   */
  public async inferMissingPrerequisites(targetSkillIds: string[], userSkillIds: string[]): Promise<Array<{ id: string; name: string }>> {
    const session = neo4jDriver.session();
    try {
      // Find all prerequisites for the target skills that the user doesn't have
      const result = await session.run(
        `MATCH (target:Skill)-[:REQUIRES*1..5]->(prereq:Skill)
         WHERE target.id IN $targetSkillIds AND NOT prereq.id IN $userSkillIds
         RETURN DISTINCT prereq.id AS id, prereq.name AS name`,
        { targetSkillIds, userSkillIds }
      );
      
      return result.records.map((record) => ({
        id: record.get('id'),
        name: record.get('name'),
      }));
    } catch (e: any) {
      console.warn('Neo4j inferMissingPrerequisites failed:', e.message);
      return [];
    } finally {
      await session.close();
    }
  }
}

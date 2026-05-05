import { Request, Response, NextFunction } from 'express';
import { RecommendationService } from './recommendation.service';
import { recommendationSchema } from './dto/recommendation.dto';
import { ZodError } from 'zod';

export class RecommendationController {
  private recommendationService: RecommendationService;

  constructor() {
    this.recommendationService = new RecommendationService();
    // Seed initial demo data
    this.recommendationService.seedInitialRelationships();
  }

  public async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const validatedData = recommendationSchema.parse(req.body);
      
      const roadmap = await this.recommendationService.getLearningPath(userId, validatedData.missingSkills);
      
      res.status(200).json({
        success: true,
        data: roadmap,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }
}

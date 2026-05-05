import { Request, Response, NextFunction } from 'express';
import { MatchingService } from './matching.service';

export class MatchingController {
  private matchingService: MatchingService;

  constructor() {
    this.matchingService = new MatchingService();
  }

  public async getJobMatches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Must be an authenticated candidate to match against jobs
      const userId = req.user!.id;
      
      const matches = await this.matchingService.getMatchesForCandidate(userId);
      
      res.status(200).json({
        success: true,
        data: matches,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { ProfileService } from './profile.service';
import { ResumeService } from './resume.service';
import { updateProfileSchema } from './dto/profile.dto';
import { ZodError } from 'zod';

export class ProfileController {
  private profileService: ProfileService;
  private resumeService: ResumeService;

  constructor() {
    this.profileService = new ProfileService();
    this.resumeService = new ResumeService();
  }

  public async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await this.profileService.getProfile(userId);
      
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Profile not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const validatedData = updateProfileSchema.parse(req.body);
      
      const profile = await this.profileService.updateProfile(userId, validatedData);
      
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      next(error);
    }
  }

  public async uploadResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const result = await this.resumeService.extractAndStoreSkills(userId, req.file.path);
      
      res.status(200).json({
        success: true,
        data: result,
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

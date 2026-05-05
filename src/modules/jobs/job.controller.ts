import { Request, Response, NextFunction } from 'express';
import { JobService } from './job.service';
import { createJobSchema } from './dto/job.dto';
import { ZodError } from 'zod';

export class JobController {
  private jobService: JobService;

  constructor() {
    this.jobService = new JobService();
  }

  public async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recruiterId = req.user!.id;
      const validatedData = createJobSchema.parse(req.body);
      
      const job = await this.jobService.createJob(recruiterId, validatedData);
      
      res.status(201).json({
        success: true,
        data: job,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      next(error);
    }
  }

  public async getJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jobs = await this.jobService.getJobs();
      
      res.status(200).json({
        success: true,
        data: jobs,
      });
    } catch (error) {
      next(error);
    }
  }
}

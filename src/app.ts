import express, { Application } from 'express';
import cors from 'cors';
import { healthRoutes } from './modules/health/health.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { profileRoutes } from './modules/users/profile.routes';
import { jobRoutes } from './modules/jobs/job.routes';
import { matchingRoutes } from './modules/matching/matching.routes';
import { recommendationRoutes } from './modules/recommendations/recommendation.routes';
import { errorHandler } from './common/middleware/errorHandler';

export class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    this.app.use('/api/health', healthRoutes);
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/profile', profileRoutes);
    // Order matters: match route before general job routes if they share a prefix
    this.app.use('/api/jobs/match', matchingRoutes);
    this.app.use('/api/jobs', jobRoutes);
    this.app.use('/api/recommendations', recommendationRoutes);
    // Future routes will be added here
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }
}

export default new App().app;

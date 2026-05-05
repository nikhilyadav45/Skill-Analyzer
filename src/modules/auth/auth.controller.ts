import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema } from './dto/auth.dto';
import { ZodError } from 'zod';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const user = await this.authService.register(validatedData);
      
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      if (error instanceof Error && error.message === 'User already exists with this email') {
        res.status(409).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await this.authService.login(validatedData);
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, errors: error.errors });
        return;
      }
      if (error instanceof Error && error.message === 'Invalid credentials') {
        res.status(401).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }
}

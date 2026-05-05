import { Router } from 'express';
import { RecommendationController } from './recommendation.controller';
import { authGuard } from '../../common/middleware/auth.guard';
import { roleGuard } from '../../common/middleware/role.guard';

const router = Router();
const recommendationController = new RecommendationController();

// Typically a CANDIDATE generates a roadmap for themselves
router.post('/', authGuard, roleGuard(['CANDIDATE']), recommendationController.getRecommendations.bind(recommendationController));

export const recommendationRoutes = router;

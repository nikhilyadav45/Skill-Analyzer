import { Router } from 'express';
import { MatchingController } from './matching.controller';
import { authGuard } from '../../common/middleware/auth.guard';
import { roleGuard } from '../../common/middleware/role.guard';

const router = Router();
const matchingController = new MatchingController();

// Only CANDIDATEs typically fetch matches for themselves
router.get('/', authGuard, roleGuard(['CANDIDATE']), matchingController.getJobMatches.bind(matchingController));

export const matchingRoutes = router;

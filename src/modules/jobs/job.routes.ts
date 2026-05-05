import { Router } from 'express';
import { JobController } from './job.controller';
import { authGuard } from '../../common/middleware/auth.guard';
import { roleGuard } from '../../common/middleware/role.guard';

const router = Router();
const jobController = new JobController();

// GET /jobs is open to any authenticated user (or we could make it public, but requirements say "job system fully working" with constraints "Only recruiters can create jobs")
router.get('/', authGuard, jobController.getJobs.bind(jobController));

// POST /jobs is restricted to RECRUITER
router.post('/', authGuard, roleGuard(['RECRUITER']), jobController.createJob.bind(jobController));

export const jobRoutes = router;

import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { authGuard } from '../../common/middleware/auth.guard';
import { upload } from '../../common/middleware/upload';

const router = Router();
const profileController = new ProfileController();

// All profile routes require authentication
router.use(authGuard);

router.get('/', profileController.getProfile.bind(profileController));
router.put('/', profileController.updateProfile.bind(profileController));
router.post('/resume', upload.single('resume'), profileController.uploadResume.bind(profileController));

export const profileRoutes = router;

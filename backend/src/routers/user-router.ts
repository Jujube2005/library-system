import { Router } from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/user-controller';
import { protect } from '../middleware/auth-middleware';

const router = Router();

router.get('/me', protect, getMyProfile);
router.patch('/me', protect, updateMyProfile);

export default router;

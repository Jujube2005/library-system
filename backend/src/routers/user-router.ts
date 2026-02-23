import { Router } from 'express';
import { getMyProfile } from '../controllers/user-controller';
import { protect } from '../middleware/auth-middleware';

const router = Router();


router.get('/me', protect, getMyProfile);

export default router;
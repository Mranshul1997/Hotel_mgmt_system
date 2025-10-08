import { Router } from 'express';
import { checkInUser } from '../controllers/manageReportsController';

const router = Router();

router.post('/checkin', checkInUser);

export default router;

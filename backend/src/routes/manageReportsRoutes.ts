import { Router } from 'express';
import { checkInUser, checkoutUser, getMonthlyReport, getDailyReport } from '../controllers/manageReportsController';

const router = Router();

router.post('/checkin', checkInUser);
router.post('/checkout', checkoutUser);
router.post('/monthly', getMonthlyReport);
router.post('/daily', getDailyReport);

export default router;

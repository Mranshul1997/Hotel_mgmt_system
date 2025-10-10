import { Router } from 'express';
import { checkInUser, checkoutUser, getMonthlyReport, getDailyReport, getPayrollReport, dashboardReport } from '../controllers/manageReportsController';

const router = Router();

router.post('/checkin', checkInUser);
router.post('/checkout', checkoutUser);
router.post('/monthly', getMonthlyReport);
router.post('/daily', getDailyReport);
router.get('/payroll/:year/:month', getPayrollReport);
router.get('/dashboard/:year/:month', dashboardReport);

export default router;

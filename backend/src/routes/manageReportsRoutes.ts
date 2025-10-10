import { Router } from 'express';
import { checkInUser, checkoutUser, getMonthlyReport, getDailyReport, getPayrollReport, dashboardReport, exportPayrollCsv } from '../controllers/manageReportsController';

const router = Router();

router.post('/checkin', checkInUser);
router.post('/checkout', checkoutUser);
router.post('/monthly', getMonthlyReport);
router.post('/daily', getDailyReport);
router.get('/payroll/:year/:month', getPayrollReport);
router.get('/dashboard/:year/:month', dashboardReport);
router.get('/payroll-csv/:year/:month', exportPayrollCsv);

export default router;

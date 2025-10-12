import { Router } from "express";
import {
  checkInUser,
  checkoutUser,
  getMonthlyReport,
  getDailyReport,
  getPayrollReport,
  dashboardReport,
  exportPayrollCsv,
  exportPayrollPdf,
  exportUserPayrollPdf,
} from "../controllers/manageReportsController";

const router = Router();
router.get("/reports/payroll-pdf/debug", (req, res) => {
  console.log("DEBUG PDF ENDPOINT HIT");
  res.send("DEBUG OK");
});

router.post("/checkin", checkInUser);
router.post("/checkout", checkoutUser);
router.post("/monthly", getMonthlyReport);
router.post("/daily", getDailyReport);
router.get("/payroll/:year/:month", getPayrollReport);
router.get("/dashboard/:year/:month", dashboardReport);
router.get("/payroll-csv/:year/:month", exportPayrollCsv);
router.get("/payroll-pdf/:year/:month/:userId", exportUserPayrollPdf);
router.get("/payroll-pdf/:year/:month", exportPayrollPdf);

export default router;

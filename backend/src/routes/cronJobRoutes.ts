import { Router } from "express";
import { runWeeklyTimesheet } from "../controllers/cronJobController";

const router = Router();

// POST /api/reports/run-weekly
router.post("/run-weekly", runWeeklyTimesheet);

export default router;

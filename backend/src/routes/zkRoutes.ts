import express from "express";
import { getDeviceInfo, getDeviceUsers, getDeviceLogs, syncBiometricLogs } from "../controllers/zkController";

const router = express.Router();

router.get("/device-info", getDeviceInfo);
router.get("/device-users", getDeviceUsers);
router.get("/device-logs", getDeviceLogs);
router.get("/biometric-sync", syncBiometricLogs);


export default router;

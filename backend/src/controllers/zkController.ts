import { Request, Response } from "express";
import dotenv from "dotenv";
import { ZKDeviceService } from "../services/zkService";

dotenv.config();

// Load device details from `.env`
const ZK_IP = process.env.ZK_IP || "10.20.0.7";
const ZK_PORT = Number(process.env.ZK_PORT) || 4370;
const ZK_TIMEOUT = Number(process.env.ZK_TIMEOUT) || 10000;
const ZK_INBUFFER = Number(process.env.ZK_INBUFFER) || 4000;

// Controller: Get general device info
export const getDeviceInfo = async (req: Request, res: Response) => {
  const zkService = new ZKDeviceService(ZK_IP, ZK_PORT, ZK_TIMEOUT, ZK_INBUFFER);
  try {
    await zkService.connect();
    const info = await zkService.getDeviceInfo();
    await zkService.disconnect();
    res.json({
      success: true,
      device: ZK_IP,
      info,
    });
  } catch (err: any) {
    console.error("Error fetching device info:", err);
    res.status(500).json({
      success: false,
      message: "Failed to connect to ZK device",
      error: err.message,
    });
  }
};

// Controller: Get all users from the device
export const getDeviceUsers = async (req: Request, res: Response) => {
  const zkService = new ZKDeviceService(ZK_IP, ZK_PORT, ZK_TIMEOUT, ZK_INBUFFER);
  try {
    await zkService.connect();
    const users = await zkService.getUsers();
    await zkService.disconnect();
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err: any) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users from ZK device",
      error: err.message,
    });
  }
};

// Controller: Get all attendance logs
export const getDeviceLogs = async (req: Request, res: Response) => {
  const zkService = new ZKDeviceService(ZK_IP, ZK_PORT, ZK_TIMEOUT, ZK_INBUFFER);
  try {
    await zkService.connect();
    const logs = await zkService.getAttendances();
    await zkService.disconnect();
    res.json({
      success: true,
      totalLogs: logs.length,
      logs,
    });
  } catch (err: any) {
    console.error("Error fetching logs:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch logs from ZK device",
      error: err.message,
    });
  }
};

export const getUserLogs = async (req: Request, res: Response) => {
  const userId = req.params.userId;  // pass userId in URL
  const zkService = new ZKDeviceService(ZK_IP, ZK_PORT, ZK_TIMEOUT, ZK_INBUFFER);
  try {
    await zkService.connect();
    const logs = await zkService.getAttendances();  // modify for specific user if API supports
    await zkService.disconnect();
    // Filter logs for userId if logs contain user info
const userLogs = logs.filter((log: any) => log.userId === userId);
    res.json({ logs: userLogs });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logs", error: err });
  }
};

export const syncBiometricLogs = async (req: Request, res: Response) => {
  const zkService = new ZKDeviceService(ZK_IP, ZK_PORT, ZK_TIMEOUT, ZK_INBUFFER);
  try {
    await zkService.connect();
    const logs = await zkService.getAttendances(); // All punch logs
    await zkService.disconnect();
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: "Error syncing biometric logs", error });
  }
};
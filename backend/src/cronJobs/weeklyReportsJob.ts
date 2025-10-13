import cron from "node-cron";
import User from "../models/userModel";
import ManageReport from "../models/manageReportsModel";

/**
 * Helper: returns all 7 dates (Mon → Sun) of current week
 */
const getWeekDates = (): Date[] => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1);

  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d);
  }
  return weekDates;
};

/**
 * Core function — can be called by API or cron
 */
export const generateWeeklyTimesheets = async (): Promise<string> => {
  const activeUsers = await User.find({ active: true });

  if (activeUsers.length === 0) {
    return "⚠️ No active users found.";
  }

  const weekDates = getWeekDates();
  const allReports: any[] = [];

  for (const user of activeUsers) {
    for (const date of weekDates) {
      allReports.push({
        userId: user._id,
        checkInTime: "",
        shiftTiming: "",
        totalDeductionsAmount: 0,
        totalOtAmount: 0,
        lateDuration: 0,
        otDuration: 0,
        netDaySalary: user.perDaySalary || 0,
        executionDate: date,
      });
    }
  }

  await ManageReport.insertMany(allReports);
  return `✅ Inserted ${allReports.length} weekly timesheet records for ${activeUsers.length} users.`;
};

/**
 * Schedule Cron — every Monday at 3:00 AM
 */
cron.schedule("0 3 * * 1", async () => {
  console.log("🕒 Weekly Timesheet Job started:", new Date().toLocaleString());
  try {
    const result = await generateWeeklyTimesheets();
    console.log(result);
  } catch (err) {
    console.error("❌ Error running weekly timesheet job:", err);
  }
});

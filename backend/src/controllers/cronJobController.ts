import { Request, Response } from "express";
// Update the import path to match the actual file name and location
import { generateWeeklyTimesheets } from "../cronJobs/weeklyReportsJob";

export const runWeeklyTimesheet = async (req: Request, res: Response) => {
  try {
    const result = await generateWeeklyTimesheets();
    res.status(200).json({ success: true, message: result });
  } catch (err: any) {
    console.error("Error generating weekly timesheets:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

import { Request, Response } from "express";
import User from "../models/userModel";
import Shift from "../models/shiftModel";
import ManageReport from "../models/manageReportsModel";
import mongoose from "mongoose";
const { Parser } = require("json2csv");
import moment from "moment";

export const checkInUser = async (req: Request, res: Response) => {
  try {
    const { userId, checkInTime } = req.body;

    console.log("checkInUser called with:", { userId, checkInTime });

    // Validate input
    if (!userId || !checkInTime) {
      console.log("Validation failed: Missing userId or checkInTime");
      return res
        .status(400)
        .json({ message: "userId and checkInTime are required." });
    }

    // 1. Get user and shift
    const user = await User.findById(userId).populate("shiftId");
    console.log("Fetched user:", user);
    if (!user) {
      console.log("User not found for userId:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const shift = user.shiftId as any;
    console.log("Fetched shift:", shift);
    if (!shift) {
      console.log("User shift not assigned for user:", userId);
      return res.status(404).json({ message: "User shift not assigned" });
    }

    // 2. Parse times
    const checkIn = moment(checkInTime, "HH:mm");
    const shiftStart = moment(shift.checkInTime, "HH:mm").add(5, "minutes");
    console.log(
      "Parsed checkIn:",
      checkIn.format(),
      "shiftStart:",
      shiftStart.format()
    );

    // 3. Calculate lateness
    let lateDuration = 0;
    if (checkIn.isAfter(shiftStart)) {
      lateDuration = checkIn.diff(shiftStart, "minutes");
    }
    console.log("Late duration (minutes):", lateDuration);

    // 4. Calculate deduction
    const deduction = lateDuration * (user.perMinuteSalary || 0);
    console.log("Deduction:", deduction);

    // 5. Calculate netDaySalary
    const netDaySalary = (user.perDaySalary || 0) - deduction;
    console.log("Net day salary:", netDaySalary);

    // 6. Save to manage_reports
    const report = await ManageReport.create({
      userId: user._id,
      checkInTime,
      shiftTiming: `${shift.checkInTime} - ${shift.checkOutTime}`,
      totalDeductionsAmount: deduction,
      totalOtAmount: 0,
      lateDuration,
      otDuration: 0,
      netDaySalary,
    });
    console.log("Created report:", report);

    return res.status(201).json({
      message: "Check-in recorded",
      data: report,
    });
  } catch (error: any) {
    console.error("Check-in error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const checkoutUser = async (req: Request, res: Response) => {
  try {
    const { userId, checkOutTime } = req.body;

    console.log("checkoutUser called with:", { userId, checkOutTime });

    if (!userId || !checkOutTime) {
      console.log("Validation failed: Missing userId or checkOutTime");
      return res
        .status(400)
        .json({ message: "userId and checkOutTime are required." });
    }

    // 1. Get user and shift
    const user = await User.findById(userId).populate("shiftId");
    console.log("Fetched user:", user);
    if (!user) {
      console.log("User not found for userId:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const shift = user.shiftId as any;
    console.log("Fetched shift:", shift);
    if (!shift) {
      console.log("Shift not found for this user:", userId);
      return res.status(404).json({ message: "Shift not found for this user" });
    }

    // 2. Find the latest report for this user that has a checkInTime
    const report = await ManageReport.findOne({
      userId,
      checkInTime: { $exists: true, $ne: null },
    }).sort({ createdAt: -1 });
    console.log("Fetched report for checkout:", report);

    if (!report) {
      console.log("No existing check-in report found for this user:", userId);
      return res
        .status(404)
        .json({ message: "No existing check-in report found for this user" });
    }

    // 3. Calculate OT
    const shiftCheckoutWithBuffer = moment(shift.checkOutTime, "HH:mm").add(
      30,
      "minutes"
    );
    const actualCheckout = moment(checkOutTime, "HH:mm");
    console.log(
      "shiftCheckoutWithBuffer:",
      shiftCheckoutWithBuffer.format(),
      "actualCheckout:",
      actualCheckout.format()
    );

    let otDuration = 0;
    let otAmount = 0;

    if (actualCheckout.isAfter(shiftCheckoutWithBuffer)) {
      otDuration = actualCheckout.diff(shiftCheckoutWithBuffer, "minutes");
      otAmount = otDuration * (user.perMinuteSalary || 0);
    }
    console.log("OT duration:", otDuration, "OT amount:", otAmount);

    // 4. Recalculate netDaySalary
    const deduction = report.totalDeductionsAmount || 0;
    const netDaySalary = (user.perDaySalary || 0) - deduction + otAmount;
    console.log("Deduction:", deduction, "Net day salary:", netDaySalary);

    // 5. Update the report
    report.checkOutTime = checkOutTime;
    report.otDuration = otDuration;
    report.totalOtAmount = otAmount;
    report.netDaySalary = netDaySalary;

    await report.save();
    console.log("Updated report after checkout:", report);

    return res.status(200).json({
      message: "Check-out updated successfully",
      data: report,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getMonthlyReport = async (req: Request, res: Response) => {
  try {
    const { userId, month, year } = req.body;
    console.log("getMonthlyReport called with:", { userId, month, year });
    if (!userId || !month || !year) {
      console.log("Validation failed: Missing userId, month or year");
      return res
        .status(400)
        .json({ message: "userId, month and year are required." });
    }

    // build date range for month
    const start = new Date(year, month - 1, 1, 0, 0, 0);
    const end = new Date(year, month, 1, 0, 0, 0); // exclusive upper bound
    console.log("Date range:", { start, end });

    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          totalLateDuration: { $sum: "$lateDuration" },
          totalOtDuration: { $sum: "$otDuration" },
          totalDeductionAmount: { $sum: "$totalDeductionsAmount" },
          totalOtAmount: { $sum: "$totalOtAmount" },
          totalNetSalary: { $sum: "$netDaySalary" },
        },
      },
    ];

    const agg = await ManageReport.aggregate(pipeline);
    console.log("Aggregation result:", agg);

    const result = agg[0] || {
      totalDays: 0,
      totalLateDuration: 0,
      totalOtDuration: 0,
      totalDeductionAmount: 0,
      totalOtAmount: 0,
      totalNetSalary: 0,
    };

    return res.json({
      userId,
      month,
      year,
      report: result,
    });
  } catch (error: any) {
    console.error("Monthly report error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getDailyReport = async (req: Request, res: Response) => {
  try {
    const { userId, month, year } = req.body;
    console.log("getDailyReport called with:", { userId, month, year });
    if (!userId || !month || !year) {
      console.log("Validation failed: Missing userId, month or year");
      return res
        .status(400)
        .json({ message: "userId, month and year are required." });
    }

    const start = new Date(year, month - 1, 1, 0, 0, 0);
    const end = new Date(year, month, 1, 0, 0, 0);
    console.log("Date range:", { start, end });

    // First, fetch all daily records
    const dailyRecords = await ManageReport.find({
      userId: new mongoose.Types.ObjectId(userId),
      createdAt: { $gte: start, $lt: end },
    })
      .sort({ createdAt: 1 })
      .lean();
    console.log("Fetched dailyRecords:", dailyRecords.length);

    // Then aggregate totals
    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          totalLateDuration: { $sum: "$lateDuration" },
          totalOtDuration: { $sum: "$otDuration" },
          totalDeductionAmount: { $sum: "$totalDeductionsAmount" },
          totalOtAmount: { $sum: "$totalOtAmount" },
          totalNetSalary: { $sum: "$netDaySalary" },
        },
      },
    ];

    const agg = await ManageReport.aggregate(pipeline);
    console.log("Aggregation result:", agg);
    const totals = agg[0] || {
      totalDays: 0,
      totalLateDuration: 0,
      totalOtDuration: 0,
      totalDeductionAmount: 0,
      totalOtAmount: 0,
      totalNetSalary: 0,
    };

    return res.json({
      userId,
      month,
      year,
      totals,
      dailyRecords,
    });
  } catch (error: any) {
    console.error("Daily report error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getPayrollReport = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;
    console.log("getPayrollReport called with:", { year, month });

    // Convert to integers
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);

    // Define start and end dates of the month
    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 1);
    console.log("Date range:", { startDate, endDate });

    // MongoDB aggregation pipeline
    const monthlyReport = await ManageReport.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: "$userId",
          deductionAmount: { $sum: "$totalDeductionsAmount" },
          oTAmount: { $sum: "$totalOtAmount" },
          netSalary: { $sum: "$netDaySalary" },
        },
      },
      {
        // Lookup user details (optional)
        $lookup: {
          from: "users", // collection name in MongoDB
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        // Compute grand totals
        $group: {
          _id: null,
          users: {
            $push: {
              userId: "$_id",
              name: "$userDetails.name",
              salary: "$userDetails.salary",
              role: "$userDetails.role",
              deductionAmount: "$deductionAmount",
              oTAmount: "$oTAmount",
              netSalary: "$netSalary",
              empId: "$userDetails.empId",
            },
          },
          totaldeducationAmount: { $sum: "$deductionAmount" },
          totalOTAmount: { $sum: "$oTAmount" },
          totalNetSalary: { $sum: "$netSalary" },
        },
      },
      {
        $project: {
          _id: 0,
          users: 1,
          totaldeducationAmount: 1,
          totalOTAmount: 1,
          totalNetSalary: 1,
        },
      },
    ]);
    console.log("Payroll monthlyReport:", monthlyReport);

    res.status(200).json(monthlyReport[0] || { users: [], totals: {} });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const dashboardReport = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;
    console.log("dashboardReport called with:", { year, month });

    const yearInt = parseInt(year);
    const monthInt = parseInt(month);

    // Define date ranges
    const startOfMonth = new Date(yearInt, monthInt - 1, 1);
    const endOfMonth = new Date(yearInt, monthInt, 1);
    console.log("Month date range:", { startOfMonth, endOfMonth });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    console.log("Today date range:", { todayStart, todayEnd });

    // -----------------
    // Promise 1: Today Summary
    // -----------------
    const todaySummaryPromise = (async () => {
      const totalEmployees = await User.countDocuments();
      console.log("Total employees:", totalEmployees);

      const presentToday = await ManageReport.countDocuments({
        createdAt: { $gte: todayStart, $lte: todayEnd },
      });
      console.log("Present today:", presentToday);

      const shiftViolations = await ManageReport.countDocuments({
        createdAt: { $gte: todayStart, $lte: todayEnd },
        totalDeductionsAmount: { $gt: 0 },
      });
      console.log("Shift violations today:", shiftViolations);

      return {
        totalEmployees,
        presentToday,
        shiftViolations,
      };
    })();

    // -----------------
    // Promise 2: Monthly Summary (Grouped by Day)
    // -----------------
    const monthlySummaryPromise = (async () => {
      const monthlyStats = await ManageReport.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth, $lt: endOfMonth },
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$createdAt" },
            presentCount: { $sum: 1 },
            shiftViolations: {
              $sum: {
                $cond: [{ $gt: ["$totalDeductionsAmount", 0] }, 1, 0],
              },
            },
            overtimeCount: {
              $sum: {
                $cond: [{ $gt: ["$totalOtAmount", 0] }, 1, 0],
              },
            },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            _id: 0,
            day: "$_id",
            presentCount: 1,
            shiftViolations: 1,
            overtimeCount: 1,
          },
        },
      ]);
      console.log("Monthly stats:", monthlyStats);

      return monthlyStats;
    })();

    // -----------------
    // Execute Both Promises in Parallel
    // -----------------
    const [todaySummary, monthlySummary] = await Promise.all([
      todaySummaryPromise,
      monthlySummaryPromise,
    ]);
    console.log("Dashboard todaySummary:", todaySummary);
    console.log("Dashboard monthlySummary:", monthlySummary);

    // -----------------
    // Final Dashboard Response
    // -----------------
    res.status(200).json({
      todaySummary,
      monthlySummary,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};
export const exportPayrollCsv = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;
    // Use your getPayrollReport aggregation:
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);
    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 1);

    // Run same aggregation as payroll, but only get user array
    const monthlyReport = await ManageReport.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: "$userId",
          deductionAmount: { $sum: "$totalDeductionsAmount" },
          oTAmount: { $sum: "$totalOtAmount" },
          netSalary: { $sum: "$netDaySalary" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userId: "$_id",
          name: "$userDetails.name",
          role: "$userDetails.role",
          salary: "$userDetails.salary",
          deductionAmount: 1,
          oTAmount: 1,
          netSalary: 1,
        },
      },
    ]);

    // Format data for CSV
    const fields = [
      { label: "Employee ID", value: "userId" },
      { label: "Name", value: "name" },
      { label: "Role", value: "role" },
      { label: "Base Salary", value: "salary" },
      { label: "OT", value: "oTAmount" },
      { label: "Late Deduction", value: "deductionAmount" },
      { label: "Net Pay", value: "netSalary" },
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(monthlyReport);

    res.header("Content-Type", "text/csv");
    res.attachment(`payroll_report_${year}_${month}.csv`);
    return res.send(csv);
  } catch (error) {
    console.error("CSV export error: ", error);
    return res.status(500).json({ message: "Could not generate CSV", error });
  }
};

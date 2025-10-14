import { Request, Response } from "express";
import User from "../models/userModel";
import ManageReport from "../models/manageReportsModel";
import mongoose from "mongoose";
const { Parser } = require("json2csv");
import moment from "moment-timezone";
import path from "path";
import fs from "fs";
const PDFDocument = require("pdfkit");

/**
 * Apply Leave API
 */
export const applyLeave = async (req: Request, res: Response) => {
  try {
    const { reportId, leaveType } = req.body;

    if (!reportId || !leaveType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: reportId and leaveType",
      });
    }

    const report = await ManageReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: "ManageReport not found" });
    }

  const user = await User.findById(report.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found for this report" });
    }

    // Mark leave
    report.applyLeave = true;
    report.leaveType = leaveType;

    if (leaveType === "unpaid") {
      report.totalDeductionsAmount = user.perDaySalary;
    } else if (leaveType === "paid") {
      report.totalDeductionsAmount = 0; // no deductions for paid leave
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: `Leave applied successfully as ${leaveType.toUpperCase()}`,
      data: report,
    });
  } catch (err: any) {
    console.error("Error applying leave:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const checkInUser = async (req: Request, res: Response) => {
  try {
    const { userId, checkInTime } = req.body;

    if (!userId || !checkInTime) {
      return res
        .status(400)
        .json({ message: "userId and checkInTime are required." });
    }

    const user = await User.findById(userId).populate("shiftId");
    if (!user) return res.status(404).json({ message: "User not found" });

    const shift = user.shiftId as any;
    if (!shift) return res.status(404).json({ message: "Shift not assigned" });

    // Parse times in IST
    const checkIn = moment.tz(checkInTime, "HH:mm", "Asia/Kolkata");
    const shiftStart = moment
      .tz(shift.checkInTime, "HH:mm", "Asia/Kolkata")
      .add(5, "minutes");

    // Calculate late duration
    const lateDuration = checkIn.isAfter(shiftStart)
      ? checkIn.diff(shiftStart, "minutes")
      : 0;

    // Salary calculation
    const deduction = lateDuration * (user.perMinuteSalary || 0);
    const netDaySalary = (user.perDaySalary || 0) - deduction;

    // Use today's date in IST
    const executionDate = moment.tz("Asia/Kolkata").startOf("day").toDate();

    // Find existing record for today
    let report = await ManageReport.findOne({ userId, executionDate });

    if (report) {
      // Update existing record
      report.checkInTime = checkInTime;
      report.shiftTiming = `${shift.checkInTime} - ${shift.checkOutTime}`;
      report.totalDeductionsAmount = deduction;
      report.lateDuration = lateDuration;
      report.netDaySalary = netDaySalary;
      report.applyLeave = false;

      await report.save();

      return res
        .status(200)
        .json({ message: "Check-in updated successfully", data: report });
    } else {
      // Create new record
      report = await ManageReport.create({
        userId: user._id,
        checkInTime,
        shiftTiming: `${shift.checkInTime} - ${shift.checkOutTime}`,
        totalDeductionsAmount: deduction,
        totalOtAmount: 0,
        lateDuration,
        otDuration: 0,
        netDaySalary,
        executionDate,
        applyLeave: false,
        leaveType: null,
      });

      return res
        .status(201)
        .json({ message: "Check-in recorded successfully", data: report });
    }
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const checkoutUser = async (req: Request, res: Response) => {
  try {
    const { userId, checkOutTime } = req.body;
    if (!userId || !checkOutTime) {
      return res
        .status(400)
        .json({ message: "userId and checkOutTime are required." });
    }

    const user = await User.findById(userId).populate("shiftId");
    if (!user) return res.status(404).json({ message: "User not found" });

    const shift = user.shiftId as any;
    if (!shift) return res.status(404).json({ message: "Shift not assigned" });

    // Find today's report in IST
    const todayISTStart = moment.tz("Asia/Kolkata").startOf("day").toDate();
    const todayISTEnd = moment.tz("Asia/Kolkata").endOf("day").toDate();

    const report = await ManageReport.findOne({
      userId,
      executionDate: { $gte: todayISTStart, $lte: todayISTEnd },
      checkInTime: { $exists: true, $ne: null },
    });

    if (!report)
      return res.status(404).json({ message: "No existing check-in report found" });

    // OT calculation
    const shiftCheckoutWithBuffer = moment.tz(shift.checkOutTime, "HH:mm", "Asia/Kolkata").add(30, "minutes");
    const actualCheckout = moment.tz(checkOutTime, "HH:mm", "Asia/Kolkata");

    let otDuration = 0;
    let otAmount = 0;
    if (actualCheckout.isAfter(shiftCheckoutWithBuffer)) {
      otDuration = actualCheckout.diff(shiftCheckoutWithBuffer, "minutes");
      otAmount = otDuration * (user.perMinuteSalary || 0);
    }

    const netDaySalary = (user.perDaySalary || 0) - (report.totalDeductionsAmount || 0) + otAmount;

    // Update report
    report.checkOutTime = checkOutTime;
    report.otDuration = otDuration;
    report.totalOtAmount = otAmount;
    report.netDaySalary = netDaySalary;

    await report.save();

    return res.status(200).json({ message: "Check-out updated successfully", data: report });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMonthlyReport = async (req: Request, res: Response) => {
  try {
    const { userId, month, year } = req.body;
    if (!userId || !month || !year) {
      return res.status(400).json({ message: "userId, month and year are required." });
    }

    // Month range in IST
    const start = moment.tz({ year, month: month - 1, day: 1 }, "Asia/Kolkata").startOf("day").toDate();
    const end = moment.tz({ year, month: month - 1, day: 1 }, "Asia/Kolkata").endOf("month").endOf("day").toDate();

    const records = await ManageReport.find({
      userId: new mongoose.Types.ObjectId(userId),
      executionDate: { $gte: start, $lte: end },
    }).sort({ executionDate: 1 }).lean();

    // Add showApply flag
    const todayIST = moment.tz("Asia/Kolkata").startOf("day");
    const recordsWithFlag = records.map((record) => ({
      ...record,
      showApply:
        (!record.checkInTime || record.checkInTime === "") &&
        moment(record.executionDate).tz("Asia/Kolkata").isAfter(todayIST),
    }));

    // Aggregation totals
    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          executionDate: { $gte: start, $lte: end },
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
      records: recordsWithFlag,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};


export const getDailyReport = async (req: Request, res: Response) => {
  try {
    const { userId, month, year } = req.body;
    if (!userId || !month || !year) {
      return res
        .status(400)
        .json({ message: "userId, month and year are required." });
    }

    // Step 1: Calculate month start and end in IST
    const start = moment.tz({ year, month: month - 1, day: 1 }, "Asia/Kolkata").startOf("day").toDate();
    const end = moment.tz({ year, month: month - 1, day: 1 }, "Asia/Kolkata").endOf("month").endOf("day").toDate();

    // Step 2: Fetch all daily records
    const dailyRecords = await ManageReport.find({
      userId: new mongoose.Types.ObjectId(userId),
      executionDate: { $gte: start, $lte: end },
    })
      .sort({ executionDate: 1 })
      .lean();

    // Current date in IST
    const todayIST = moment.tz("Asia/Kolkata").startOf("day");

    // Step 3: Add showApply flag
    const dailyRecordsWithFlag = dailyRecords.map((record) => ({
      ...record,
      showApply:
        (!record.checkInTime || record.checkInTime === "") &&
        moment(record.executionDate).tz("Asia/Kolkata").isAfter(todayIST),
    }));

    // Step 4: Aggregate totals (can remain in UTC, aggregation unaffected)
    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          executionDate: { $gte: start, $lte: end },
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
      dailyRecords: dailyRecordsWithFlag,
    });
  } catch (error: any) {
    console.error("Daily report error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getPayrollReport = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);

    // Month range in IST
    const startDate = moment.tz({ year: yearInt, month: monthInt - 1, day: 1 }, "Asia/Kolkata").startOf("day").toDate();
    const endDate = moment.tz({ year: yearInt, month: monthInt - 1, day: 1 }, "Asia/Kolkata").endOf("month").endOf("day").toDate();

    const monthlyReport = await ManageReport.aggregate([
      { $match: { executionDate: { $gte: startDate, $lte: endDate } } },
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
      { $project: { _id: 0, users: 1, totaldeducationAmount: 1, totalOTAmount: 1, totalNetSalary: 1 } },
    ]);

    res.status(200).json(monthlyReport[0] || { users: [], totals: {} });
  } catch (error) {
    console.error("Error generating payroll report:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const dashboardReport = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);

    const startOfMonth = moment.tz({ year: yearInt, month: monthInt - 1, day: 1 }, "Asia/Kolkata").startOf("day").toDate();
    const endOfMonth = moment.tz({ year: yearInt, month: monthInt - 1, day: 1 }, "Asia/Kolkata").endOf("month").endOf("day").toDate();

    const todayStart = moment.tz("Asia/Kolkata").startOf("day").toDate();
    const todayEnd = moment.tz("Asia/Kolkata").endOf("day").toDate();

    // Today Summary
    const todaySummaryPromise = (async () => {
      const totalEmployees = await User.countDocuments();

      const presentToday = await ManageReport.countDocuments({
        executionDate: { $gte: todayStart, $lte: todayEnd },
      });

      const shiftViolations = await ManageReport.countDocuments({
        executionDate: { $gte: todayStart, $lte: todayEnd },
        totalDeductionsAmount: { $gt: 0 },
      });

      return { totalEmployees, presentToday, shiftViolations };
    })();

    // Monthly summary
    const monthlySummaryPromise = (async () => {
      const monthlyStats = await ManageReport.aggregate([
        { $match: { executionDate: { $gte: startOfMonth, $lte: endOfMonth } } },
        {
          $group: {
            _id: { $dayOfMonth: "$executionDate" },
            presentCount: { $sum: 1 },
            shiftViolations: { $sum: { $cond: [{ $gt: ["$totalDeductionsAmount", 0] }, 1, 0] } },
            overtimeCount: { $sum: { $cond: [{ $gt: ["$totalOtAmount", 0] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, day: "$_id", presentCount: 1, shiftViolations: 1, overtimeCount: 1 } },
      ]);
      return monthlyStats;
    })();

    const [todaySummary, monthlySummary] = await Promise.all([todaySummaryPromise, monthlySummaryPromise]);

    res.status(200).json({ todaySummary, monthlySummary });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const exportPayrollCsv = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);

    const startDate = moment.tz({ year: yearInt, month: monthInt - 1, day: 1 }, "Asia/Kolkata").startOf("day").toDate();
    const endDate = moment.tz({ year: yearInt, month: monthInt - 1, day: 1 }, "Asia/Kolkata").endOf("month").endOf("day").toDate();

    const monthlyReport = await ManageReport.aggregate([
      { $match: { executionDate: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: "$userId",
          deductionAmount: { $sum: "$totalDeductionsAmount" },
          oTAmount: { $sum: "$totalOtAmount" },
          netSalary: { $sum: "$netDaySalary" },
        },
      },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userDetails" } },
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

export const exportUserPayrollCsv = async (req: Request, res: Response) => {
  try {
    const { year, month, userId } = req.params;
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);

    const startDate = moment.tz({ year: yearInt, month: monthInt - 1, day: 1 }, "Asia/Kolkata").startOf("day").toDate();
    const endDate = moment.tz({ year: yearInt, month: monthInt - 1, day: 1 }, "Asia/Kolkata").endOf("month").endOf("day").toDate();

    const reports = await ManageReport.find({
      userId: new mongoose.Types.ObjectId(userId),
      executionDate: { $gte: startDate, $lte: endDate },
    })
      .select("-_id checkInTime checkOutTime lateDuration otDuration totalDeductionsAmount totalOtAmount netDaySalary executionDate")
      .lean();

    const fields = [
      { label: "Date", value: (row: any) => moment(row.executionDate).tz("Asia/Kolkata").format("DD/MM/YYYY") },
      { label: "Check-In", value: "checkInTime" },
      { label: "Check-Out", value: "checkOutTime" },
      { label: "Late (min)", value: "lateDuration" },
      { label: "OT (min)", value: "otDuration" },
      { label: "Late Deduction (₹)", value: "totalDeductionsAmount" },
      { label: "OT Addition (₹)", value: "totalOtAmount" },
      { label: "Net Day Salary (₹)", value: "netDaySalary" },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(reports);

    res.header("Content-Type", "text/csv");
    res.attachment(`payroll_${userId}_${year}_${month}.csv`);
    return res.send(csv);
  } catch (error) {
    console.error("User CSV export error: ", error);
    res.status(500).json({ message: "Could not generate CSV", error });
  }
};

export const exportPayrollPdf = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);

    const startDate = moment.tz({ year: yearInt, month: monthInt - 1, day: 1 }, "Asia/Kolkata").startOf("day").toDate();
    const endDate = moment.tz({ year: yearInt, month: monthInt - 1, day: 1 }, "Asia/Kolkata").endOf("month").endOf("day").toDate();

    const monthlyReport = await ManageReport.aggregate([
      { $match: { executionDate: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: "$userId",
          deductionAmount: { $sum: "$totalDeductionsAmount" },
          oTAmount: { $sum: "$totalOtAmount" },
          netSalary: { $sum: "$netDaySalary" },
        },
      },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userDetails" } },
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

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=payroll_report_${year}_${month}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text(`Payroll Report - ${month}/${year}`, { align: "center" }).moveDown();

    doc.fontSize(13).text("EmpID   Name             Role        Salary    OT     Late Deduction   Net Pay").moveDown(0.2);

    monthlyReport.forEach((emp) => {
      doc.text(
        `${emp.userId || ""}    ${emp.name || "-"}      ${emp.role || "-"}     ${emp.salary || 0}     ${emp.oTAmount || 0}      ${emp.deductionAmount || 0}         ${emp.netSalary || 0}`
      );
    });

    doc.end();
  } catch (error) {
    console.error("PDF export error: ", error);
    return res.status(500).json({ message: "Could not generate PDF", error });
  }
};

export const exportUserPayrollPdf = async (req: Request, res: Response) => {
  try {
    const { year, month, userId } = req.params;
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);

    // IST-aware date range
    const startDate = moment.tz({ year: yearInt, month: monthInt - 1, day: 1 }, "Asia/Kolkata").startOf("day").toDate();
    const endDate = moment.tz({ year: yearInt, month: monthInt - 1, day: 1 }, "Asia/Kolkata").endOf("month").endOf("day").toDate();

    const reports = await ManageReport.find({
      userId: new mongoose.Types.ObjectId(userId),
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

    const user = await User.findById(userId);

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const assetsDir = path.resolve(__dirname, "../../assets");
    const fontPath = path.join(assetsDir, "DejaVuSans.ttf");
    const logoPath = path.join(assetsDir, "HDP_LOGO.jpeg");

    if (fs.existsSync(fontPath)) doc.registerFont("DejaVu", fontPath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=SalarySlip_${user?.name || userId}_${year}-${month}.pdf`
    );
    doc.pipe(res);

    // Page background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#fafcff");
    doc.fillColor("#000");

    // Logo (left corner, circular)
    if (fs.existsSync(logoPath)) {
      doc.save();
      doc.circle(80, 70, 30).clip();
      doc.image(logoPath, 50, 40, { width: 60, height: 60 });
      doc.restore();
    }

    // Header
    doc.font("DejaVu").fontSize(20).fillColor("#0a2342").text("Hotel Dixit Palace", { align: "center", underline: true });
    doc.fontSize(11).fillColor("#333").text("NH 44, Jhansi Road, Datia (M.P.)", { align: "center" })
       .text("Contact: 059825465 | Email: dixitpalace@datia.com", { align: "center" });

    doc.moveDown(0.5)
       .fontSize(14).fillColor("#103e91")
       .text(`Salary Slip for ${moment(startDate).format("MMMM YYYY")}`, { align: "center" });

    doc.moveTo(50, doc.y + 5).lineTo(545, doc.y + 5).stroke("#b4c5e4");
    let y = doc.y + 14;

    // Employee details
    doc.rect(50, y, 495, 70).stroke("#cfd8dc");
    doc.fontSize(11).fillColor("#0a2342")
       .text("Employee Name:", 60, y + 10).fillColor("#000").text(user?.name || "-", 160, y + 10)
       .fillColor("#0a2342").text("Employee ID:", 340, y + 10).fillColor("#000").text(user?.empId || "-", 435, y + 10)
       .fillColor("#0a2342").text("Role:", 60, y + 30).fillColor("#000").text(user?.role || "-", 160, y + 30)
       .fillColor("#0a2342").text("Generated On:", 340, y + 30).fillColor("#000").text(moment().tz("Asia/Kolkata").format("DD/MM/YYYY"), 435, y + 30)
       .fillColor("#0a2342").text("Month:", 60, y + 50).fillColor("#000").text(`${month} / ${year}`, 160, y + 50);

    y += 90;

    // Table header
    const headers = ["Date", "Check-In", "Check-Out", "Late (min)", "OT (min)", "Late Ded. (₹)", "OT Add. (₹)", "Net Day (₹)"];
    const colX = [60, 115, 180, 250, 310, 380, 450, 520];

    doc.rect(55, y, 500, 25).fill("#1d417e");
    doc.fontSize(9).fillColor("#fff").font("DejaVu");
    headers.forEach((h, i) => doc.text(h, colX[i], y + 5));

    y += 30;
    doc.fillColor("#000").fontSize(8);

    // Table rows
    let rowY = y;
    reports.forEach((r) => {
      doc.text(moment(r.createdAt).tz("Asia/Kolkata").format("DD/MM/YYYY"), colX[0], rowY)
         .text(r.checkInTime || "-", colX[1], rowY)
         .text(r.checkOutTime || "-", colX[2], rowY)
         .text(r.lateDuration?.toString() || "0", colX[3], rowY)
         .text(r.otDuration?.toString() || "0", colX[4], rowY)
         .text(`₹${(r.totalDeductionsAmount || 0).toFixed(2)}`, colX[5], rowY)
         .text(`₹${(r.totalOtAmount || 0).toFixed(2)}`, colX[6])
         .text(`₹${(r.netDaySalary || 0).toFixed(2)}`, colX[7], rowY);

      rowY += 20;
      if (rowY > 710) {
        doc.addPage();
        rowY = 55;
      }
    });

    // Totals
    const totalLateDeduction = reports.reduce((acc, r) => acc + (r.totalDeductionsAmount || 0), 0).toFixed(2);
    const totalOtAllowance = reports.reduce((acc, r) => acc + (r.totalOtAmount || 0), 0).toFixed(2);
    const totalNetSalary = reports.reduce((acc, r) => acc + (r.netDaySalary || 0), 0).toFixed(2);

    rowY += 10;
    doc.moveTo(50, rowY).lineTo(545, rowY).stroke("#cfd8dc");
    rowY += 15;

    doc.fillColor("#034694").fontSize(11)
       .text("Total Late Deduction:", 60, rowY).fillColor("#000").text(`₹${totalLateDeduction}`, 195, rowY)
       .fillColor("#034694").text("Total OT Allowance:", 330, rowY).fillColor("#000").text(`₹${totalOtAllowance}`, 470, rowY);

    rowY += 18;
    doc.fillColor("#1b5e20").fontSize(12).text(`Net Salary Payable: ₹${totalNetSalary}`, 60, rowY);

    // Footer
    rowY += 40;
    doc.font("Helvetica-Oblique").fontSize(9).fillColor("#777")
       .text("This is a system-generated salary slip. For queries, contact HR at above contact details.", 60, rowY, { width: 480 });

    doc.end();
  } catch (error) {
    console.error("PDF export error: ", error);
    res.status(500).json({ message: "Could not generate PDF", error });
  }
};

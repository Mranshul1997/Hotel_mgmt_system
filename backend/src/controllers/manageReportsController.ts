import { Request, Response } from 'express';
import User from '../models/userModel';
import Shift from '../models/shiftModel';
import ManageReport from '../models/manageReportsModel';
import mongoose from 'mongoose';

import moment from 'moment';

export const checkInUser = async (req: Request, res: Response) => {
  try {
    const { userId, checkInTime } = req.body;

    console.log('Received check-in request:', { userId, checkInTime });

    // Validate input
    if (!userId || !checkInTime) {
      console.log('Validation failed: Missing userId or checkInTime');
      return res.status(400).json({ message: 'userId and checkInTime are required.' });
    }

    // 1. Get user and shift
    const user = await User.findById(userId).populate('shiftId');
    console.log('Fetched user:', user);
    if (!user) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    const shift = user.shiftId as any;
    console.log('Fetched shift:', shift);
    if (!shift) {
      console.log('User shift not assigned for user:', userId);
      return res.status(404).json({ message: 'User shift not assigned' });
    }

    // 2. Parse times
    const checkIn = moment(checkInTime, 'HH:mm');
    const shiftStart = moment(shift.checkInTime, 'HH:mm');
    console.log('Parsed checkIn:', checkIn.format(), 'shiftStart:', shiftStart.format());

    // 3. Calculate lateness
    let lateDuration = 0;
    if (checkIn.isAfter(shiftStart)) {
      lateDuration = checkIn.diff(shiftStart, 'minutes');
    }
    console.log('Late duration (minutes):', lateDuration);

    // 4. Calculate deduction
    const deduction = lateDuration * (user.perMinuteSalary || 0);
    console.log('Deduction:', deduction);

    // 5. Calculate netDaySalary
    const netDaySalary = (user.perDaySalary || 0) - deduction;
    console.log('Net day salary:', netDaySalary);

    // 6. Save to manage_reports
    const report = await ManageReport.create({
      userId: user._id,
      checkInTime,
      shiftTiming: `${shift.checkInTime} - ${shift.checkOutTime}`,
      totalDeductionsAmount: deduction,
      totalOtAmount: 0,
      lateDuration,
      otDuration: 0,
      netDaySalary
    });
    console.log('Created report:', report);

    return res.status(201).json({
      message: 'Check-in recorded',
      data: report
    });
  } catch (error: any) {
    console.error('Check-in error:', error);
    return res.status(500).json({ message: error.message });
  }
};


export const checkoutUser = async (req: Request, res: Response) => {
  try {
    const { userId, checkOutTime } = req.body;

    if (!userId || !checkOutTime) {
      return res.status(400).json({ message: 'userId and checkOutTime are required.' });
    }

    // 1. Get user and shift
    const user = await User.findById(userId).populate('shiftId');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const shift = user.shiftId as any;
    if (!shift) return res.status(404).json({ message: 'Shift not found for this user' });

    // 2. Find the latest report for this user that has a checkInTime
    const report = await ManageReport.findOne({
      userId,
      checkInTime: { $exists: true, $ne: null }
    }).sort({ createdAt: -1 });

    if (!report) {
      return res.status(404).json({ message: 'No existing check-in report found for this user' });
    }

    // 3. Calculate OT
    const shiftCheckoutWithBuffer = moment(shift.checkOutTime, 'HH:mm').add(30, 'minutes');
    const actualCheckout = moment(checkOutTime, 'HH:mm');

    let otDuration = 0;
    let otAmount = 0;

    if (actualCheckout.isAfter(shiftCheckoutWithBuffer)) {
      otDuration = actualCheckout.diff(shiftCheckoutWithBuffer, 'minutes');
      otAmount = otDuration * (user.perMinuteSalary || 0);
    }

    // 4. Recalculate netDaySalary
    const deduction = report.totalDeductionsAmount || 0;
    const netDaySalary = (user.perDaySalary || 0) - deduction + otAmount;

    // 5. Update the report
    report.checkOutTime = checkOutTime;
    report.otDuration = otDuration;
    report.totalOtAmount = otAmount;
    report.netDaySalary = netDaySalary;

    await report.save();

    return res.status(200).json({
      message: 'Check-out updated successfully',
      data: report
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const getMonthlyReport = async (req: Request, res: Response) => {
  try {
    const { userId, month, year } = req.body;
    if (!userId || !month || !year) {
      return res.status(400).json({ message: 'userId, month and year are required.' });
    }

    // build date range for month
    const start = new Date(year, month - 1, 1, 0, 0, 0);
    const end = new Date(year, month, 1, 0, 0, 0); // exclusive upper bound

    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          totalLateDuration: { $sum: "$lateDuration" },
          totalOtDuration: { $sum: "$otDuration" },
          totalDeductionAmount: { $sum: "$totalDeductionsAmount" },
          totalOtAmount: { $sum: "$totalOtAmount" },
          totalNetSalary: { $sum: "$netDaySalary" }
        }
      }
    ];

    const agg = await ManageReport.aggregate(pipeline);

    const result = agg[0] || {
      totalDays: 0,
      totalLateDuration: 0,
      totalOtDuration: 0,
      totalDeductionAmount: 0,
      totalOtAmount: 0,
      totalNetSalary: 0
    };

    return res.json({
      userId,
      month,
      year,
      report: result
    });
  } catch (error: any) {
    console.error("Monthly report error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getDailyReport = async (req: Request, res: Response) => {
  try {
    const { userId, month, year } = req.body;
    if (!userId || !month || !year) {
      return res.status(400).json({ message: 'userId, month and year are required.' });
    }

    const start = new Date(year, month - 1, 1, 0, 0, 0);
    const end = new Date(year, month, 1, 0, 0, 0);

    // First, fetch all daily records
    const dailyRecords = await ManageReport.find({
      userId: new mongoose.Types.ObjectId(userId),
      createdAt: { $gte: start, $lt: end }
    }).sort({ createdAt: 1 }).lean();

    // Then aggregate totals
    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          totalLateDuration: { $sum: "$lateDuration" },
          totalOtDuration: { $sum: "$otDuration" },
          totalDeductionAmount: { $sum: "$totalDeductionsAmount" },
          totalOtAmount: { $sum: "$totalOtAmount" },
          totalNetSalary: { $sum: "$netDaySalary" }
        }
      }
    ];

    const agg = await ManageReport.aggregate(pipeline);
    const totals = agg[0] || {
      totalDays: 0,
      totalLateDuration: 0,
      totalOtDuration: 0,
      totalDeductionAmount: 0,
      totalOtAmount: 0,
      totalNetSalary: 0
    };

    return res.json({
      userId,
      month,
      year,
      totals,
      dailyRecords
    });
  } catch (error: any) {
    console.error("Daily report error:", error);
    return res.status(500).json({ message: error.message });
  }
};
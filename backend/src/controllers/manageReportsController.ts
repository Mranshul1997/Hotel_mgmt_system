import { Request, Response } from 'express';
import User from '../models/userModel';
import Shift from '../models/shiftModel';
import ManageReport from '../models/manageReportsModel';

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
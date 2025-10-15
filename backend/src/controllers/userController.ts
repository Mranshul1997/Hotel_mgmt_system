import { Request, Response } from "express";
import User from "../models/userModel";
import moment from "moment";
import ManageReport from "../models/manageReportsModel";
import Shift from "../models/shiftModel";

// Create new user
export const createUser = async (req: Request, res: Response) => {
  try {
    console.log("createUser called with body:", req.body);
    // Step 1: Find the last user with empId
    const lastUser = await User.findOne({ empId: { $exists: true } })
      .sort({ empId: -1 })
      .lean();
    console.log("Last user found:", lastUser);

    let nextEmpNum = 1;
    const lastEmpId: string | undefined =
      lastUser && typeof (lastUser as any).empId === "string"
        ? (lastUser as any).empId
        : undefined;

    if (lastEmpId) {
      const splitArr = lastEmpId.split("-");
      if (splitArr.length === 2 && !isNaN(Number(splitArr[1]))) {
        nextEmpNum = parseInt(splitArr[1], 10) + 1;
      }
    }
    console.log("Next employee number:", nextEmpNum);

    const newEmpId = `emp-${nextEmpNum.toString().padStart(3, "0")}`;
    console.log("Generated empId:", newEmpId);

    // Step 2: Create the new user
    const user = new User({
      ...req.body,
      empId: newEmpId,
    });

    const savedUser = await user.save();
    console.log("Saved user:", savedUser);

    // Step 3: Fetch shift timing from Shift collection
    let shiftTiming = "";
    if (savedUser.shiftId) {
      const shift = await Shift.findById(savedUser.shiftId).lean();
      if (shift) {
        savedUser.shift = shift.name;
        await savedUser.save();
      }
    }

    // Step 4: Prepare ManageReports for the rest of the week
    const today = moment().startOf("day");
    const endOfWeek = moment().endOf("week"); // Sunday

    const reports = [];
    let currentDate = today.clone();

    while (currentDate.isSameOrBefore(endOfWeek)) {
      reports.push({
        userId: savedUser._id,
        checkInTime: "",
        shiftTiming: shiftTiming || "",
        totalDeductionsAmount: 0,
        totalOtAmount: 0,
        lateDuration: 0,
        otDuration: 0,
        netDaySalary: savedUser.perDaySalary || 0,
        applyLeave: false,
        leaveType: null,
        executionDate: currentDate.toDate(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      currentDate.add(1, "day");
    }
    console.log("Prepared reports for week:", reports.length);

    if (reports.length > 0) {
      await ManageReport.insertMany(reports);
      console.log("Inserted weekly ManageReports for user.");
    }

    res.status(201).json({
      message: "User created successfully and weekly ManageReports generated",
      user: savedUser,
      reportsInserted: reports.length,
    });
  } catch (error: any) {
    console.error("Error in createUser:", error);
    res.status(400).json({ message: error.message || error });
  }
};

// Get all users
export const listUsers = async (_req: Request, res: Response) => {
  try {
    console.log("listUsers called");
    const users = await User.find();
    console.log("Fetched users:", users.length);
    res.json(users);
  } catch (error) {
    console.error("Error in listUsers:", error);
    res.status(500).json({ message: error });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    console.log("updateUser called for id:", id, "with data:", updatedData);

    if (updatedData.salary) {
      updatedData.perDaySalary = updatedData.salary / 30;
      updatedData.perMinuteSalary = updatedData.perDaySalary / (8 * 60);
      console.log(
        "Calculated perDaySalary and perMinuteSalary:",
        updatedData.perDaySalary,
        updatedData.perMinuteSalary
      );
    }

    const updated = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (updated && updated.shiftId) {
      const shift = await Shift.findById(updated.shiftId).lean();
      if (shift) {
        updated.shift = shift.name;
        await updated.save();
      }
    }

    res.json(updated);
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(400).json({ message: error });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    console.log("deleteUser called for id:", id);
    const deleted = await User.findByIdAndDelete(id);
    console.log("Deleted user:", deleted);
    if (!deleted) {
      console.log("User not found for delete:", id);
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(400).json({ message: error });
  }
};

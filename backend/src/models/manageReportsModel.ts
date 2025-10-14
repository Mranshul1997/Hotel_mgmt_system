import mongoose, { Schema, Document, Types } from "mongoose";

export interface IManageReport extends Document {
  userId: Types.ObjectId;
  checkInTime: string;
  checkOutTime?: string;
  shiftTiming: string;
  totalDeductionsAmount: number;
  totalOtAmount: number;
  lateDuration: number;
  otDuration: number;
  netDaySalary: number;
  createdAt: Date;
  updatedAt: Date;
  executionDate: Date;
  applyLeave?: boolean;
  leaveType?: "paid" | "unpaid";
  leaveReason: string;
}

const ManageReportSchema = new Schema<IManageReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    checkInTime: { type: String },
    checkOutTime: { type: String },
    shiftTiming: { type: String },
    totalDeductionsAmount: { type: Number },
    totalOtAmount: { type: Number, default: 0 },
    lateDuration: { type: Number, default: 0 },
    otDuration: { type: Number, default: 0 },
    netDaySalary: { type: Number },
    applyLeave: { type: Boolean, default: false },
    leaveType: { type: String, enum: ["paid", "unpaid"], default: null },
    leaveReason: { type: String, default: "" },
    executionDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IManageReport>(
  "ManageReport",
  ManageReportSchema
);

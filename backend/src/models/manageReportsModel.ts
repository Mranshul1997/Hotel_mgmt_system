import mongoose, { Schema, Document, Types } from 'mongoose';

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
}

const ManageReportSchema = new Schema<IManageReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    checkInTime: { type: String, required: true },
    checkOutTime: { type: String },
    shiftTiming: { type: String },
    totalDeductionsAmount: { type: Number },
    totalOtAmount: { type: Number, default: 0 },
    lateDuration: { type: Number, default: 0 },
    otDuration: { type: Number, default: 0 },
    netDaySalary: { type: Number }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IManageReport>('ManageReport', ManageReportSchema);

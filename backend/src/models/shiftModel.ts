import mongoose, { Schema, Document } from "mongoose";

export interface IShift extends Document {
  name: string;
  checkInTime: string; // e.g. "08:00"
  checkOutTime: string; // e.g. "16:00"
  createdAt: Date;
  updatedAt: Date;
}

const ShiftSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    checkInTime: { type: String, required: true },
    checkOutTime: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IShift>("Shift", ShiftSchema);

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  age: number;
  email: string;
  salary: number;
  password: string;
  perMinuteSalary: number;
  perDaySalary: number;
  role: string;
  biometric: string;
  attendance: string;
  shift: string;
  shiftId: Types.ObjectId; // Referencing Shift
  createdAt: Date;
  updatedAt: Date;

}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  password: { type: String },
  email: { type: String, required: true, unique: true },
  salary: { type: Number, required: true },
  perMinuteSalary: { type: Number },
  perDaySalary: { type: Number },
  role: { type: String, required: true },
  shiftId: { type: Schema.Types.ObjectId, ref: 'Shift' },
    biometric: { type: String, default: "Pending" },      // ADD THIS
  attendance: { type: String, default: "100%" },        // ADD THIS
  shift: { type: String },    
}, { timestamps: true}
);

// Auto-calculate perDay and perMinute salary
UserSchema.pre<IUser>('save', function (next) {
  this.perDaySalary = this.salary / 30;
  this.perMinuteSalary = this.perDaySalary / (8 * 60); // Assuming 8-hour workday
  next();
});

export default mongoose.model<IUser>('User', UserSchema);

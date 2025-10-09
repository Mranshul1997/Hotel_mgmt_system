import mongoose, { Schema, Document } from "mongoose";

export interface IAuthUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "subadmin";
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AuthUserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "subadmin"], required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IAuthUser>("AuthUser", AuthUserSchema);

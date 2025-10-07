import { Schema, model } from "mongoose";

interface IUser {
  name: string;
  email: string;
  password: string;
  role: "admin" | "staff";
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff", "user"], default: "staff" },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);

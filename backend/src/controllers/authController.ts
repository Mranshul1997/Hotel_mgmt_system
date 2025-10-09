import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AuthUser from "../models/AuthUser";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { blacklistedTokens } from "../middleware/auth";
const transporter = nodemailer.createTransport({
  service: "Gmail", // e.g., Gmail, SendGrid
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    // Set token and expiry. Store hashed token in DB for security if you want.
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now as Date
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Reset link sent. Check your email." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  try {
    const user = await AuthUser.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  console.log("Login request body:", req.body);
  const { email, password } = req.body;
  console.log("Login attempt with email:", email);
  try {
    const user = await AuthUser.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "Invalid credentials" });
    }
    console.log("User found:", user.email);

    console.log("Logging in with email:", email, "password:", password);
    console.log("Stored hash:", user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    blacklistedTokens.add(token);
    res.json({ message: "Logged out successfully, token blacklisted" });
  } else {
    res.status(400).json({ message: "No token provided" });
  }
};

// export const getProfile = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user.id;
//     const user = await AuthUser.findById(userId).select("-password");
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const updateProfile = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user.id;
//     const updates = req.body;
//     const updatedUser = await AuthUser.findByIdAndUpdate(userId, updates, {
//       new: true,
//     }).select("-password");
//     res.json(updatedUser);
//   } catch (error) {
//     res.status(500).json({ message: "Update failed" });
//   }
// };

// export const someAdminOnlyHandler = (req: Request, res: Response) => {
//   res.json({ message: "Admin dashboard accessed" });
// };

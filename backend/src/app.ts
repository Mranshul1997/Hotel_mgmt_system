import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db"; // note .js extension here
import authRoutes from "./routes/auth";
import userRoutes from "./routes/userRoutes";
import cors from "cors";
import shiftRoutes from "./routes/shiftRoutes";
import reportRoutes from "./routes/manageReportsRoutes";
import zkRoutes from "./routes/zkRoutes";
dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/zk", zkRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

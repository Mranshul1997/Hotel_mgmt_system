import React, { useMemo } from "react";
import type { FC } from "react";
import type { User, AttendanceRecord } from "../types";

interface UserDashboardProps {
  user: User;
  handleLogout: () => void;
}

export const UserDashboard: FC<UserDashboardProps> = ({ user, handleLogout }) => {
  // Mock Attendance Data — real me API se fetch karwana better
  const attendanceData: AttendanceRecord[] = useMemo(() => [
    { date: "2025-10-01", status: "Present", checkIn: "08:55 AM", checkOut: "05:01 PM" },
    { date: "2025-10-02", status: "Present", checkIn: "09:03 AM", checkOut: "05:00 PM" },
    { date: "2025-10-03", status: "Leave", checkIn: "N/A", checkOut: "N/A" },
    { date: "2025-10-04", status: "Present", checkIn: "08:48 AM", checkOut: "05:15 PM" },
  ], []);

  const leavesRemaining = 4;
  const monthlyAttendanceRate = 95;
  const lastCheckIn = "08:48 AM";

  return (
    <DashboardLayout title="User Dashboard" user={user} handleLogout={handleLogout}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl border border-blue-700/50 shadow-md">
          <p className="text-sm text-gray-400">Monthly Attendance Rate</p>
          <p className="text-4xl font-bold text-blue-400 mt-1">{monthlyAttendanceRate}%</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-blue-700/50 shadow-md">
          <p className="text-sm text-gray-400">Last Check-In</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{lastCheckIn}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-blue-700/50 shadow-md">
          <p className="text-sm text-gray-400">Leaves Remaining</p>
          <p className="text-4xl font-bold text-yellow-400 mt-1">{leavesRemaining}</p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-blue-700/50 shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-blue-300">Recent Attendance Log</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-blue-700/50">
            <thead>
              <tr className="text-left text-gray-400 uppercase text-sm tracking-wider">
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Check-In</th>
                <th className="p-3">Check-Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {attendanceData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-700/50 transition-colors">
                  <td className="p-3 font-mono">{item.date}</td>
                  <td
                    className={`p-3 font-medium ${
                      item.status === "Present"
                        ? "text-green-400"
                        : item.status === "Leave"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {item.status}
                  </td>
                  <td className="p-3">{item.checkIn}</td>
                  <td className="p-3">{item.checkOut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default UserDashboard;
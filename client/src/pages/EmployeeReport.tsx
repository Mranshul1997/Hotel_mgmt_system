import React, { useEffect, useState } from "react";
import { getDailyReport } from "../api/employeeApi";
import dayjs from "dayjs";

// Helper: format number to INR, 2 decimals
function toCurrency(val) {
  return Number(val || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const EmployeeReport = ({ employee, onClose }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch daily attendance on component mount
  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        // Assume current month/year; you can enhance this to filter by month
        const now = new Date();
        const res = await getDailyReport({
          userId: employee.userId || employee._id,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        });
        setAttendance(res?.dailyRecords || []);
      } catch {
        setAttendance([]);
      }
      setLoading(false);
    };
    fetchAttendance();
  }, [employee]);

  // Simple totals for footer
  const totals = attendance.reduce(
    (tot, row) => ({
      days: tot.days + 1,
      lateMins: tot.lateMins + (row.lateDuration || 0),
      otMins: tot.otMins + (row.otDuration || 0),
      lateDed: tot.lateDed + (row.totalDeductionsAmount || 0),
      otPay: tot.otPay + (row.totalOtAmount || 0),
      netSalary: tot.netSalary + (row.netDaySalary || 0),
    }),
    { days: 0, lateMins: 0, otMins: 0, lateDed: 0, otPay: 0, netSalary: 0 }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="bg-gray-900 rounded-xl p-10 max-w-5xl w-full shadow-2xl border-2 border-blue-800"
        style={{
          minHeight: 650,
          maxHeight: 750,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Salary & Attendance Report — {employee.name}
          </h2>
          <button
            className="px-4 py-2 rounded text-white font-mono bg-red-600 font-bold"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Attendance Table */}
        <div
          className="overflow-x-auto mb-6"
          style={{
            minHeight: 260,
            maxHeight: 260,
            overflowY: "auto",
            borderRadius: "0.5rem",
            background: "#23272f",
            border: "1px solid rgba(48,100,255,0.08)",
          }}
        >
          <table className="min-w-full divide-y divide-blue-700/50 text-base">
            <thead>
              <tr className="text-left text-gray-400 uppercase text-sm">
                <th className="p-3 bg-gray-900 sticky top-0 z-10">Date</th>
                <th className="p-3 bg-gray-900 sticky top-0 z-10">Check-In</th>
                <th className="p-3 bg-gray-900 sticky top-0 z-10">Check-Out</th>
                <th className="p-3 bg-gray-900 sticky top-0 z-10">
                  Late (min)
                </th>
                <th className="p-3 bg-gray-900 sticky top-0 z-10">OT (min)</th>
                <th className="p-3 bg-gray-900 sticky top-0 z-10">
                  Late Deduction (₹)
                </th>
                <th className="p-3 bg-gray-900 sticky top-0 z-10">
                  OT Add (₹)
                </th>
                <th className="p-3 bg-gray-900 sticky top-0 z-10">
                  Net Day Salary (₹)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendance.map((rec, idx) => (
                  <tr key={rec._id || idx} className="hover:bg-gray-800/30">
                    <td className="p-3 font-mono">
                      {dayjs(rec.createdAt).format("YYYY-MM-DD")}
                    </td>
                    <td className="p-3">{rec.checkInTime}</td>
                    <td className="p-3">{rec.checkOutTime || "-"}</td>
                    <td className="p-3">{rec.lateDuration || 0}</td>
                    <td className="p-3">{rec.otDuration || 0}</td>
                    <td className="p-3 text-red-400">
                      {toCurrency(rec.totalDeductionsAmount)}
                    </td>
                    <td className="p-3 text-green-400">
                      {toCurrency(rec.totalOtAmount)}
                    </td>
                    <td className="p-3 font-bold text-blue-400">
                      {toCurrency(rec.netDaySalary)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="bg-gray-800 rounded p-6 grid grid-cols-3 md:grid-cols-6 gap-6 text-white text-center mb-2 flex-shrink-0">
          <div>
            <div className="text-gray-400 text-sm">Days Counted</div>
            <div className="text-3xl font-bold">{totals.days}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Total Late (min)</div>
            <div className="text-3xl font-bold">{totals.lateMins}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Total Overtime (min)</div>
            <div className="text-3xl font-bold">{totals.otMins}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Late Deduction (₹)</div>
            <div className="text-3xl font-bold text-red-400">
              {toCurrency(totals.lateDed)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">OT Addition (₹)</div>
            <div className="text-3xl font-bold text-green-400">
              {toCurrency(totals.otPay)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Net Salary (₹)</div>
            <div className="text-3xl font-bold text-blue-400">
              {toCurrency(totals.netSalary)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeReport;

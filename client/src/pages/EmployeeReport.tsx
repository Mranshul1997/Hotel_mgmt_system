import React, { useEffect, useState } from "react";
import {
  getDailyReport,
  downloadPayrollCsv,
  downloadPayrollPdf,
} from "../api/employeeApi";
import dayjs from "dayjs";

// Helper: format number to INR, 2 decimals
function toCurrency(val) {
  return Number(val || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Helper to generate month-year options from data
function getMonthOptions(records) {
  const months = {};
  records.forEach((rec) => {
    const d = new Date(rec.createdAt);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    const label = `${d.toLocaleString("default", {
      month: "long",
    })} ${d.getFullYear()}`;
    months[key] = label;
  });
  return [
    { value: "all", label: "All" },
    ...Object.entries(months).map(([val, label]) => ({ value: val, label })),
  ];
}

// Filter records by selected month
function filterAttendanceByMonth(records, monthValue) {
  if (monthValue === "all") return records;
  return records.filter((rec) => {
    const d = new Date(rec.createdAt);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    return key === monthValue;
  });
}

const EmployeeReport = ({ employee, onClose }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [exportType, setExportType] = useState("csv");

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const now = new Date();
        let monthArg, yearArg;
        if (selectedMonth === "all" || attendance.length === 0) {
          // fallback to current
          const now = new Date();
          monthArg = now.getMonth() + 1;
          yearArg = now.getFullYear();
        } else {
          [yearArg, monthArg] = selectedMonth.split("-");
          monthArg = Number(monthArg);
          yearArg = Number(yearArg);
        }

        const res = await getDailyReport({
          userId: employee.userId || employee._id,
          month: monthArg,
          year: yearArg,
        });

        setAttendance(res?.dailyRecords || []);
      } catch {
        setAttendance([]);
      }
      setLoading(false);
    };
    fetchAttendance();
  }, [employee]);

  // Month filter options
  const monthOptions = getMonthOptions(attendance);
  // Filtered daily records for selected month
  const filteredAttendance = filterAttendanceByMonth(attendance, selectedMonth);

  // Totals for table footer
  const totals = filteredAttendance.reduce(
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

  // Export (download) handlers
  const handleDownload = async () => {
    if (filteredAttendance.length === 0) return;
    let monthArg, yearArg;
    if (selectedMonth === "all") {
      const first = attendance[0];
      if (!first) return;
      const d = new Date(first.createdAt);
      monthArg = d.getMonth() + 1;
      yearArg = d.getFullYear();
    } else {
      [yearArg, monthArg] = selectedMonth.split("-");
      monthArg = Number(monthArg);
      yearArg = Number(yearArg);
    }
    const userId = employee.userId || employee._id;
    if (exportType === "csv") {
      const blob = await downloadPayrollCsv(yearArg, monthArg, userId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${employee.name}_attendance_${selectedMonth}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
    if (exportType === "pdf") {
      const blob = await downloadPayrollPdf(yearArg, monthArg, userId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${employee.name}_attendance_${selectedMonth}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };
  const handleMonthChange = async (e) => {
    const value = e.target.value;
    setSelectedMonth(value);

    let monthArg, yearArg;
    if (value === "all" || attendance.length === 0) {
      const now = new Date();
      monthArg = now.getMonth() + 1;
      yearArg = now.getFullYear();
    } else {
      [yearArg, monthArg] = value.split("-");
      monthArg = Number(monthArg);
      yearArg = Number(yearArg);
    }

    setLoading(true);
    const res = await getDailyReport({
      userId: employee.userId || employee._id,
      month: monthArg,
      year: yearArg,
    });
    setAttendance(res?.dailyRecords || []);
    setLoading(false);
  };

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

        {/* Month Selector & Export Buttons */}
        <div className="mb-6 flex gap-3 flex-wrap items-center">
          <label className="text-white font-medium mr-2">Select Month:</label>
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="rounded px-3 py-2 bg-gray-800 text-white font-bold"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={exportType}
            className="rounded px-3 py-2 bg-gray-800 text-white font-bold"
            onChange={(e) => setExportType(e.target.value)}
          >
            <option value="csv">Download CSV</option>
            <option value="pdf">Download PDF</option>
          </select>
          <button
            className="ml-2 bg-green-600 px-6 py-2 rounded text-white font-bold"
            onClick={handleDownload}
            disabled={loading || filteredAttendance.length === 0}
          >
            Download Report
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
              ) : filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((rec, idx) => (
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

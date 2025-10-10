import React, { useEffect, useState } from "react";
import { getPayrollReport, downloadPayrollCsv } from "../api/employeeApi"; // Use your API file!
import dayjs from "dayjs"; // For month management

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1; // 1-based

const AdminPayroll = () => {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPayrollReport(year, month)
      .then((res) => {
        if (Array.isArray(res)) setData(res);
        else if (res && Array.isArray(res.data)) setData(res.data);
        else setData([]);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [year, month]);

  // Download CSV
  const handleDownloadCsv = async () => {
    const blob = await downloadPayrollCsv(year, month);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll_${year}_${month}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Payroll Management</h2>
        <div className="flex gap-2 items-center">
          <select
            className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {months.map((m, idx) => (
              <option key={m} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {Array.from({ length: 5 }).map((_, idx) => (
              <option key={currentYear - idx} value={currentYear - idx}>
                {currentYear - idx}
              </option>
            ))}
          </select>
          <button
            className="bg-primary text-white font-semibold px-4 py-2 rounded-lg shadow"
            onClick={handleDownloadCsv}
            disabled={loading}
          >
            Download CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto bg-gray-900 rounded-xl shadow border border-blue-700/20">
        <table className="min-w-full divide-y divide-blue-700/50">
          <thead>
            <tr className="text-left text-gray-400 uppercase text-xs">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Base Salary (₹)</th>
              <th className="p-3">OT (₹)</th>
              <th className="p-3">Late Deduction (₹)</th>
              <th className="p-3">Leave Deduction (₹)</th>
              <th className="p-3">Net Pay (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center p-4 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : !Array.isArray(data) || data.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-4 text-gray-400">
                  No data found
                </td>
              </tr>
            ) : (
              (Array.isArray(data) ? data : []).map((emp, idx) => (
                <tr
                  key={emp.empId || emp.id || idx}
                  className="hover:bg-gray-800/30"
                >
                  <td className="p-3 font-mono">{emp.empId || emp.id || ""}</td>
                  <td className="p-3">{emp.name}</td>
                  <td className="p-3">{emp.role}</td>
                  <td className="p-3">{emp.baseSalary ?? emp.salary ?? ""}</td>
                  <td className="p-3">{emp.ot ?? emp.OT ?? ""}</td>
                  <td className="p-3">{emp.late ?? emp.lateDeduction ?? ""}</td>
                  <td className="p-3">
                    {emp.leave ?? emp.leaveDeduction ?? ""}
                  </td>
                  <td className="p-3 font-bold text-green-400">
                    {emp.netPay ?? emp.total ?? ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Payroll summary cards (optional) */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-blue-700/50 shadow">
          <p className="text-sm text-gray-200">Total Net Payroll</p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            ₹
            {Array.isArray(data)
              ? data.reduce(
                  (sum, emp) => sum + (emp.netPay || emp.total || 0),
                  0
                )
              : 0}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-yellow-700/50 shadow">
          <p className="text-sm text-gray-200">Total OT Paid</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            ₹
            {Array.isArray(data)
              ? data.reduce((sum, emp) => sum + (emp.ot || emp.OT || 0), 0)
              : 0}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-red-600/50 shadow">
          <p className="text-sm text-gray-200">Total Deductions</p>
          <p className="text-3xl font-bold text-red-400 mt-2">
            ₹
            {Array.isArray(data)
              ? data.reduce(
                  (sum, emp) =>
                    sum +
                    (emp.late || emp.lateDeduction || 0) +
                    (emp.leave || emp.leaveDeduction || 0),
                  0
                )
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPayroll;

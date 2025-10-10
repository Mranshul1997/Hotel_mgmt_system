import React, { useEffect, useState } from "react";
import { getPayrollReport, downloadPayrollCsv } from "../api/employeeApi";
import EmployeeReport from "./EmployeeReport";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const AdminPayroll = () => {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  useEffect(() => {
    const fetchPayroll = async () => {
      setLoading(true);
      try {
        const res = await getPayrollReport(year, month);
        if (res && Array.isArray(res.users)) {
          setData(res.users);
        } else {
          setData([]);
        }
      } catch {
        setData([]);
      }
      setLoading(false);
    };
    fetchPayroll();
  }, [month, year]);

  // Download CSV handler
  const handleDownloadCsv = async () => {
    const blob = await downloadPayrollCsv(year, month);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll_${year}_${month}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Show individual employee report
  const handleViewReport = (emp: any) => {
    setSelectedEmployee(emp);
    setShowReport(true);
  };

  // Summaries from users array
  const totalNetSalary = data.reduce(
    (sum, rec) => sum + (rec.netSalary || 0),
    0
  );
  const totalOTPaid = data.reduce((sum, rec) => sum + (rec.oTAmount || 0), 0);
  const totalDeductions = data.reduce(
    (sum, rec) => sum + (rec.deductionAmount || 0),
    0
  );

  return (
    <div className="max-w-5xl mx-auto">
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
      <div className="overflow-x-auto max-w-full bg-gray-900 rounded-xl shadow border border-blue-700/20">
        <table className="min-w-full divide-y divide-blue-700/50">
          <thead>
            <tr className="text-left text-gray-400 uppercase text-xs">
              <th className="p-3">Emp Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Base Salary (₹)</th>
              <th className="p-3">Late Deduction (₹)</th>
              <th className="p-3">OT (₹)</th>
              <th className="p-3">Net Salary (₹)</th>
              <th className="p-3">View Report</th>
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
              data.map((rec, idx) => (
                <tr key={rec.empId || rec.userId || rec._id || idx} className="hover:bg-gray-800/30">
                  <td className="p-3 font-mono">
                    {rec.empId || rec.employeeId || rec.userId || rec._id || ""}
                  </td>
                  <td className="p-3">{rec.name}</td>
                  <td className="p-3">{rec.role}</td>
                  <td className="p-3">{rec.salary}</td>
                  <td className="p-3">
                    {Number(rec.deductionAmount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-3">
                    {Number(rec.oTAmount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-3 font-bold text-green-400">
                    {Number(rec.netSalary).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-3">
                    <button
                      className="text-xs text-green-400 underline"
                      onClick={() => handleViewReport(rec)}
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Payroll summary cards */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-blue-700/50 shadow">
          <p className="text-sm text-gray-200">Total Net Payroll</p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            ₹
            {Number(totalNetSalary).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-yellow-700/50 shadow">
          <p className="text-sm text-gray-200">Total OT Paid</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            ₹
            {Number(totalOTPaid).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-red-600/50 shadow">
          <p className="text-sm text-gray-200">Total Deductions</p>
          <p className="text-3xl font-bold text-red-400 mt-2">
            ₹
            {Number(totalDeductions).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
      {showReport && selectedEmployee && (
        <EmployeeReport
          employee={selectedEmployee}
          salary={selectedEmployee.salary}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};

export default AdminPayroll;

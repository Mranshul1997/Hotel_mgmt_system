import React, { useState } from "react";

// Dummy payroll data
const payrollData = [
  {
    id: "EMP001",
    name: "Amit Sharma",
    role: "Waiter",
    base: 15000,
    OT: 1200,
    late: 0,
    leave: 500,
    total: 15700,
  },
  {
    id: "EMP002",
    name: "Priya Singh",
    role: "Receptionist",
    base: 18000,
    OT: 0,
    late: 300,
    leave: 0,
    total: 17700,
  },
  {
    id: "EMP003",
    name: "Rakesh Jain",
    role: "Cook",
    base: 16000,
    OT: 500,
    late: 0,
    leave: 0,
    total: 16500,
  },
];

// Helper to download payroll as CSV
const downloadCSV = (data) => {
  const headers = ["ID", "Name", "Role", "Base Salary", "Overtime", "Late Deduction", "Leave Deduction", "Net Pay"];
  const rows = data.map(emp => [
    emp.id, emp.name, emp.role, emp.base, emp.OT, emp.late, emp.leave, emp.total
  ]);
  const csv = [headers, ...rows].map(row => row.join(",")).join("");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "payroll.csv";
  a.click();
  window.URL.revokeObjectURL(url);
};

const AdminPayroll = () => {
  const [data] = useState(payrollData);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Payroll Management</h2>
        <button className="bg-primary text-white font-semibold px-4 py-2 rounded-lg shadow"
                onClick={() => downloadCSV(data)}>
          Download CSV
        </button>
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
            {data.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-800/30">
                <td className="p-3 font-mono">{emp.id}</td>
                <td className="p-3">{emp.name}</td>
                <td className="p-3">{emp.role}</td>
                <td className="p-3">{emp.base}</td>
                <td className="p-3">{emp.OT}</td>
                <td className="p-3">{emp.late}</td>
                <td className="p-3">{emp.leave}</td>
                <td className="p-3 font-bold text-green-400">{emp.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Payroll summary cards */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-blue-700/50 shadow">
          <p className="text-sm text-gray-200">Total Net Payroll</p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            ₹{data.reduce((sum, emp) => sum + emp.total, 0)}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-yellow-700/50 shadow">
          <p className="text-sm text-gray-200">Total OT Paid</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            ₹{data.reduce((sum, emp) => sum + emp.OT, 0)}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-red-600/50 shadow">
          <p className="text-sm text-gray-200">Total Deductions</p>
          <p className="text-3xl font-bold text-red-400 mt-2">
            ₹{data.reduce((sum, emp) => sum + emp.late + emp.leave, 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPayroll;
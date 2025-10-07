import React, { useState } from "react";

const defaultPayroll = {
  latePenalty: 50,
  otRate: 120,
  baseSalaryRule: "Fixed per role",
};

const AdminPayrollRules = () => {
  const [payroll, setPayroll] = useState(defaultPayroll);

  const handleChange = (field, value) => {
    setPayroll(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    alert("Payroll & OT rules saved!");
    // Connect to backend here
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-900 rounded-xl border border-yellow-700/30 shadow">
      <h2 className="text-2xl font-bold mb-6 text-yellow-300">Payroll & OT Rules</h2>
      <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-200 mb-2">Late Penalty (₹/day)</label>
            <input
              className="w-full p-2 rounded bg-input border-border text-white"
              type="number"
              value={payroll.latePenalty}
              onChange={e => handleChange("latePenalty", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-200 mb-2">OT Rate (₹/hour)</label>
            <input
              className="w-full p-2 rounded bg-input border-border text-white"
              type="number"
              value={payroll.otRate}
              onChange={e => handleChange("otRate", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-200 mb-2">Base Salary Rule</label>
            <select
              className="w-full p-2 rounded bg-input border-border text-white"
              value={payroll.baseSalaryRule}
              onChange={e => handleChange("baseSalaryRule", e.target.value)}
            >
              <option>Fixed per role</option>
              <option>Hourly</option>
              <option>Custom</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <button type="submit" className="px-6 py-2 bg-yellow-600 text-white rounded font-bold">Save Payroll Rules</button>
        </div>
      </form>
    </div>
  );
};

export default AdminPayrollRules;

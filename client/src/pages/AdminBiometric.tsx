import React, { useState, useEffect } from "react";

const defaultBiometric = {
  deviceId: "BMQ-HOTEL-001",
  status: "Connected",
  lastSync: "2025-10-07 10:25 AM",
  totalEmployeesRegistered: 57,
  lastError: null,
  payrollDeductionRule: "Auto calculate by late/absent",
  otCalculationRule: "Based on biometric clock-in/out",
};

const AdminBiometric = () => {
  const [biometric, setBiometric] = useState(defaultBiometric);
  const [logs, setLogs] = useState([
    { id: 1, event: "Employee EMP001 clocked in", time: "2025-10-07 09:00 AM" },
    {
      id: 2,
      event: "Employee EMP005 late by 10 minutes",
      time: "2025-10-07 09:10 AM",
    },
    {
      id: 3,
      event: "Payroll deductions calculated for EMP005",
      time: "2025-10-07 10:00 AM",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setBiometric((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      alert("Biometric settings saved!");
      // Backend API integration here
    }, 1000);
  };

  useEffect(() => {
    // Simulate fetching logs from API on mount
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-xl border border-green-700/30 shadow space-y-8">
      <h2 className="text-3xl font-bold text-green-300 mb-4">
        Biometric Device & Payroll Integration
      </h2>

      {/* Device Settings */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-200 mb-2">
              Device ID
            </label>
            <input
              type="text"
              className="w-full p-3 rounded bg-input border border-border text-white font-mono"
              value={biometric.deviceId}
              onChange={(e) => handleChange("deviceId", e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-200 mb-2">Status</label>
            <select
              className="w-full p-3 rounded bg-input border border-border text-white"
              value={biometric.status}
              onChange={(e) => handleChange("status", e.target.value)}
              disabled={loading}
            >
              <option>Connected</option>
              <option>Disconnected</option>
              <option>Maintenance</option>
            </select>
          </div>
        </div>

        {/* Additional Biometric Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-gray-800 p-4 rounded">
            <h4 className="text-sm text-gray-300 mb-1">Last Sync</h4>
            <p className="text-lg font-mono text-green-400">
              {biometric.lastSync}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <h4 className="text-sm text-gray-300 mb-1">Employees Registered</h4>
            <p className="text-lg font-bold text-blue-400">
              {biometric.totalEmployeesRegistered}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded">
            <h4 className="text-sm text-gray-300 mb-1">Last Error</h4>
            <p
              className={`text-lg font-mono ${
                biometric.lastError ? "text-red-400" : "text-green-400"
              }`}
            >
              {biometric.lastError || "No errors detected"}
            </p>
          </div>
        </div>

       

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            className={`px-8 py-3 font-bold rounded-lg text-white transition-colors ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* Recent Device Logs */}
      <div>
        <h3 className="text-xl font-semibold text-blue-400 mb-4">
          Recent Device Logs
        </h3>
        <div className="bg-gray-800 rounded-lg p-4 max-h-60 overflow-auto border border-blue-700/40">
          {logs.length === 0 ? (
            <p className="text-gray-400 font-mono">No recent logs found</p>
          ) : (
            <ul className="list-disc list-inside text-gray-300 font-mono text-sm space-y-1">
              {logs.map((log) => (
                <li key={log.id}>
                  <span className="text-green-400">{log.time}:</span>{" "}
                  {log.event}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBiometric;

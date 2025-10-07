import React, { useState } from "react";

const defaultSettings = {
  shiftTimings: {
    morning: "07:00-15:00",
    afternoon: "15:00-23:00",
    night: "23:00-07:00",
  },
  biometric: {
    deviceId: "BMQ-HOTEL-001",
    status: "Connected",
  },
  payroll: {
    latePenalty: 50,
    otRate: 120,
    baseSalaryRule: "Fixed per role",
  },
};

const AdminSettings = () => {
  const [settings, setSettings] = useState(defaultSettings);

  const handleChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      }
    }));
  };

  const handleSave = () => {
    // Integrate your backend API here
    alert("Settings saved!");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">System Settings</h2>
      <form className="space-y-8" onSubmit={e => { e.preventDefault(); handleSave(); }}>
        {/* Shift Timings */}
        {/* <div className="bg-gray-900 rounded-xl p-6 border border-blue-700/30 shadow">
          <h3 className="text-lg font-semibold mb-3 text-blue-300">Shift Timings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-200 mb-2">Morning</label>
              <input
                className="w-full p-2 rounded bg-input border-border text-white"
                type="text"
                value={settings.shiftTimings.morning}
                onChange={e => handleChange("shiftTimings", "morning", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-200 mb-2">Afternoon</label>
              <input
                className="w-full p-2 rounded bg-input border-border text-white"
                type="text"
                value={settings.shiftTimings.afternoon}
                onChange={e => handleChange("shiftTimings", "afternoon", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-200 mb-2">Night</label>
              <input
                className="w-full p-2 rounded bg-input border-border text-white"
                type="text"
                value={settings.shiftTimings.night}
                onChange={e => handleChange("shiftTimings", "night", e.target.value)}
              />
            </div>
          </div>
        </div> */}
        
        {/* Biometric Device */}
        <div className="bg-gray-900 rounded-xl p-6 border border-green-700/30 shadow">
          <h3 className="text-lg font-semibold mb-3 text-green-300">Biometric Device</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-200 mb-2">Device ID</label>
              <input
                className="w-full p-2 rounded bg-input border-border text-white"
                type="text"
                value={settings.biometric.deviceId}
                onChange={e => handleChange("biometric", "deviceId", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-200 mb-2">Status</label>
              <select
                className="w-full p-2 rounded bg-input border-border text-white"
                value={settings.biometric.status}
                onChange={e => handleChange("biometric", "status", e.target.value)}
              >
                <option>Connected</option>
                <option>Disconnected</option>
                <option>Maintenance</option>
              </select>
            </div>
          </div>
        </div>
        {/* Payroll/Overtime rules */}
        <div className="bg-gray-900 rounded-xl p-6 border border-yellow-700/30 shadow">
          <h3 className="text-lg font-semibold mb-3 text-yellow-300">Payroll & OT Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-200 mb-2">Late Penalty (₹/day)</label>
              <input
                className="w-full p-2 rounded bg-input border-border text-white"
                type="number"
                value={settings.payroll.latePenalty}
                onChange={e => handleChange("payroll", "latePenalty", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-200 mb-2">OT Rate (₹/hour)</label>
              <input
                className="w-full p-2 rounded bg-input border-border text-white"
                type="number"
                value={settings.payroll.otRate}
                onChange={e => handleChange("payroll", "otRate", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-200 mb-2">Base Salary Rule</label>
              <select
                className="w-full p-2 rounded bg-input border-border text-white"
                value={settings.payroll.baseSalaryRule}
                onChange={e => handleChange("payroll", "baseSalaryRule", e.target.value)}
              >
                <option>Fixed per role</option>
                <option>Hourly</option>
                <option>Custom</option>
              </select>
            </div>
          </div>
        </div>
        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white font-bold rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;

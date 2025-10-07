import React from "react";
import {
  Fingerprint,
  LogOut,
  Users,
  Clock,
  TrendingUp,
  Settings,
  Home,
} from "lucide-react";

const DSidebar = ({ onSelect, activeTab }) => {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { key: "employees", label: "Manage Employees", icon: <Users size={20} /> },
    { key: "shifts", label: "Shift Schedules", icon: <Clock size={20} /> },
    { key: "payroll", label: "Payroll", icon: <TrendingUp size={20} /> },
    {
      key: "biometric",
      label: "Biometric Settings",
      icon: <Fingerprint size={20} />,
    },
    {
      key: "payrollrules",
      label: "Payroll & OT Rules",
      icon: <TrendingUp size={20} />,
    },
  ];

  return (
    <nav className="bg-gray-900 w-64 min-h-screen p-4 text-gray-300">
      <ul>
        {items.map((item) => (
          <li
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`cursor-pointer flex items-center gap-2 p-3 rounded hover:bg-gray-700 ${
              activeTab === item.key
                ? "bg-gray-700 font-semibold text-white"
                : ""
            }`}
          >
            {item.icon}
            {item.label}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DSidebar;

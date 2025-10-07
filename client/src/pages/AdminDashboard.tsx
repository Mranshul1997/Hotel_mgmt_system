import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Fingerprint,
  LogOut,
  Users,
  Clock,
  DollarSign,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const stats = [
  { label: "Total Employees", value: 57, color: "#60a5fa", icon: <Users /> },
  {
    label: "Present Today",
    value: 44,
    color: "#10b981",
    icon: <Fingerprint />,
  },
  { label: "On Leave", value: 8, color: "#facc15", icon: <Clock /> },
  {
    label: "Shift Violations",
    value: 5,
    color: "#a78bfa",
    icon: <DollarSign />,
  },
];

const attendanceTrend = [
  { date: "Oct 1", present: 41, leave: 7, ot: 6 },
  { date: "Oct 2", present: 43, leave: 5, ot: 9 },
  { date: "Oct 3", present: 44, leave: 8, ot: 6 },
  { date: "Oct 4", present: 44, leave: 8, ot: 5 },
  { date: "Oct 5", present: 42, leave: 10, ot: 7 },
];

const shiftStats = [
  { name: "Morning", value: 19 },
  { name: "Afternoon", value: 12 },
  { name: "Evening", value: 18 },
  { name: "Night", value: 8 },
];
const shiftColors = ["#60a5fa", "#38bdf8", "#818cf8", "#a78bfa"];

const employeeData = [
  {
    id: "EMP001",
    name: "Amit Sharma",
    role: "Waiter",
    shift: "Morning",
    attendance: "98%",
    salary: "15000",
  },
  {
    id: "EMP002",
    name: "Priya Singh",
    role: "Receptionist",
    shift: "Afternoon",
    attendance: "89%",
    salary: "25000",
  },
  {
    id: "EMP003",
    name: "Rakesh Jain",
    role: "Cook",
    shift: "Evening",
    attendance: "95%",
    salary: "30000",
  },
];

const payrollTrend = [
  { month: "July", total: 345000 },
  { month: "Aug", total: 470000 },
  { month: "Sept", total: 472800 },
  { month: "Oct", total: 489900 },
];

const DashboardOverview = () => (
  <div>
    <h2 className="text-xl font-bold mb-4">Overview</h2>
    {/* Stat Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {stats.map((stat) => (
        <div
          className="bg-gradient-to-tr from-gray-800 to-gray-700 p-6 rounded-xl border shadow flex flex-col items-center"
          style={{ borderColor: stat.color }}
          key={stat.label}
        >
          <div className="mb-2 text-xl" style={{ color: stat.color }}>
            {stat.icon}
          </div>
          <div
            className="text-4xl font-extrabold"
            style={{ color: stat.color }}
          >
            {stat.value}
          </div>
          <div className="text-md text-gray-300 mt-2">{stat.label}</div>
        </div>
      ))}
    </div>
    {/* Attendance & OT trend line chart */}
    <div className="bg-gray-900 mb-10 px-6 py-6 rounded-xl border border-blue-700/20 shadow w-full">
      <h3 className="text-lg font-bold mb-4 text-blue-300">
        Attendance, Leave & OT (Last 5 Days)
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={attendanceTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey="date" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="present"
            name="Present"
            stroke="#60a5fa"
            strokeWidth={3}
            dot
          />
          <Line
            type="monotone"
            dataKey="leave"
            name="Leave"
            stroke="#facc15"
            strokeWidth={3}
            dot
          />
          <Line
            type="monotone"
            dataKey="ot"
            name="Overtime"
            stroke="#10b981"
            strokeWidth={3}
            dot
          />
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* Shift Pie + Payroll Line charts */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-gray-900 rounded-xl p-6 border border-blue-700/20 shadow flex flex-col items-center">
        <h3 className="font-semibold text-blue-300 mb-2">
          Employee Shift Distribution
        </h3>
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Pie
              data={shiftStats}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              fill="#8884d8"
              label
            >
              {shiftStats.map((entry, idx) => (
                <Cell
                  key={entry.name}
                  fill={shiftColors[idx % shiftColors.length]}
                />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-gray-900 rounded-xl p-6 border border-blue-700/20 shadow flex flex-col items-center">
        <h3 className="font-semibold text-green-400 mb-2">
          Monthly Payroll Trend
        </h3>
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={payrollTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="month" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              name="Payroll (₹)"
              stroke="#16a34a"
              strokeWidth={3}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
    {/* Payroll summary */}
    <div className="bg-gray-800 rounded-xl p-6 border border-blue-700/30 mt-8">
      <h3 className="text-lg font-semibold mb-2 text-blue-300">
        Payroll Summary
      </h3>
      <p>
        This month’s total payroll:{" "}
        <span className="font-mono text-lg text-green-400">₹4,72,800</span>
      </p>
    </div>
  </div>
);

const AdminEmployees = () => (
  <div>
    <h2 className="text-xl font-bold mb-6">Employees</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-blue-700/50 rounded-lg">
        <thead>
          <tr className="text-left text-gray-400 uppercase text-xs">
            <th className="p-3">ID</th>
            <th className="p-3">Name</th>
            <th className="p-3">Role</th>
            <th className="p-3">Shift</th>
            <th className="p-3">Biometric</th>
            <th className="p-3">Salary</th>
            <th className="p-3">Attendance %</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {[
            {
              id: "EMP001",
              name: "Amit Sharma",
              role: "Waiter",
              shift: "Morning",
              biometric: "Registered",
              salary: 15000,
              attendance: "98%",
            },
            {
              id: "EMP002",
              name: "Priya Singh",
              role: "Receptionist",
              shift: "Afternoon",
              biometric: "Pending",
              salary: 25000,
              attendance: "89%",
            },
            {
              id: "EMP003",
              name: "Rakesh Jain",
              role: "Cook",
              shift: "Evening",
              biometric: "Registered",
              salary: 30000,
              attendance: "95%",
            },
          ].map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-700/30">
              <td className="p-3 font-mono">{emp.id}</td>
              <td className="p-3">{emp.name}</td>
              <td className="p-3">{emp.role}</td>
              <td className="p-3">{emp.shift}</td>
              <td className="p-3">{emp.biometric}</td>
              <td className="p-3">₹{emp.salary}</td>
              <td className="p-3">{emp.attendance}</td>
              <td className="p-3">
                <button className="text-xs text-blue-400 underline">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="mt-5">
      <button className="bg-primary font-bold px-4 py-2 rounded-lg text-white">
        + Add Employee
      </button>
    </div>
  </div>
);

const AdminShifts = () => (
  <div>
    <h2 className="text-xl font-bold mb-6">Shift Schedules</h2>
    <div className="my-4">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={[
            { date: "Oct 1", morning: 11, afternoon: 8, evening: 7, night: 4 },
            { date: "Oct 2", morning: 13, afternoon: 7, evening: 4, night: 6 },
            { date: "Oct 3", morning: 12, afternoon: 8, evening: 9, night: 3 },
          ]}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey="date" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="morning"
            name="Morning"
            stroke="#60a5fa"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="afternoon"
            name="Afternoon"
            stroke="#38bdf8"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="evening"
            name="Evening"
            stroke="#818cf8"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="night"
            name="Night"
            stroke="#a78bfa"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <p>Interactive shift roster and weekly compliance coming soon!</p>
  </div>
);

const AdminPayroll = () => (
  <div>
    <h2 className="text-xl font-bold mb-6">Payroll Management</h2>
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={payrollTrend}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
        <XAxis dataKey="month" stroke="#aaa" />
        <YAxis stroke="#aaa" />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="total"
          name="Payroll"
          stroke="#16a34a"
          strokeWidth={3}
          dot
        />
      </LineChart>
    </ResponsiveContainer>
    <p className="mt-4">
      Download payslips and manage salary calculations by OT, leave, late.
      Advanced payroll features coming soon!
    </p>
  </div>
);

const AdminSettings = () => (
  <div>
    <h2 className="text-xl font-bold mb-6">Settings</h2>
    <ul className="list-disc text-gray-400 pl-5">
      <li>Configure shift timings & late penalty</li>
      <li>Biometric device settings</li>
      <li>Payroll/OT rules & thresholds</li>
      <li>Integration with leave/OT request platform</li>
      <li>Notification & alert templates</li>
    </ul>
  </div>
);

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/auth");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      navigate("/user-dashboard");
      return;
    }
    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "employees":
        return <AdminEmployees />;
      case "shifts":
        return <AdminShifts />;
      case "payroll":
        return <AdminPayroll />;
      case "settings":
        return <AdminSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  // Main layout (customize sidebar/topbar as needed)
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar substitute */}

      {/* Header + Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="p-6 overflow-auto">{renderTabContent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;

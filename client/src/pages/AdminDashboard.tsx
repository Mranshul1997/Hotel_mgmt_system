import React, { useEffect, useState } from "react";
import { getDashboardReport } from "../api/employeeApi";
import { Fingerprint, Users, Clock, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const DashboardOverview = () => {
  const [stats, setStats] = useState([
    { label: "Total Employees", value: 0, color: "#60a5fa", icon: <Users /> },
    { label: "Present Today", value: 0, color: "#10b981", icon: <Fingerprint /> },
    { label: "On Leave", value: 0, color: "#facc15", icon: <Clock /> },
    { label: "Shift Violations", value: 0, color: "#a78bfa", icon: <DollarSign /> },
  ]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get user role from localStorage or your auth provider
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setUserRole(userObj.role || null);
      } catch {
        setUserRole(null);
      }
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      try {
        const res = await getDashboardReport(year, month);
        console.log(res,"logoogogogogo")

        // Prepare stats array with Total Savings if user is admin
        const baseStats = [
          {
            label: "Total Employees",
            value: res.todaySummary?.totalEmployees ?? 0,
            color: "#60a5fa",
            icon: <Users />,
          },
          {
            label: "Present Today",
            value: res.todaySummary?.presentToday ?? 0,
            color: "#10b981",
            icon: <Fingerprint />,
          },
          {
            label: "On Leave",
            value:
              (res.todaySummary?.totalEmployees ?? 0) - (res.todaySummary?.presentToday ?? 0),
            color: "#facc15",
            icon: <Clock />,
          },
          {
            label: "Shift Violations",
            value: res.todaySummary?.shiftViolations ?? 0,
            color: "#a78bfa",
            icon: <DollarSign />,
          },
        ];

        if (userRole === "admin") {
          baseStats.push({
            label: "Total Savings",
            value: res.todaySummary?.totalSavings ?? 0,
            color: "#22c55e", // greenish
            icon: <DollarSign />,
          });
        }

        setStats(baseStats);

        setAttendanceTrend(
          (res.monthlySummary || []).map((d) => ({
            date: `Day ${d.day}`,
            present: d.presentCount,
            leave: ((res.todaySummary?.totalEmployees ?? 0) - d.presentCount) || 0,
            ot: d.overtimeCount,
          }))
        );
      } catch {
        setStats([
          { label: "Total Employees", value: 0, color: "#60a5fa", icon: <Users /> },
          { label: "Present Today", value: 0, color: "#10b981", icon: <Fingerprint /> },
          { label: "On Leave", value: 0, color: "#facc15", icon: <Clock /> },
          { label: "Shift Violations", value: 0, color: "#a78bfa", icon: <DollarSign /> },
        ]);
        setAttendanceTrend([]);
      }
      setLoading(false);
    }
    if (userRole) {
      loadData();
    }
  }, [userRole]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Overview</h2>
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
            <div className="text-4xl font-extrabold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-md text-gray-300 mt-2">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-gray-900 mb-10 px-6 py-6 rounded-xl border border-blue-700/20 shadow w-full">
        <h3 className="text-lg font-bold mb-4 text-blue-300">
          Attendance, Leave & OT (This Month)
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
    </div>
  );
};

export default DashboardOverview;

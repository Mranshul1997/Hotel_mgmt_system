import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Fingerprint,
  LogOut,
  Home,
  Users,
  Clock,
  DollarSign,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutApi } from "../api/authApi"; // Import logout API function

// Admin sidebar tabs
const adminTabs = [
  { key: "", label: "Dashboard", icon: <Home size={20} /> },
  { key: "employees", label: "Manage Employees", icon: <Users size={20} /> },
  { key: "shifts", label: "Shift Schedules", icon: <Clock size={20} /> },
  { key: "payroll", label: "Payroll", icon: <DollarSign size={20} /> },
  {
    key: "biometric",
    label: "Biometric Settings",
    icon: <Fingerprint size={20} />,
  }, // New
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse current path for active tab
  const pathKey = location.pathname.split("/")[2] || "";

  const handleTabClick = (key: string) => {
    navigate(key === "" ? "/admin-dashboard" : `/admin-dashboard/${key}`);
  };

  const handleLogout = async () => {
    try {
      await logoutApi(); // call backend logout to blacklist token
    } catch (error) {
      // Optionally handle error, e.g. show toast
      console.error("Logout API failed", error);
    }
    // Clear client-side storage anyway
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const redirect = () => {
    navigate("/admin-dashboard");
  };
  return (
    <div className="flex min-h-screen">
      {/* Sidebar with logo at top */}
      <nav className="bg-gray-900 w-64 h-screen fixed left-0 top-0 p-4 text-gray-300 flex flex-col z-30">
        {/* Logo section */}
        <div className="mb-8 flex items-center gap-3 justify-center">
          <Fingerprint
            className="w-10 h-10 text-primary cursor-pointer"
            onClick={redirect}
          />
          <span
            className="text-xl font-bold text-white tracking-wide cursor-pointer"
            onClick={redirect}
          >
            BiometriQ
          </span>
        </div>
        {/* Sidebar tabs */}
        <div className="flex-1">
          <ul>
            {adminTabs.map((tab) => (
              <li
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`cursor-pointer flex items-center gap-2 p-3 rounded hover:bg-gray-700 ${
                  pathKey === tab.key
                    ? "bg-gray-700 font-semibold text-white"
                    : ""
                }`}
              >
                {tab.icon} {tab.label}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Header + Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Optional: remove duplicate logo from here */}
            <h1 className="text-2xl font-bold text-foreground min-w-full">
              BiometriQ Admin
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-border"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </header>
        <main className="p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

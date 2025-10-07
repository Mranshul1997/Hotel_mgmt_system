import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Home, CalendarCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const userTabs = [
  { key: "dashboard", label: "Dashboard", icon: <Home size={20} /> },
  { key: "attendance", label: "My Attendance", icon: <CalendarCheck size={20} /> },
  { key: "profile", label: "Profile", icon: <User size={20} /> },
];

const UserLayout = ({ children }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <nav className="bg-gray-900 w-64 min-h-screen p-4 text-gray-300">
        <ul>
          {userTabs.map(tab => (
            <li
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`cursor-pointer flex items-center gap-2 p-3 rounded hover:bg-gray-700 ${
                activeTab === tab.key ? "bg-gray-700 font-semibold text-white" : ""
              }`}
            >
              {tab.icon} {tab.label}
            </li>
          ))}
        </ul>
      </nav>
      {/* Header + Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">BiometriQ User</h1>
          </div>
          <Button variant="outline" onClick={handleLogout} className="border-border">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </header>
        <main className="p-6 overflow-auto">
          {!children && (
            <>
              {activeTab === "dashboard" && <div>User Dashboard Content</div>}
              {activeTab === "attendance" && <div>Attendance Content</div>}
              {activeTab === "profile" && <div>Profile Content</div>}
            </>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;

import React, { useState } from 'react';
import { Fingerprint, LogOut, Users, Clock, TrendingUp, Settings, Home, CalendarCheck, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  user: { role: 'admin' | 'user'; name?: string; email: string };
  handleLogout: () => void;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, handleLogout, children }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sidebar items differ based on user role
  const adminTabs = [
    { key: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { key: 'employees', label: 'Manage Employees', icon: <Users size={20} /> },
    { key: 'shifts', label: 'Shift Schedules', icon: <Clock size={20} /> },
    { key: 'payroll', label: 'Payroll', icon: <TrendingUp size={20} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  const userTabs = [
    { key: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { key: 'attendance', label: 'My Attendance', icon: <CalendarCheck size={20} /> },
    { key: 'profile', label: 'Profile', icon: <UserIcon size={20} /> }
  ];

  const tabs = user.role === 'admin' ? adminTabs : userTabs;

  return (
    <div className="flex min-h-screen bg-background">
      <nav className="bg-gray-900 w-64 min-h-screen p-4 text-gray-300">
        <ul>
          {tabs.map((tab) => (
            <li
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`cursor-pointer flex items-center gap-2 p-3 rounded hover:bg-gray-700 ${
                activeTab === tab.key ? 'bg-gray-700 font-semibold text-white' : ''
              }`}
            >
              {tab.icon} {tab.label}
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Fingerprint className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">BiometriQ {user.role === 'admin' ? 'Admin' : 'User'}</h1>
          </div>
          <div>
            <p className="font-semibold text-foreground">{user.name || user.email}</p>
            <Button variant="outline" onClick={handleLogout} className="border-border">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <main className="p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

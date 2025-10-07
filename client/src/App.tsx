import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboardHome from "./pages/AdminDashboardHome"; // new
import AdminEmployees from "./pages/AdminEmployees"; // new
import AdminShifts from "./pages/AdminShifts"; // new
import AdminPayroll from "./pages/AdminPayroll"; // new
import AdminSettings from "./pages/AdminSettings"; // new
import UserLayout from "./pages/UserLayout";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBiometric from "./pages/AdminBiometric";
import AdminPayrollRules from "./pages/AdminPayrollRules";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Nested Admin Routes */}
          <Route path="/admin-dashboard" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="home" element={<AdminDashboard />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="shifts" element={<AdminShifts />} />
            <Route path="payroll" element={<AdminPayroll />} />
            <Route path="biometric" element={<AdminBiometric />} />
            <Route path="payrollrules" element={<AdminPayrollRules />} />
          </Route>

          {/* User Layout Route */}
          <Route
            path="/user-dashboard"
            element={
              <UserLayout>
                <UserDashboard />
              </UserLayout>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

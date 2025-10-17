import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEmployees from "./pages/AdminEmployees";
import AdminShifts from "./pages/AdminShifts";
import AdminPayroll from "./pages/AdminPayroll";
import AdminSettings from "./pages/AdminSettings";
import AdminBiometric from "./pages/AdminBiometric";
import AdminPayrollRules from "./pages/AdminPayrollRules";
import AdminDashboardHome from "./pages/AdminDashboardHome";
import UserLayout from "./pages/UserLayout";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./routes/ProtectedRoute"; // <<== IMPORT THIS

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
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          {/* --- Admin Routes --- */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="home" element={<AdminDashboard />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="shifts" element={<AdminShifts />} />
            <Route path="payroll" element={<AdminPayroll />} />
            <Route path="biometric" element={<AdminBiometric />} />
            <Route path="payrollrules" element={<AdminPayrollRules />} />

            {/* If you want admin settings: */}
            {/* <Route path="settings" element={<AdminSettings />} /> */}
          </Route>
          {/* Uncomment if you want /user-dashboard to be protected as well */}
          {/* 
          <Route path="/user-dashboard" element={
            <ProtectedRoute>
              <UserLayout>
                <UserDashboard />
              </UserLayout>
            </ProtectedRoute>
          } />
          */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

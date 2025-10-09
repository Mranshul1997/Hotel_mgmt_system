import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPasswordApi } from "../api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await resetPasswordApi(token!, newPassword);
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/auth"), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="bg-card rounded-2xl p-8 shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-1">
              New Password
            </label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              className="bg-input border-border text-foreground"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
        {message && <p className="mt-4 text-green-400 font-semibold text-center">{message}</p>}
        {error && <p className="mt-4 text-red-500 font-semibold text-center">{error}</p>}
      </div>
    </div>
  );
};

export default ResetPasswordPage;

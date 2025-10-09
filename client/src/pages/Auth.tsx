import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, Mail, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { forgotPasswordApi, loginApi } from "../api/authApi"; // Corrected import path

type AuthMode = "login" | "forgot";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "forgot") {
      try {
        setLoading(true);
        await forgotPasswordApi(email);
        toast({
          title: "Reset Link Sent",
          description: "Check your email for password reset instructions.",
        });
        setMode("login");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to send reset link, try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const data = await loginApi(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.name}!`,
      });

      // Redirect for admin or subadmin goes to admin dashboard
      if (data.user.role === "admin" || data.user.role === "subadmin") {
        navigate("/admin-dashboard");
      } else {
        toast({
          title: "Unauthorized",
          description: "Your role is not allowed to access this system.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Server error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />

      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 text-foreground/60 hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Fingerprint
              className="w-16 h-16 text-primary"
              style={{ filter: "drop-shadow(0 0 10px hsl(var(--primary)))" }}
            />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {mode === "login" ? "Welcome Back" : "Reset Password"}
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            {mode === "login"
              ? "Sign in to your account"
              : "Enter your email to reset password"}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-input border-border text-foreground"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" }}
              disabled={loading}
            >
              {mode === "login" ? "Sign In" : "Send Reset Link"}
            </Button>
          </form>

          {mode === "forgot" && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <button
                onClick={() => setMode("login")}
                className="text-primary hover:underline"
                disabled={loading}
              >
                Back to login
              </button>
            </div>
          )}

         
        </div>
      </div>
    </div>
  );
};

export default Auth;

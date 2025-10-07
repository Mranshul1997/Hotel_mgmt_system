import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "signup" | "forgot";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "forgot") {
      toast({
        title: "Reset Link Sent",
        description: "Check your email for password reset instructions.",
      });
      setMode("login");
      return;
    }

    if (mode === "signup") {
      // Simulate signup
      localStorage.setItem(
        "user",
        JSON.stringify({ email, name, role: "user" })
      );
      toast({
        title: "Account Created",
        description: "Welcome to BiometriQ!",
      });
      navigate("/dashboard");
      return;
    }

    // Login simulation - check for admin
    // Login simulation - check for admin
    if (email === "admin@biometriq.com" && password === "admin123") {
      localStorage.setItem(
        "user",
        JSON.stringify({ email, name: "Admin", role: "admin" })
      );
      navigate("/admin-dashboard");
    } else {
      localStorage.setItem(
        "user",
        JSON.stringify({ email, name: name || "User", role: "user" })
      );
      navigate("/user-dashboard");
    }

    toast({
      title: "Login Successful",
      description: "Welcome back!",
    });
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
            {mode === "login"
              ? "Welcome Back"
              : mode === "signup"
              ? "Create Account"
              : "Reset Password"}
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            {mode === "login"
              ? "Sign in to your account"
              : mode === "signup"
              ? "Join BiometriQ today"
              : "Enter your email to reset password"}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-input border-border text-foreground"
                    required
                  />
                </div>
              </div>
            )}

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
            >
              {mode === "login"
                ? "Sign In"
                : mode === "signup"
                ? "Create Account"
                : "Send Reset Link"}
            </Button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "forgot" ? (
              <button
                onClick={() => setMode("login")}
                className="text-primary hover:underline"
              >
                Back to login
              </button>
            ) : (
              <>
                {mode === "login"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-primary hover:underline font-semibold"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </>
            )}
          </div>

          {/* Demo hint */}
          {mode === "login" && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground text-center">
              Demo: admin@biometriq.com / admin123 for admin access
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;

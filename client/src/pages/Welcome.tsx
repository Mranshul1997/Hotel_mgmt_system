import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";

const Welcome = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: "1s" }} />

      <div className={`relative z-10 text-center space-y-8 px-6 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        {/* Fingerprint icon with glow */}
        <div className="flex justify-center">
          <div className="relative">
            <Fingerprint className="w-32 h-32 text-primary animate-pulse" style={{ filter: "drop-shadow(0 0 20px hsl(var(--primary)))" }} />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-ping" />
          </div>
        </div>

        {/* Main heading */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in">
            BiometriQ
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Next-Generation Biometric Enhanced Attendance System
          </p>
        </div>

        {/* Description */}
        <p className="text-foreground/80 max-w-lg mx-auto text-lg">
          Secure, Fast, and Intelligent attendance tracking powered by advanced biometric recognition technology
        </p>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/auth")}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-12 py-6 text-lg rounded-full transition-all hover:scale-105"
          style={{ boxShadow: "0 0 30px hsl(var(--primary) / 0.5)" }}
        >
          Enter System
        </Button>

        {/* Tech indicators */}
        <div className="flex gap-8 justify-center text-sm text-muted-foreground pt-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
            <span>Reliable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
            <span>Fast</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;

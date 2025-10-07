import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Fingerprint,
  LogOut,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/auth");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const attendanceRecords = [
    {
      date: "2025-01-10",
      checkIn: "09:00 AM",
      checkOut: "05:30 PM",
      status: "present",
    },
    {
      date: "2025-01-09",
      checkIn: "09:15 AM",
      checkOut: "05:45 PM",
      status: "present",
    },
    {
      date: "2025-01-08",
      checkIn: "09:30 AM",
      checkOut: "05:20 PM",
      status: "late",
    },
    {
      date: "2025-01-07",
      checkIn: "09:00 AM",
      checkOut: "05:30 PM",
      status: "present",
    },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Fingerprint className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">BiometriQ</h1>
              <p className="text-sm text-muted-foreground">User Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-border"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="w-5 h-5 text-primary" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">22</p>
              <p className="text-sm text-muted-foreground">Days Present</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Clock className="w-5 h-5 text-accent" />
                Avg. Check-In
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">09:05 AM</p>
              <p className="text-sm text-muted-foreground">Average Time</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">95%</p>
              <p className="text-sm text-muted-foreground">This Month</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Attendance */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Attendance</CardTitle>
            <CardDescription>Your latest check-in records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendanceRecords.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-4">
                    {record.status === "present" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-semibold text-foreground">
                        {record.date}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {record.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">
                      In: {record.checkIn}
                    </p>
                    <p className="text-sm text-foreground">
                      Out: {record.checkOut}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Camera, Star, ArrowRight, CheckCircle, Clock, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { icon: Trophy, label: "Total Points", value: "430", color: "text-primary" },
  { icon: Flame, label: "Day Streak", value: "7", color: "text-secondary" },
  { icon: Camera, label: "Submissions", value: "18", color: "text-eco-sky" },
  { icon: Star, label: "Rank", value: "#42", color: "text-eco-sun" },
];

const recentSubmissions = [
  { id: 1, activity: "Trash Cleanup", points: 10, status: "verified", date: "Apr 5" },
  { id: 2, activity: "Tree Planting", points: 50, status: "pending", date: "Apr 4" },
  { id: 3, activity: "Recycling", points: 20, status: "verified", date: "Apr 3" },
  { id: 4, activity: "Area Cleaning", points: 30, status: "rejected", date: "Apr 2" },
];

const statusIcons = {
  verified: <CheckCircle size={16} className="text-primary" />,
  pending: <Clock size={16} className="text-secondary" />,
  rejected: <XCircle size={16} className="text-destructive" />,
};

const Dashboard = () => {
  const pointsToGoal = 1000;
  const currentPoints = 430;
  const progress = (currentPoints / pointsToGoal) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Eco Warrior! 🌿</h1>
          <p className="text-muted-foreground mt-1">Track your impact and earn rewards.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <Card key={s.label} className="p-5 shadow-eco-card hover:shadow-eco transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${s.color}`}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 mb-8 shadow-eco-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Progress to Reward</h2>
            <span className="text-sm font-bold text-primary">{currentPoints} / {pointsToGoal} pts</span>
          </div>
          <Progress value={progress} className="h-3 mb-2" />
          <p className="text-xs text-muted-foreground">{pointsToGoal - currentPoints} points to your next reward redemption</p>
        </Card>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Submissions</h2>
          <Link to="/upload">
            <Button variant="hero" size="sm">
              New Upload <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {recentSubmissions.map((s) => (
            <Card key={s.id} className="p-4 flex items-center justify-between shadow-eco-card hover:shadow-eco transition-shadow">
              <div className="flex items-center gap-3">
                {statusIcons[s.status as keyof typeof statusIcons]}
                <div>
                  <p className="font-medium text-foreground text-sm">{s.activity}</p>
                  <p className="text-xs text-muted-foreground">{s.date}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-primary">+{s.points} pts</span>
                <p className="text-xs text-muted-foreground capitalize">{s.status}</p>
              </div>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;

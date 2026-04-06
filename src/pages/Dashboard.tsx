import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Camera, Star, ArrowRight, CheckCircle, Clock, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const statusIcons = {
  verified: <CheckCircle size={16} className="text-primary" />,
  pending: <Clock size={16} className="text-secondary" />,
  rejected: <XCircle size={16} className="text-destructive" />,
};

const Dashboard = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: submissions } = useQuery({
    queryKey: ["submissions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: rankData } = useQuery({
    queryKey: ["rank", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id")
        .order("total_points", { ascending: false });
      if (error) throw error;
      const rank = data.findIndex(p => p.user_id === user!.id) + 1;
      return rank || "-";
    },
    enabled: !!user,
  });

  const totalPoints = profile?.total_points ?? 0;
  const streakDays = profile?.streak_days ?? 0;
  const totalSubmissions = submissions?.length ?? 0;
  const pointsToGoal = 1000;
  const progress = Math.min((totalPoints / pointsToGoal) * 100, 100);

  const stats = [
    { icon: Trophy, label: "Total Points", value: totalPoints.toString(), color: "text-primary" },
    { icon: Flame, label: "Day Streak", value: streakDays.toString(), color: "text-secondary" },
    { icon: Camera, label: "Submissions", value: totalSubmissions.toString(), color: "text-eco-sky" },
    { icon: Star, label: "Rank", value: `#${rankData ?? "-"}`, color: "text-eco-sun" },
  ];

  const displayName = profile?.display_name || "Eco Warrior";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {displayName}! 🌿</h1>
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
            <span className="text-sm font-bold text-primary">{totalPoints} / {pointsToGoal} pts</span>
          </div>
          <Progress value={progress} className="h-3 mb-2" />
          <p className="text-xs text-muted-foreground">
            {totalPoints >= pointsToGoal 
              ? "🎉 You're eligible for reward redemption!" 
              : `${pointsToGoal - totalPoints} points to your next reward redemption`}
          </p>
        </Card>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Submissions</h2>
          <Link to="/upload">
            <Button variant="hero" size="sm">
              New Upload <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        {submissions && submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map((s) => (
              <Card key={s.id} className="p-4 flex items-center justify-between shadow-eco-card hover:shadow-eco transition-shadow">
                <div className="flex items-center gap-3">
                  {statusIcons[s.status as keyof typeof statusIcons] || <Clock size={16} className="text-muted-foreground" />}
                  <div>
                    <p className="font-medium text-foreground text-sm capitalize">{s.activity_type.replace("_", " ")}</p>
                    <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-primary">+{s.points} pts</span>
                  <p className="text-xs text-muted-foreground capitalize">{s.status}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center shadow-eco-card">
            <p className="text-muted-foreground mb-4">No submissions yet. Start making an impact!</p>
            <Link to="/upload">
              <Button variant="hero">Upload Your First Action</Button>
            </Link>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;

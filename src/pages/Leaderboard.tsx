import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const rankIcons: Record<number, React.ReactNode> = {
  1: <Trophy size={20} className="text-eco-sun" />,
  2: <Medal size={20} className="text-muted-foreground" />,
  3: <Award size={20} className="text-eco-earth" />,
};

const Leaderboard = () => {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, total_points")
        .order("total_points", { ascending: false })
        .limit(20);
      if (error) throw error;

      // Get submission counts per user
      const enriched = await Promise.all(
        (data || []).map(async (profile, index) => {
          const { count } = await supabase
            .from("submissions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.user_id)
            .eq("status", "verified");
          
          const initials = profile.display_name
            ?.split(" ")
            .map((w: string) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "??";

          return {
            rank: index + 1,
            name: profile.display_name || "Anonymous",
            points: profile.total_points,
            actions: count || 0,
            avatar: initials,
          };
        })
      );
      return enriched;
    },
  });

  const topThree = leaderboard?.slice(0, 3) || [];
  const rest = leaderboard?.slice(3) || [];
  // Reorder podium as [2nd, 1st, 3rd] only when present
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">🏆 Leaderboard</h1>
          <p className="text-muted-foreground">Top eco-warriors making the biggest impact.</p>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading leaderboard...</div>
        ) : leaderboard && leaderboard.length > 0 ? (
          <>
            {topThree.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[topThree[1], topThree[0], topThree[2]].map((user, i) => {
                  const isFirst = i === 1;
                  return (
                    <Card
                      key={user.rank}
                      className={`p-5 text-center shadow-eco-card ${isFirst ? "shadow-eco-elevated -mt-4 ring-2 ring-primary/20" : ""}`}
                    >
                      <div className="flex justify-center mb-2">{rankIcons[user.rank]}</div>
                      <Avatar className={`mx-auto mb-2 ${isFirst ? "w-16 h-16" : "w-12 h-12"}`}>
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{user.avatar}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold text-foreground text-sm">{user.name}</p>
                      <p className="text-lg font-bold text-primary">{user.points.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{user.actions} actions</p>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="space-y-2">
              {rest.map((user) => (
                <Card key={user.rank} className="p-4 flex items-center justify-between shadow-eco-card hover:shadow-eco transition-shadow">
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center font-bold text-muted-foreground">#{user.rank}</span>
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="bg-muted text-foreground text-xs font-bold">{user.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.actions} actions</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary text-sm">{user.points.toLocaleString()} pts</span>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card className="p-8 text-center shadow-eco-card">
            <p className="text-muted-foreground">No eco-warriors yet. Be the first!</p>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;

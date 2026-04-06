import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const leaderboard = [
  { rank: 1, name: "Priya Sharma", points: 2450, actions: 89, avatar: "PS" },
  { rank: 2, name: "Arjun Patel", points: 2180, actions: 76, avatar: "AP" },
  { rank: 3, name: "Ananya Gupta", points: 1920, actions: 64, avatar: "AG" },
  { rank: 4, name: "Rahul Kumar", points: 1650, actions: 55, avatar: "RK" },
  { rank: 5, name: "Sneha Reddy", points: 1420, actions: 48, avatar: "SR" },
  { rank: 6, name: "Vikram Singh", points: 1280, actions: 42, avatar: "VS" },
  { rank: 7, name: "Meera Nair", points: 1100, actions: 38, avatar: "MN" },
  { rank: 8, name: "Rohit Das", points: 980, actions: 33, avatar: "RD" },
  { rank: 9, name: "Kavita Joshi", points: 870, actions: 29, avatar: "KJ" },
  { rank: 10, name: "Amit Verma", points: 750, actions: 25, avatar: "AV" },
];

const rankIcons: Record<number, React.ReactNode> = {
  1: <Trophy size={20} className="text-eco-sun" />,
  2: <Medal size={20} className="text-muted-foreground" />,
  3: <Award size={20} className="text-eco-earth" />,
};

const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">🏆 Leaderboard</h1>
          <p className="text-muted-foreground">Top eco-warriors making the biggest impact.</p>
        </div>

        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((user, i) => {
            const isFirst = i === 1;
            return (
              <Card
                key={user.rank}
                className={`p-5 text-center shadow-eco-card ${isFirst ? "shadow-eco-elevated -mt-4 ring-2 ring-primary/20" : ""}`}
              >
                <div className="flex justify-center mb-2">
                  {rankIcons[user.rank]}
                </div>
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

        {/* Full list */}
        <div className="space-y-2">
          {leaderboard.slice(3).map((user) => (
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
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;

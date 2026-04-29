import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Coins, IndianRupee, Wallet, Clock, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const POINTS_PER_REDEMPTION = 10000;
const INR_PER_REDEMPTION = 100;

const Redeem = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [units, setUnits] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank">("upi");
  const [paymentDetails, setPaymentDetails] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("total_points, display_name")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: redemptions } = useQuery({
    queryKey: ["redemptions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("redemptions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const totalPoints = profile?.total_points ?? 0;
  const maxUnits = Math.floor(totalPoints / POINTS_PER_REDEMPTION);
  const pointsToRedeem = units * POINTS_PER_REDEMPTION;
  const inrAmount = units * INR_PER_REDEMPTION;
  const canRedeem = maxUnits >= 1 && units >= 1 && units <= maxUnits;

  const redeemMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("redeem_points", {
        _points: pointsToRedeem,
        _payment_method: paymentMethod,
        _payment_details: paymentDetails.trim(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(`Redemption request for ₹${inrAmount} submitted!`);
      setPaymentDetails("");
      setUnits(1);
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
      qc.invalidateQueries({ queryKey: ["redemptions", user?.id] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: (e: Error) => {
      toast.error(e.message || "Redemption failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentDetails.trim()) {
      toast.error("Enter your payment details");
      return;
    }
    if (!canRedeem) {
      toast.error(`You need at least ${POINTS_PER_REDEMPTION.toLocaleString()} points to redeem`);
      return;
    }
    redeemMutation.mutate();
  };

  const statusBadge = (status: string) => {
    if (status === "paid") return <Badge className="bg-primary/10 text-primary border-primary/20"><CheckCircle2 size={12} className="mr-1" />Paid</Badge>;
    if (status === "approved") return <Badge className="bg-eco-sun/10 text-eco-sun border-eco-sun/20"><CheckCircle2 size={12} className="mr-1" />Approved</Badge>;
    if (status === "rejected") return <Badge variant="destructive"><XCircle size={12} className="mr-1" />Rejected</Badge>;
    return <Badge variant="secondary"><Clock size={12} className="mr-1" />Pending</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">💰 Convert Points to Cash</h1>
          <p className="text-muted-foreground">
            Redeem {POINTS_PER_REDEMPTION.toLocaleString()} points for ₹{INR_PER_REDEMPTION}.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card className="p-5 shadow-eco-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Coins className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Your Points</p>
                <p className="text-2xl font-bold text-foreground">{totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 shadow-eco-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-eco-sun/10">
                <IndianRupee className="text-eco-sun" size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Available Cash</p>
                <p className="text-2xl font-bold text-foreground">₹{(maxUnits * INR_PER_REDEMPTION).toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 shadow-eco-card mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Wallet size={18} /> Request Redemption
          </h2>

          {maxUnits < 1 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-2">
                You need at least <span className="font-bold text-foreground">{POINTS_PER_REDEMPTION.toLocaleString()}</span> points to cash out.
              </p>
              <p className="text-sm text-muted-foreground">
                Earn {(POINTS_PER_REDEMPTION - totalPoints).toLocaleString()} more points to unlock your first ₹{INR_PER_REDEMPTION}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="units">Amount to redeem</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input
                    id="units"
                    type="number"
                    min={1}
                    max={maxUnits}
                    value={units}
                    onChange={(e) => setUnits(Math.max(1, Math.min(maxUnits, parseInt(e.target.value) || 1)))}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">
                    × {POINTS_PER_REDEMPTION.toLocaleString()} pts = <span className="font-bold text-primary">₹{inrAmount.toLocaleString()}</span>
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="method">Payment method</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "upi" | "bank")}>
                  <SelectTrigger id="method" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="details">
                  {paymentMethod === "upi" ? "UPI ID" : "Account number, IFSC, name"}
                </Label>
                <Input
                  id="details"
                  placeholder={paymentMethod === "upi" ? "yourname@upi" : "e.g. 1234567890 / SBIN0001234 / Your Name"}
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <Button type="submit" disabled={!canRedeem || redeemMutation.isPending} className="w-full" variant="hero">
                {redeemMutation.isPending ? "Submitting..." : `Redeem ${pointsToRedeem.toLocaleString()} pts → ₹${inrAmount.toLocaleString()}`}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Requests are reviewed and paid out within 3–5 business days.
              </p>
            </form>
          )}
        </Card>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Redemption History</h2>
          {!redemptions || redemptions.length === 0 ? (
            <Card className="p-6 text-center shadow-eco-card">
              <p className="text-muted-foreground text-sm">No redemptions yet.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {redemptions.map((r) => (
                <Card key={r.id} className="p-4 shadow-eco-card">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-foreground">₹{r.amount_inr.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.points_used.toLocaleString()} pts • {r.payment_method.toUpperCase()} • {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {statusBadge(r.status)}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Redeem;

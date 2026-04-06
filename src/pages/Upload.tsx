import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload as UploadIcon, X, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const activityTypes = [
  { id: "trash", label: "Trash Cleanup", points: 10 },
  { id: "tree", label: "Plant a Tree", points: 50 },
  { id: "recycle", label: "Recycle Waste", points: 20 },
  { id: "clean", label: "Area Cleaning", points: 30 },
  { id: "water", label: "Water Conservation", points: 25 },
  { id: "plastic", label: "Reduce Plastic", points: 15 },
];

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [activity, setActivity] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [aiResult, setAiResult] = useState<{ feedback: string; recommended_status: string; confidence: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max file size is 50MB", variant: "destructive" });
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selectedFile || !activity || !user) return;
    setUploading(true);
    setProgress(10);

    try {
      // Upload file to storage
      const fileExt = selectedFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      setProgress(20);
      const { error: uploadError } = await supabase.storage
        .from("submissions")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      setProgress(50);

      const { data: { publicUrl } } = supabase.storage
        .from("submissions")
        .getPublicUrl(filePath);

      // AI verification
      setProgress(60);
      const activityInfo = activityTypes.find(a => a.id === activity);
      
      let verificationResult = { is_valid: true, confidence: 0.7, feedback: "Verification pending", recommended_status: "pending" as string };
      
      try {
        const { data: aiData, error: aiError } = await supabase.functions.invoke("verify-submission", {
          body: { imageUrl: publicUrl, activityType: activityInfo?.label || activity },
        });
        if (!aiError && aiData && !aiData.error) {
          verificationResult = aiData;
        }
      } catch {
        console.log("AI verification unavailable, submitting as pending");
      }

      setProgress(80);

      const points = verificationResult.recommended_status === "verified" ? (activityInfo?.points || 10) : 0;

      // Insert submission
      const { error: insertError } = await supabase.from("submissions").insert({
        user_id: user.id,
        activity_type: activity,
        description: description || null,
        file_url: publicUrl,
        file_type: selectedFile.type.startsWith("video") ? "video" : "image",
        points,
        status: verificationResult.recommended_status,
        ai_confidence: verificationResult.confidence,
        ai_feedback: verificationResult.feedback,
      });

      if (insertError) throw insertError;

      // Update profile points if verified
      if (verificationResult.recommended_status === "verified") {
        const { data: profile } = await supabase.from("profiles").select("total_points").eq("user_id", user.id).single();
        if (profile) {
          await supabase.from("profiles").update({ total_points: profile.total_points + points }).eq("user_id", user.id);
        }
      }

      setProgress(100);
      setAiResult({ feedback: verificationResult.feedback, recommended_status: verificationResult.recommended_status, confidence: verificationResult.confidence });
      setSubmitted(true);
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreview("");
    setActivity("");
    setDescription("");
    setProgress(0);
    setSubmitted(false);
    setAiResult(null);
  };

  if (submitted) {
    const isVerified = aiResult?.recommended_status === "verified";
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 flex items-center justify-center min-h-[80vh]">
          <Card className="p-10 text-center max-w-md shadow-eco-elevated animate-scale-in">
            <div className={`w-16 h-16 rounded-full ${isVerified ? "bg-primary/10" : "bg-secondary/10"} flex items-center justify-center mx-auto mb-4`}>
              {isVerified ? <CheckCircle size={32} className="text-primary" /> : <AlertCircle size={32} className="text-secondary" />}
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isVerified ? "Verified! ✅" : "Submission Received"}
            </h2>
            <p className="text-muted-foreground mb-2">{aiResult?.feedback}</p>
            {aiResult && (
              <p className="text-xs text-muted-foreground mb-6">
                AI Confidence: {Math.round((aiResult.confidence || 0) * 100)}% · Status: {aiResult.recommended_status}
              </p>
            )}
            <div className="flex gap-3">
              <Button variant="hero" onClick={reset} className="flex-1">Submit Another</Button>
              <Button variant="hero-outline" onClick={() => navigate("/dashboard")} className="flex-1">Dashboard</Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload Your Action</h1>
        <p className="text-muted-foreground mb-8">Share your eco-friendly activity and earn points.</p>

        <Card className="p-6 shadow-eco-card mb-6">
          <label className="block text-sm font-semibold text-foreground mb-3">Activity Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activityTypes.map((a) => (
              <button
                key={a.id}
                onClick={() => setActivity(a.id)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                  activity === a.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {a.label}
                <span className="block text-xs mt-0.5 font-bold">+{a.points} pts</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-eco-card mb-6">
          <label className="block text-sm font-semibold text-foreground mb-3">Photo or Video</label>
          {!preview ? (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/40 transition-colors"
            >
              <Camera size={40} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, MP4, MOV (max 50MB)</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden">
              {selectedFile?.type.startsWith("video") ? (
                <video src={preview} controls className="w-full rounded-xl max-h-64 object-cover" />
              ) : (
                <img src={preview} alt="Preview" className="w-full rounded-xl max-h-64 object-cover" />
              )}
              <button
                onClick={() => { setSelectedFile(null); setPreview(""); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-foreground/60 flex items-center justify-center"
              >
                <X size={16} className="text-background" />
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,video/mp4,video/quicktime" className="hidden" onChange={handleFile} />
        </Card>

        <Card className="p-6 shadow-eco-card mb-6">
          <label className="block text-sm font-semibold text-foreground mb-3">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about your eco-action..."
            className="w-full bg-muted/50 border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none h-24 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
          />
        </Card>

        {uploading && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">
                {progress < 50 ? "Uploading..." : progress < 80 ? "AI Verifying..." : "Saving..."}
              </span>
              <span className="text-primary font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Button
          variant="hero"
          size="lg"
          className="w-full text-base"
          onClick={handleSubmit}
          disabled={!selectedFile || !activity || uploading}
        >
          <UploadIcon size={18} /> Submit for Verification
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default UploadPage;

import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, TreePine, Recycle } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-nature.jpg";

const HeroSection = () => {
  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Lush green forest"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-6 animate-fade-in">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium backdrop-blur-sm">
              <Leaf size={14} />
              Rewarding Green Actions
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Do Good for the Planet.{" "}
            <span className="text-eco-sun">Get Rewarded.</span>
          </h1>

          <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Upload photos of your eco-friendly actions — from cleaning up trash to planting trees — and earn real rewards verified by AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/upload">
              <Button variant="hero" size="lg" className="text-base">
                Start Earning <ArrowRight size={18} />
              </Button>
            </Link>
            <Button variant="hero-outline" size="lg" className="text-base text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10" onClick={scrollToHowItWorks}>
              How It Works
            </Button>
          </div>

          <div className="flex items-center gap-8 mt-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              { icon: TreePine, label: "Plant Trees & Earn" },
              { icon: Recycle, label: "AI-Verified Actions" },
              { icon: Leaf, label: "Real Rewards" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-primary-foreground/70">
                <Icon size={18} className="text-eco-sun" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

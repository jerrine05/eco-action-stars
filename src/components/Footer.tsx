import { Leaf } from "lucide-react";
import ecoLogo from "@/assets/eco-logo.png";

const Footer = () => (
  <footer className="bg-foreground/5 border-t border-border py-12">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <img src={ecoLogo} alt="EcoReward" className="h-6 w-6" />
          <span className="font-bold text-foreground">
            Eco<span className="text-primary">Reward</span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 EcoReward. Making the planet greener, one action at a time.
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

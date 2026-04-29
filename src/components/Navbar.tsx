import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ecoLogo from "@/assets/eco-logo.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/upload", label: "Upload" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/redeem", label: "Redeem" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={ecoLogo} alt="EcoReward" className="h-8 w-8" />
          <span className="text-xl font-bold text-foreground">
            Eco<span className="text-primary">Reward</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>Log out</Button>
          ) : (
            <>
              <Link to="/auth"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link to="/auth"><Button variant="hero" size="sm">Sign up</Button></Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-card border-b border-border px-4 pb-4 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 mt-3">
            {user ? (
              <Button variant="ghost" size="sm" className="flex-1" onClick={handleSignOut}>Log out</Button>
            ) : (
              <>
                <Link to="/auth" className="flex-1"><Button variant="ghost" size="sm" className="w-full">Log in</Button></Link>
                <Link to="/auth" className="flex-1"><Button variant="hero" size="sm" className="w-full">Sign up</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import { Camera, ShieldCheck, Trophy, Banknote } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Capture Your Action",
    description: "Take a photo or video of your eco-friendly activity — cleaning, planting, recycling.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: ShieldCheck,
    title: "AI Verification",
    description: "Our AI validates the authenticity and environmental impact of your submission.",
    color: "bg-eco-sky/20 text-eco-sky",
  },
  {
    icon: Trophy,
    title: "Earn Points",
    description: "Receive points based on the type and impact of your activity.",
    color: "bg-secondary/20 text-secondary",
  },
  {
    icon: Banknote,
    title: "Redeem Rewards",
    description: "Convert 1000+ points into real money via UPI, PayPal, or bank transfer.",
    color: "bg-eco-earth/20 text-eco-earth",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Four simple steps to turn your environmental actions into real rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative bg-card rounded-2xl p-6 shadow-eco-card hover:shadow-eco transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <step.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

import { Trash2, TreePine, Recycle, Droplets, Leaf, Wind } from "lucide-react";

const activities = [
  { icon: Trash2, label: "Trash Cleanup", points: 10, color: "bg-eco-earth/15 text-eco-earth" },
  { icon: TreePine, label: "Plant a Tree", points: 50, color: "bg-primary/15 text-primary" },
  { icon: Recycle, label: "Recycle Waste", points: 20, color: "bg-eco-sky/15 text-eco-sky" },
  { icon: Droplets, label: "Water Conservation", points: 25, color: "bg-eco-water/15 text-eco-water" },
  { icon: Leaf, label: "Area Cleaning", points: 30, color: "bg-eco-leaf/15 text-eco-leaf" },
  { icon: Wind, label: "Reduce Plastic", points: 15, color: "bg-secondary/20 text-secondary" },
];

const ActivitiesSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Earn Points for Every Action
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Every eco-friendly deed counts. Here's what you can earn.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {activities.map((a, i) => (
            <div
              key={a.label}
              className="bg-card rounded-2xl p-5 text-center shadow-eco-card hover:shadow-eco hover:-translate-y-1 transition-all duration-300 cursor-pointer group animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${a.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <a.icon size={22} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{a.label}</h3>
              <span className="text-xs font-bold text-primary">+{a.points} pts</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;

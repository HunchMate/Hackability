import { AnimatedFeatureCard } from "@/components/ui/feature-card-1";

// Data for the feature cards
const features = [
  {
    index: "001",
    tag: "HEALTHIFY",
    title: "Eat better to boost your gut health by 30s.",
    imageSrc: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop", 
    color: "orange" as const,
  },
  {
    index: "002",
    tag: "DETANE",
    title: "Avoid Chemicals to have a longer lifespan.",
    imageSrc: "https://images.unsplash.com/photo-1542406775-846174a80695?q=80&w=1000&auto=format&fit=crop", 
    color: "purple" as const,
  },
  {
    index: "003",
    tag: "MEDITATE",
    title: "Quick Calm Sessions that unlock your potential.",
    imageSrc: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop", 
    color: "blue" as const,
  },
];

export default function FeatureCardDemo() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="container mx-auto grid max-w-5xl grid-cols-1 gap-8 p-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <AnimatedFeatureCard
            key={feature.index}
            index={feature.index}
            tag={feature.tag}
            title={feature.title}
            imageSrc={feature.imageSrc}
            color={feature.color}
          />
        ))}
      </div>
    </div>
  );
}

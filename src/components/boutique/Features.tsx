import { Truck, Shield, Sparkles, Clock } from "lucide-react";

const FeaturesNYC = () => {
  const features = [
    {
      icon: Truck,
      title: "Livraison Gratuite",
      description: "À partir de 150€ d'achat",
    },
    {
      icon: Shield,
      title: "Paiement Sécurisé",
      description: "Transactions 100% protégées",
    },
    {
      icon: Sparkles,
      title: "Qualité Premium",
      description: "Matériaux d'exception",
    },
    {
      icon: Clock,
      title: "Retours 30 jours",
      description: "Satisfait ou remboursé",
    },
  ];

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="text-center space-y-3 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/20 text-gold">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-serif font-semibold">
                  {feature.title}
                </h3>
                <p className="text-primary-foreground/70 text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesNYC;

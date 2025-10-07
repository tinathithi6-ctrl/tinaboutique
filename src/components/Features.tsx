import { useTranslation } from "react-i18next";
import { Truck, Shield, Sparkles, Headphones } from "lucide-react";

const Features = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: Sparkles,
      title: t("features.quality.title"),
      description: t("features.quality.description"),
    },
    {
      icon: Truck,
      title: t("features.shipping.title"),
      description: t("features.shipping.description"),
    },
    {
      icon: Shield,
      title: t("features.returns.title"),
      description: t("features.returns.description"),
    },
    {
      icon: Headphones,
      title: t("features.support.title"),
      description: t("features.support.description"),
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

export default Features;

import { useTranslation } from "react-i18next";
import { Target, Heart } from "lucide-react";

const About = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-card" id="about">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-gold text-sm font-heading font-semibold uppercase tracking-widest mb-2">
            {t("about.subtitle")}
          </p>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            {t("about.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t("about.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Mission */}
          <div className="bg-background p-8 rounded-lg shadow-elegant hover:shadow-gold transition-all group animate-slide-up">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-8 h-8 text-gold" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              {t("about.mission.title")}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t("about.mission.description")}
            </p>
          </div>

          {/* Values */}
          <div className="bg-background p-8 rounded-lg shadow-elegant hover:shadow-gold transition-all group animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Heart className="w-8 h-8 text-gold" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
              {t("about.values.title")}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t("about.values.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

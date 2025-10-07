import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero-fashion.jpg";

const Hero = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Scale Animation */}
      <div className="absolute inset-0 animate-scale-in">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/80" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <p className="text-gold text-sm font-heading font-semibold uppercase tracking-widest mb-4 animate-slide-up">
              {t("hero.subtitle")}
            </p>
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 animate-slide-up">
              {t("hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.4s" }}>
              {t("hero.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: "0.6s" }}>
              <a href="#shop">
                <Button size="lg" variant="gold" className="min-w-[200px] hover:scale-105 transition-transform">
                  {t("hero.shopButton")}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-8 w-8 text-white" />
      </div>
    </section>
  );
};

export default Hero;

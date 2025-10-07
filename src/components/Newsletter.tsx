import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t("newsletter.success"),
    });
    setEmail("");
  };

  return (
    <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <p className="text-gold text-sm font-heading font-semibold uppercase tracking-widest">
              {t("newsletter.subtitle")}
            </p>
            <h2 className="text-4xl md:text-5xl font-heading font-bold">
              {t("newsletter.title")}
            </h2>
            <p className="text-lg text-primary-foreground/90">
              {t("newsletter.description")}
            </p>
          </div>

          {/* Newsletter Form */}
          <form 
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Input
              type="email"
              placeholder={t("newsletter.placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-14 px-6 bg-white text-primary border-0 focus:ring-2 focus:ring-gold rounded-xl"
            />
            <Button
              type="submit"
              size="lg"
              variant="gold"
              className="h-14 px-8 whitespace-nowrap"
            >
              {t("newsletter.button")}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;

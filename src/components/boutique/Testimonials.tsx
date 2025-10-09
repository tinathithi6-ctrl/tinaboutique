import { Star } from "lucide-react";

const TestimonialsNYC = () => {
  const testimonials = [
    {
      name: "Sophie Martin",
      role: "Styliste",
      image: "/src/assets/img/person/person-f-1.webp",
      rating: 5,
      text: "Tina NYC propose des pièces exceptionnelles. La qualité et le style sont au rendez-vous à chaque commande !",
    },
    {
      name: "David Chen",
      role: "Entrepreneur",
      image: "/src/assets/img/person/person-m-5.webp",
      rating: 5,
      text: "Un service client impeccable et des produits qui reflètent vraiment l'élégance new-yorkaise. Je recommande vivement !",
    },
    {
      name: "Emma Dubois",
      role: "Architecte",
      image: "/src/assets/img/person/person-f-3.webp",
      rating: 5,
      text: "La collection est toujours à la pointe de la mode. C'est devenu mon incontournable pour mes tenues professionnelles.",
    },
    {
      name: "Marc Laurent",
      role: "Designer",
      image: "/src/assets/img/person/person-m-7.webp",
      rating: 5,
      text: "Des matériaux de première qualité et un design soigné. Tina NYC incarne le luxe accessible.",
    },
  ];

  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <p className="text-gold text-sm font-medium tracking-widest uppercase">
            Témoignages
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold">
            Ce Que Disent Nos Clients
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            Des milliers de clients satisfaits à travers le monde
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-primary-foreground/5 backdrop-blur-sm p-6 rounded-sm space-y-4 animate-scale-in hover:bg-primary-foreground/10 transition-smooth"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Rating */}
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Text */}
              <p className="text-primary-foreground/90 text-sm leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-primary-foreground/10">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gold/20"
                />
                <div>
                  <div className="font-semibold text-primary-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-primary-foreground/60">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsNYC;

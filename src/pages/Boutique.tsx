import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/boutique/HeroSection";
import PromoCards from "@/components/boutique/PromoCards";
import FeaturedProducts from "@/components/boutique/FeaturedProducts";
import Features from "@/components/boutique/Features";
import Testimonials from "@/components/boutique/Testimonials";
import Newsletter from "@/components/boutique/Newsletter";

const Boutique = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <PromoCards />
        <FeaturedProducts />
        <Features />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Boutique;

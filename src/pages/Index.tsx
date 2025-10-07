import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Collections from "@/components/Collections";
import CategoryShowcase from "@/components/CategoryShowcase";
import About from "@/components/About";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Collections />
        <CategoryShowcase />
        <About />
        <Features />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

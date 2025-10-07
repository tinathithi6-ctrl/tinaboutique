import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Product = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-8">
        <h1 className="text-3xl font-bold">{t("product.title")}</h1>
        <p>{t("product.comingSoon")}</p>
      </main>
      <Footer />
    </div>
  );
};

export default Product;

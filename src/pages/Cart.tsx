import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Cart = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-8">
        <h1 className="text-3xl font-bold">{t("cart.title")}</h1>
        <p>{t("cart.comingSoon")}</p>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;

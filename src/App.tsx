import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/config";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Boutique from "./pages/Boutique";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Chatbot from "./components/Chatbot";
import CategoryPage from "./pages/CategoryPage";
import ProductAdmin from "./pages/admin/ProductAdmin";
import Search from "./pages/Search";
import SearchPage from "./pages/SearchPage";
import WishlistPage from "./pages/WishlistPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/login" element={<Auth />} />
                    <Route path="/profile" element={<Profile />} />
                    
                    {/* 🔒 ROUTES ADMIN PROTÉGÉES */}
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <Admin />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/products" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <ProductAdmin />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/boutique" element={<Boutique />} />
                    <Route path="/category/:name" element={<CategoryPage />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/product/:slug" element={<Product />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Chatbot />
                </BrowserRouter>
              </TooltipProvider>
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;

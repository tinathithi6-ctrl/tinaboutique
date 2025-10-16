import React from 'react';
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
import { CurrencyProvider } from "./contexts/CurrencyContext";
import CurrencySelector from './components/CurrencySelector';
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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
import CurrencyRatesAdmin from "./pages/admin/CurrencyRatesAdmin";
import SettingsAdmin from "./pages/admin/SettingsAdmin";
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
            <CurrencyProvider>
              <CartProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />

                  {/* Currency selector visible in header area */}
                  <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 60 }}>
                    <CurrencySelector />
                  </div>

                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/login" element={<Auth />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
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
                      <Route
                        path="/admin/currency-rates"
                        element={
                          <ProtectedRoute requireAdmin>
                            <CurrencyRatesAdmin />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/settings"
                        element={
                          <ProtectedRoute requireAdmin>
                            <SettingsAdmin />
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
            </CurrencyProvider>
          </ThemeProvider>
        </AuthProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;

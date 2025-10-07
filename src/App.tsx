import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/config";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { useUserRole } from "./hooks/useUserRole";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const AdminRedirector = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !roleLoading && user && isAdmin) {
      if (!location.pathname.startsWith("/admin")) {
        navigate("/admin", { replace: true });
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, location, navigate]);

  return null; // This component does not render anything
};

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
                  <AdminRedirector />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:slug" element={<Product />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
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

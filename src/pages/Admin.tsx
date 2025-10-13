import { useEffect, useState } from "react";
import apiFetch from '@/lib/api';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import ProductAdmin from "./admin/ProductAdmin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminDashboardPro from "./admin/AdminDashboardPro";
import { AdminCategories } from "@/components/admin/AdminCategories";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { ActivityLogs } from "@/components/admin/ActivityLogs";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, LogOut, Search, BarChart3, Activity } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const { t } = useTranslation();
  const { user, signOut, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchType, setSearchType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Protection déjà gérée par ProtectedRoute dans App.tsx
  // Ce useEffect est conservé comme sécurité supplémentaire
  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate("/auth", { state: { from: location }, replace: true });
      } else if (!isAdmin) {
        navigate("/", { replace: true });
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate, location]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleGlobalSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Veuillez saisir un terme de recherche");
      return;
    }

    setIsSearching(true);
    try {
      let results: any[] = [];

  if (searchType === "all" || searchType === "products") {
  const products = await apiFetch('/api/products') as any[];
        if (Array.isArray(products)) {
          const filteredProducts = products.filter((p: any) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
          results.push(...filteredProducts.map((p: any) => ({ ...p, type: "product" })));
        }
      }

      if (searchType === "all" || searchType === "users") {
        // Recherche utilisateurs via API admin
        const users = await apiFetch(`/api/admin/users?search=${encodeURIComponent(searchTerm)}`) as any[];
        if (Array.isArray(users)) {
          results.push(...users.map((u: any) => ({ ...u, type: "user" })));
        }
      }

      if (searchType === "all" || searchType === "orders") {
        const orders = await apiFetch('/api/admin/orders') as any[];
        if (Array.isArray(orders)) {
          const filteredOrders = orders.filter((o: any) =>
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
          results.push(...filteredOrders.map((o: any) => ({ ...o, type: "order" })));
        }
      }

      if (searchType === "carts") {
        const carts = await apiFetch('/api/admin/abandoned-carts') as any[];
        if (Array.isArray(carts)) {
          const filteredCarts = carts.filter((c: any) =>
            c.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
          results.push(...filteredCarts.map((c: any) => ({ ...c, type: "cart" })));
        }
      }

      setSearchResults(results);
      toast.success(`${results.length} résultat(s) trouvé(s)`);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast.error("Erreur lors de la recherche");
    } finally {
      setIsSearching(false);
    }
  };

  if (authLoading || roleLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl">{t("admin.title")}</CardTitle>
            <CardDescription>{t("admin.description")}</CardDescription>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            {t("admin.buttons.signOut")}
          </Button>
        </CardHeader>
      </Card>

      {/* Zone de recherche globale */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche Globale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rechercher par</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="all">Tout</option>
                <option value="products">Produits</option>
                <option value="users">Utilisateurs</option>
                <option value="orders">Commandes</option>
                <option value="carts">Paniers abandonnés</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Terme de recherche</label>
              <Input
                placeholder="Nom, email, ID, référence..."
                className="w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGlobalSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={handleGlobalSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <>Recherche...</>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">Résultats ({searchResults.length})</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 mr-2">
                          {result.type === 'product' ? 'Produit' :
                           result.type === 'user' ? 'Utilisateur' :
                           result.type === 'order' ? 'Commande' : 'Panier'}
                        </span>
                        {result.type === 'product' && (
                          <span className="font-medium">{result.name}</span>
                        )}
                        {result.type === 'user' && (
                          <span className="font-medium">{result.full_name} - {result.email}</span>
                        )}
                        {result.type === 'order' && (
                          <span className="font-medium">Commande {result.id.slice(0, 8)} - {result.full_name}</span>
                        )}
                        {result.type === 'cart' && (
                          <span className="font-medium">{result.product_name} - {result.user_name}</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.type === 'product' && `€${result.price_eur}`}
                        {result.type === 'order' && `€${parseFloat(result.total_amount).toFixed(2)}`}
                        {result.type === 'cart' && `${result.quantity} × €${result.price_eur}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            {t("admin.tabs.dashboard")}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analyses
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t("admin.tabs.products")}
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            {t("admin.tabs.categories")}
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            {t("admin.tabs.orders")}
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("admin.tabs.users")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <AdminDashboardPro />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AdminAnalytics />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <ActivityLogs />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <ProductAdmin />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <AdminCategories />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <AdminOrders />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <AdminUsers />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;

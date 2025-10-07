import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminCategories } from "@/components/admin/AdminCategories";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, LogOut } from "lucide-react";

const Admin = () => {
  const { t } = useTranslation();
  const { user, signOut, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate("/auth", { state: { from: location }, replace: true });
      } else if (!isAdmin) {
        navigate("/");
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate, location]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            {t("admin.tabs.dashboard")}
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
          <AdminDashboard />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <AdminProducts />
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

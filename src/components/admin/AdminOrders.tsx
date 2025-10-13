import { useEffect, useState } from "react";
import apiFetch from '@/lib/api';
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, Filter, Eye, TrendingUp, Package, Users, DollarSign } from "lucide-react";

export const AdminOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Filtres
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    search: '',
    startDate: '',
    endDate: ''
  });

  const fetchOrders = async () => {
    try {
      // Version simplifiée pour commencer
  const data = await apiFetch('/api/admin/orders') as any[];
      setOrders(Array.isArray(data) ? data : []);
      setFilteredOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(t("admin.orders.error"));
    }
  };

  const fetchStatistics = async () => {
    try {
      // Version simplifiée - juste les stats de base
  const salesData = await apiFetch('/api/admin/reports/sales-summary').catch(() => ({ total_revenue: { total_eur: '0', total_usd: '0', total_cdf: '0' }, total_orders: 0, total_products_sold: 0 }));
      setStatistics({ salesSummary: salesData, ordersByCategory: [] });
      setTopProducts([]);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setStatistics({
        salesSummary: {
          total_revenue: { total_eur: '0', total_usd: '0', total_cdf: '0' },
          total_orders: 0,
          total_products_sold: 0
        },
        ordersByCategory: []
      });
      setTopProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
  const data = await apiFetch('/api/categories') as any[];
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchOrders(), fetchStatistics(), fetchCategories()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
  await apiFetch(`/api/admin/orders/${orderId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) } as any);
      toast.success(t("admin.orders.statusUpdated"));
      fetchOrders();
      fetchStatistics();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(t("admin.orders.error"));
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary', label: 'En attente' },
      processing: { variant: 'default', label: 'En cours' },
      shipped: { variant: 'outline', label: 'Expédié' },
      delivered: { variant: 'default', label: 'Livré' },
      cancelled: { variant: 'destructive', label: 'Annulé' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-8">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Ventes</p>
                <p className="text-2xl font-bold">
                  €{(statistics.salesSummary?.total_eur || 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Commandes</p>
                <p className="text-2xl font-bold">{statistics.salesSummary?.total_orders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Produits vendus</p>
                <p className="text-2xl font-bold">{statistics.salesSummary?.total_products_sold || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Clients</p>
                <p className="text-2xl font-bold">{statistics.ordersByCategory?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
          <TabsTrigger value="products">Produits populaires</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Gestion des Commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.full_name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{order.email || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        €{parseFloat(order.total_amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="pending">En attente</option>
                          <option value="processing">En cours</option>
                          <option value="shipped">Expédié</option>
                          <option value="delivered">Livré</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Modal simplifié */}
              {selectedOrder && (
                <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Détails de la commande {selectedOrder.id.slice(0, 8)}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold">Client</h4>
                          <p>{selectedOrder.full_name}</p>
                          <p className="text-sm text-muted-foreground">{selectedOrder.email}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold">Statut</h4>
                          <p>{selectedOrder.status}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold">Total</h4>
                        <p className="text-lg font-bold">€{parseFloat(selectedOrder.total_amount).toFixed(2)}</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Commandes</TableHead>
                    <TableHead>Revenus</TableHead>
                    <TableHead>Panier moyen</TableHead>
                    <TableHead>Clients uniques</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statistics.ordersByCategory?.map((cat: any) => (
                    <TableRow key={cat.category_name}>
                      <TableCell className="font-medium">{cat.category_name}</TableCell>
                      <TableCell>{cat.total_orders}</TableCell>
                      <TableCell>€{parseFloat(cat.total_revenue).toFixed(2)}</TableCell>
                      <TableCell>€{parseFloat(cat.avg_order_value).toFixed(2)}</TableCell>
                      <TableCell>{cat.unique_customers}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Produits les plus vendus</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Quantité vendue</TableHead>
                    <TableHead>Revenus</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell>
                          <img
                            src={(() => {
                              const url = product.image_url || '';
                              if (!url) return '/placeholder.svg';
                              if (url.startsWith('http')) return url;
                              if (url.startsWith('/uploads/')) {
                                const base = (import.meta.env.VITE_API_URL as string) || (import.meta.env.MODE === 'development' ? 'http://localhost:3001' : '');
                                return `${base}${url}`;
                              }
                              return url;
                            })()}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category_name}</TableCell>
                      <TableCell>€{product.price_eur}</TableCell>
                      <TableCell>{product.total_sold}</TableCell>
                      <TableCell>€{parseFloat(product.total_revenue).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

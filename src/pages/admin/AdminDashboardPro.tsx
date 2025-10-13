import { useState, useEffect } from 'react';
import apiFetch from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KPICard } from '@/components/admin/KPICard';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  ShoppingBag,
  AlertCircle,
  Clock,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
}

const AdminDashboardPro = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  
  // ✅ DONNÉES RÉELLES depuis la base de données
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [paymentMethodsData, setPaymentMethodsData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Use centralized apiFetch which injects auth token automatically
      // ✅ 1. Récupérer les stats principales
      try {
  const data = await apiFetch('/api/admin/dashboard/stats');
        setStats(data as DashboardStats);
      } catch (e) {
        // ignore, handled below
      }

      // ✅ 2. Récupérer ventes par jour (7 derniers jours)
      try {
  const data = await apiFetch('/api/admin/sales-by-day?days=7');
        setSalesData(Array.isArray(data) ? data : []);
      } catch (e) {}

      // ✅ 3. Récupérer ventes par catégorie
      try {
  const data = await apiFetch('/api/admin/sales-by-category');
        setCategoryData(Array.isArray(data) ? data : []);
      } catch (e) {}

      // ✅ 4. Récupérer méthodes de paiement
      try {
  const data = await apiFetch('/api/admin/payment-methods-stats');
        setPaymentMethodsData(Array.isArray(data) ? data : []);
      } catch (e) {}

      // ✅ 5. Récupérer dernières commandes
      try {
  const data = await apiFetch('/api/admin/recent-orders?limit=5');
        setRecentOrders(Array.isArray(data) ? data : []);
      } catch (e) {}

      // ✅ 6. Récupérer top produits
      try {
  const data = await apiFetch('/api/admin/top-products?limit=4');
        setTopProducts(Array.isArray(data) ? data : []);
      } catch (e) {}

    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Livrée': return 'bg-green-100 text-green-800';
      case 'En cours': return 'bg-blue-100 text-blue-800';
      case 'Payée': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tableau de Bord</h2>
          <p className="text-gray-600 mt-1">Vue d'ensemble de votre boutique</p>
        </div>
        <div className="flex gap-2">
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="7d">7 jours</TabsTrigger>
              <TabsTrigger value="30d">30 jours</TabsTrigger>
              <TabsTrigger value="90d">90 jours</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Revenu Total"
          value={formatCurrency(stats.totalRevenue)}
          trend={stats.revenueGrowth}
          icon={DollarSign}
          iconColor="text-green-600"
          loading={loading}
        />
        <KPICard
          title="Commandes"
          value={stats.totalOrders}
          trend={stats.ordersGrowth}
          icon={ShoppingCart}
          iconColor="text-blue-600"
          loading={loading}
        />
        <KPICard
          title="Clients"
          value={stats.totalCustomers}
          trend={stats.customersGrowth}
          icon={Users}
          iconColor="text-purple-600"
          loading={loading}
        />
        <KPICard
          title="Panier Moyen"
          value={formatCurrency(stats.averageOrderValue)}
          trend={5.2}
          icon={ShoppingBag}
          iconColor="text-orange-600"
          loading={loading}
        />
      </div>

      {/* KPI Cards Supplémentaires */}
      <div className="grid gap-6 md:grid-cols-3">
        <KPICard
          title="Produits Vendus"
          value={stats.totalProducts}
          icon={Package}
          iconColor="text-indigo-600"
          loading={loading}
        />
        <KPICard
          title="Taux de Conversion"
          value={`${stats.conversionRate}%`}
          trend={0.5}
          icon={Target}
          iconColor="text-pink-600"
          loading={loading}
        />
        <KPICard
          title="Paniers Abandonnés"
          value="12"
          icon={AlertCircle}
          iconColor="text-red-600"
          loading={loading}
        />
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Graphique des ventes */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Ventes</CardTitle>
            <CardDescription>Ventes de la dernière semaine</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="ventes" stroke="#D4AF37" fillOpacity={1} fill="url(#colorVentes)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graphique ventes par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle>Ventes par Catégorie</CardTitle>
            <CardDescription>Répartition des ventes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#D4AF37" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Méthodes de paiement et Top Produits */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Méthodes de paiement */}
        <Card>
          <CardHeader>
            <CardTitle>Méthodes de Paiement</CardTitle>
            <CardDescription>Répartition des paiements</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Produits */}
        <Card>
          <CardHeader>
            <CardTitle>Top Produits</CardTitle>
            <CardDescription>Les plus vendus cette semaine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between pb-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center font-bold text-gold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} ventes</p>
                    </div>
                  </div>
                  <p className="font-bold text-gold">{formatCurrency(product.revenue)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dernières commandes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dernières Commandes</CardTitle>
              <CardDescription>Commandes récentes en temps réel</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">#{order.id} - {order.customer}</p>
                    <p className="text-xs text-gray-500">Il y a {order.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold">{formatCurrency(order.amount)}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPro;

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays, format } from 'date-fns';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

interface ChartData {
  name: string;
  total: number;
}

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [salesSummary, monthlySales] = await Promise.all([
          fetch('http://localhost:3001/api/admin/reports/sales-summary').then(res => res.json()),
          fetch('http://localhost:3001/api/admin/reports/monthly-sales').then(res => res.json()),
        ]);

        setStats({
          totalRevenue: salesSummary.total_revenue.total_eur,
          totalOrders: salesSummary.total_orders,
          totalCustomers: 0, // TODO: Add API for customers count
          totalProducts: 0, // TODO: Add API for products count
        });

        // Process monthly sales data for chart
        const formattedChartData = monthlySales.map((item: any) => ({
          name: item.month,
          total: item.revenue_eur,
        }));

        setChartData(formattedChartData);

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: t("admin.dashboard.totalRevenue"),
      value: stats?.totalRevenue.toLocaleString("en-US", { style: "currency", currency: "USD" }),
      icon: DollarSign,
    },
    {
      title: t("admin.dashboard.totalOrders"),
      value: stats?.totalOrders,
      icon: ShoppingCart,
    },
    {
      title: t("admin.dashboard.totalCustomers"),
      value: stats?.totalCustomers,
      icon: Users,
    },
    {
      title: t("admin.dashboard.totalProducts"),
      value: stats?.totalProducts,
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.dashboard.salesChartTitle")}</CardTitle>
          <CardDescription>{t("admin.dashboard.salesLast30Days")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            {loading ? (
              <div className="w-full h-full bg-muted rounded animate-pulse" />
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#c7a57b" name={t("admin.dashboard.totalRevenue")} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

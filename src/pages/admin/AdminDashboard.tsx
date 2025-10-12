import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Définition des types pour les données de l'API
interface SalesSummary {
  total_revenue: {
    total_eur: string;
    total_usd: string;
    total_cdf: string;
  };
  total_orders: number;
  total_products_sold: number;
}

interface MonthlySale {
  month: string;
  revenue_eur: string;
  revenue_usd: string;
  revenue_cdf: string;
}

interface LoyalCustomer {
  email: string;
  name: string;
  total_orders: string;
  total_spent_eur: string;
}

interface PaymentLog {
  id: number;
  transaction_id: string;
  order_id: string | null;
  payment_method: string;
  provider: string | null;
  amount: number;
  currency: string;
  status: string;
  action: string;
  error_message: string | null;
  created_at: string;
}

interface PaymentStats {
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  total_amount: string;
  avg_transaction_amount: string;
  unique_users: number;
}

const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlySale[]>([]);
  const [loyalCustomers, setLoyalCustomers] = useState<LoyalCustomer[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Vérifier si les tables existent avant de faire les requêtes
        const tableCheck = await fetch('http://localhost:3001/api/admin/orders?limit=1');
        const tablesExist = tableCheck.ok;

        if (!tablesExist) {
          // Si les tables n'existent pas, afficher des données vides
          setSummary({
            total_revenue: { total_eur: '0', total_usd: '0', total_cdf: '0' },
            total_orders: 0,
            total_products_sold: 0
          });
          setMonthlyData([]);
          setLoyalCustomers([]);
          setLoading(false);
          return;
        }

        const [summaryRes, monthlyRes, loyalCustomersRes, paymentLogsRes, paymentStatsRes] = await Promise.all([
          fetch('http://localhost:3001/api/admin/reports/sales-summary'),
          fetch('http://localhost:3001/api/admin/reports/monthly-sales'),
          fetch('http://localhost:3001/api/admin/reports/loyal-customers'),
          fetch('http://localhost:3001/api/admin/payment-logs?limit=10'),
          fetch('http://localhost:3001/api/admin/payment-stats'),
        ]);

        const summaryData = summaryRes.ok ? await summaryRes.json() : {
          total_revenue: { total_eur: '0', total_usd: '0', total_cdf: '0' },
          total_orders: 0,
          total_products_sold: 0
        };
        const monthlyData = monthlyRes.ok ? await monthlyRes.json() : [];
        const loyalCustomersData = loyalCustomersRes.ok ? await loyalCustomersRes.json() : [];
        const paymentLogsData = paymentLogsRes.ok ? await paymentLogsRes.json() : [];
        const paymentStatsData = paymentStatsRes.ok ? await paymentStatsRes.json() : null;

        setSummary(summaryData);
        setMonthlyData(monthlyData);
        setLoyalCustomers(loyalCustomersData);
        setPaymentLogs(paymentLogsData);
        setPaymentStats(paymentStatsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Chargement du tableau de bord...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Erreur : {error}</div>;
  }

  if (!summary) {
    return null;
  }

  const formatCurrency = (value: string | number, currency: 'EUR' | 'USD' | 'CDF') => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(Number(value));
  };

  return (
    <div className="space-y-6">
      {/* Cartes de résumé */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Revenu Total (EUR)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(summary.total_revenue.total_eur, 'EUR')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Commandes Complétées</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.total_orders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Produits Vendus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.total_products_sold}</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique des ventes mensuelles */}
      <Card>
        <CardHeader>
          <CardTitle>Ventes Mensuelles (EUR)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value, 'EUR')} />
              <Legend />
              <Line type="monotone" dataKey="revenue_eur" name="Revenu EUR" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tableau des clients fidèles */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 des Clients Fidèles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Nom</th>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th className="py-2 px-4 border-b text-center">Commandes</th>
                  <th className="py-2 px-4 border-b text-right">Total Dépensé (EUR)</th>
                </tr>
              </thead>
              <tbody>
                {loyalCustomers.map((customer, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{customer.name}</td>
                    <td className="py-2 px-4 border-b">{customer.email}</td>
                    <td className="py-2 px-4 border-b text-center">{customer.total_orders}</td>
                    <td className="py-2 px-4 border-b text-right">{formatCurrency(customer.total_spent_eur, 'EUR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

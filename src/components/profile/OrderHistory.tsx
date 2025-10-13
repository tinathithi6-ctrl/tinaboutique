import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Calendar, CreditCard, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Order {
  id: number;
  created_at: string;
  total_amount: number;
  currency: string;
  status: string;
  items?: any[];
}

const OrderHistory = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !token) return;

      try {
        const data = await (await import('@/lib/api')).apiFetch('/api/orders') as any[];
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token]);

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
      pending: { label: "En attente", color: "text-yellow-600 bg-yellow-50", icon: Clock },
      paid: { label: "Payée", color: "text-green-600 bg-green-50", icon: CheckCircle },
      shipped: { label: "Expédiée", color: "text-blue-600 bg-blue-50", icon: Truck },
      delivered: { label: "Livrée", color: "text-green-600 bg-green-50", icon: CheckCircle },
      cancelled: { label: "Annulée", color: "text-red-600 bg-red-50", icon: XCircle },
    };
    return statusMap[status] || statusMap.pending;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucune commande
          </h3>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas encore passé de commande. Découvrez nos produits !
          </p>
          <Button
            onClick={() => window.location.href = '/shop'}
            className="bg-gold hover:bg-yellow-600"
          >
            Découvrir la boutique
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-heading font-bold">
          Mes Commandes ({orders.length})
        </h2>
      </div>

      {orders.map((order) => {
        const statusInfo = getStatusInfo(order.status);
        const StatusIcon = statusInfo.icon;

        return (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-gold/10 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Commande #{order.id}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.color}`}>
                    <StatusIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{statusInfo.label}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="text-lg font-bold text-gray-900">
                    {order.total_amount.toFixed(2)} {order.currency}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/orders/${order.id}`}
                  >
                    Voir détails
                  </Button>
                  {order.status === 'delivered' && (
                    <Button
                      size="sm"
                      className="bg-gold hover:bg-yellow-600"
                    >
                      Racheter
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OrderHistory;

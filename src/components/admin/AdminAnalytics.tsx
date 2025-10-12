import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShoppingCart, Clock, DollarSign, Users, TrendingDown } from "lucide-react";
import { format } from "date-fns";

interface AbandonedCart {
  id: string;
  user_id: string;
  product_id: number;
  quantity: number;
  added_at: string;
  product_name: string;
  product_price: number;
  user_email: string;
  user_name: string;
  days_old: number;
}

interface CartStats {
  total_abandoned_carts: number;
  total_abandoned_value: number;
  carts_last_24h: number;
  carts_last_7d: number;
  carts_last_30d: number;
  avg_cart_age: number;
}

export const AdminAnalytics = () => {
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [cartStats, setCartStats] = useState<CartStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAbandonedCarts = async () => {
    try {
      const [cartsResponse, statsResponse] = await Promise.all([
        fetch('http://localhost:3001/api/admin/abandoned-carts'),
        fetch('http://localhost:3001/api/admin/abandoned-carts/stats')
      ]);

      const cartsData = cartsResponse.ok ? await cartsResponse.json() : [];
      const statsData = statsResponse.ok ? await statsResponse.json() : {
        total_abandoned_carts: 0,
        total_abandoned_value: 0,
        carts_last_24h: 0,
        carts_last_7d: 0,
        carts_last_30d: 0,
        avg_cart_age: 0
      };

      // Transformer les données pour correspondre à l'interface
      const formattedCarts: AbandonedCart[] = cartsData.map((cart: any) => ({
        id: cart.id,
        user_id: cart.user_id,
        product_id: cart.product_id,
        quantity: cart.quantity,
        added_at: cart.added_at,
        product_name: cart.product_name,
        product_price: cart.price_eur,
        user_email: cart.user_email,
        user_name: cart.user_name,
        days_old: Math.floor(cart.days_old)
      }));

      setAbandonedCarts(formattedCarts);
      setCartStats(statsData);
    } catch (error) {
      console.error("Erreur lors du chargement des paniers abandonnés:", error);
      setAbandonedCarts([]);
      setCartStats({
        total_abandoned_carts: 0,
        total_abandoned_value: 0,
        carts_last_24h: 0,
        carts_last_7d: 0,
        carts_last_30d: 0,
        avg_cart_age: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAbandonedCarts();
  }, []);

  const getUrgencyBadge = (days: number) => {
    if (days <= 1) return <Badge className="bg-green-500">Récent</Badge>;
    if (days <= 3) return <Badge className="bg-yellow-500">À relancer</Badge>;
    if (days <= 7) return <Badge className="bg-orange-500">Urgent</Badge>;
    return <Badge variant="destructive">Critique</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement des analyses...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistiques générales paniers abandonnés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Paniers abandonnés</p>
                <p className="text-2xl font-bold">{cartStats?.total_abandoned_carts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Valeur perdue</p>
                <p className="text-2xl font-bold">€{Number(cartStats?.total_abandoned_value || 0).toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Âge moyen</p>
                <p className="text-2xl font-bold">{Number(cartStats?.avg_cart_age || 0).toFixed(1)}j</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">À relancer (24h)</p>
                <p className="text-2xl font-bold">{cartStats?.carts_last_24h || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paniers abandonnés détaillés */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Paniers Abandonnés - Action Requise
          </CardTitle>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Relancer tous (24h)
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Âge</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {abandonedCarts.map((cart) => (
                <TableRow key={cart.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{cart.user_name}</div>
                      <div className="text-sm text-muted-foreground">{cart.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{cart.product_name}</TableCell>
                  <TableCell>{cart.quantity}</TableCell>
                  <TableCell className="font-semibold">
                    €{(cart.product_price * cart.quantity).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(cart.added_at), "dd/MM/yyyy")}
                    <div className="text-sm text-muted-foreground">
                      il y a {cart.days_old} jour{cart.days_old > 1 ? 's' : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getUrgencyBadge(cart.days_old)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        📧 Email
                      </Button>
                      <Button variant="outline" size="sm">
                        📱 SMS
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations Automatisées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Relance Immédiate Requise</h4>
              </div>
              <p className="text-sm text-yellow-700">
                {cartStats?.carts_last_24h || 0} paniers abandonnés dans les dernières 24h.
                Recommandation : Envoyer un email de relance avec réduction de 10%.
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Optimisation du Tunnel d'Achat</h4>
              </div>
              <p className="text-sm text-blue-700">
                L'âge moyen des paniers abandonnés est de {Number(cartStats?.avg_cart_age || 0).toFixed(1)} jours.
                Recommandation : Simplifier le processus de checkout.
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Opportunité de Récupération</h4>
              </div>
              <p className="text-sm text-green-700">
                Valeur totale des paniers abandonnés : €{Number(cartStats?.total_abandoned_value || 0).toFixed(0)}.
                Avec un taux de récupération de 20%, vous pourriez récupérer €{Number((cartStats?.total_abandoned_value || 0) * 0.2).toFixed(0)}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
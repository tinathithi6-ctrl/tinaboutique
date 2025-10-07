import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

export const AdminOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(t("admin.orders.error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      toast.success(t("admin.orders.statusUpdated"));
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(t("admin.orders.error"));
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">{t("common.loading")}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.orders.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.orders.id")}</TableHead>
              <TableHead>{t("admin.orders.customer")}</TableHead>
              <TableHead>{t("admin.orders.total")}</TableHead>
              <TableHead>{t("admin.orders.status")}</TableHead>
              <TableHead>{t("admin.orders.date")}</TableHead>
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
                    <div className="font-medium">{order.profiles?.full_name}</div>
                    <div className="text-sm text-muted-foreground">{order.profiles?.email}</div>
                  </div>
                </TableCell>
                <TableCell>${parseFloat(order.total_amount).toFixed(2)}</TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t("admin.orders.pending")}</SelectItem>
                      <SelectItem value="processing">{t("admin.orders.processing")}</SelectItem>
                      <SelectItem value="shipped">{t("admin.orders.shipped")}</SelectItem>
                      <SelectItem value="delivered">{t("admin.orders.delivered")}</SelectItem>
                      <SelectItem value="cancelled">{t("admin.orders.cancelled")}</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

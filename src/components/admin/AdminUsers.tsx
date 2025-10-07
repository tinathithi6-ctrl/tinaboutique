import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { Shield, User } from "lucide-react";

export const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const usersWithRoles = profilesData.map((profile) => {
        const userRole = rolesData.find((r) => r.user_id === profile.id);
        return {
          ...profile,
          role: (userRole?.role || "user") as "admin" | "user",
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(t("admin.users.error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingRole) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole as "admin" | "user" })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert([{ user_id: userId, role: newRole as "admin" | "user" }]);

        if (error) throw error;
      }

      toast.success(t("admin.users.roleUpdated"));
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error(t("admin.users.error"));
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">{t("common.loading")}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.users.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.users.name")}</TableHead>
              <TableHead>{t("admin.users.email")}</TableHead>
              <TableHead>{t("admin.users.phone")}</TableHead>
              <TableHead>{t("admin.users.role")}</TableHead>
              <TableHead>{t("admin.users.joined")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name || "-"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || "-"}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {t("admin.users.userRole")}
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {t("admin.users.adminRole")}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {format(new Date(user.created_at), "dd/MM/yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

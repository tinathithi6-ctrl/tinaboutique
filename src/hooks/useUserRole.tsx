import { useAuth } from "@/contexts/AuthContext";

export type UserRole = "admin" | "user";

export const useUserRole = () => {
  const { user } = useAuth();
  const role = user?.role as UserRole || "user";
  return { role, loading: false, isAdmin: role === "admin" };
};

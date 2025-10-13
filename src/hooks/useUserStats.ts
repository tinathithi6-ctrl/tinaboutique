import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import apiFetch from '@/lib/api';

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

export const useUserStats = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<UserStats>({ totalOrders: 0, totalSpent: 0, loyaltyPoints: 0, tier: "bronze" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || !token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch('/api/profile/stats') as any;
        setStats({
          totalOrders: data.totalOrders || 0,
          totalSpent: data.totalSpent || 0,
          loyaltyPoints: data.loyaltyPoints || 0,
          tier: data.tier || "bronze",
        });
      } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
        setStats({ totalOrders: 0, totalSpent: 0, loyaltyPoints: 0, tier: "bronze" });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, token]);

  return { stats, loading };
};

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

export const useUserStats = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    tier: "bronze",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || !token) {
        setLoading(false);
        return;
      }

      try {
        // Appel API pour récupérer les stats
        const response = await fetch('http://localhost:3001/api/profile/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          // Si l'API n'existe pas encore, utiliser des valeurs par défaut
          // Calculer le tier basé sur le total dépensé
          const calculateTier = (spent: number): "bronze" | "silver" | "gold" | "platinum" => {
            if (spent >= 1000) return "platinum";
            if (spent >= 500) return "gold";
            if (spent >= 100) return "silver";
            return "bronze";
          };

          // Valeurs simulées pour la démo
          const simulatedStats = {
            totalOrders: 3,
            totalSpent: 289.99,
            loyaltyPoints: 450,
            tier: calculateTier(289.99),
          };
          setStats(simulatedStats);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
        
        // Valeurs par défaut en cas d'erreur
        setStats({
          totalOrders: 0,
          totalSpent: 0,
          loyaltyPoints: 0,
          tier: "bronze",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, token]);

  return { stats, loading };
};

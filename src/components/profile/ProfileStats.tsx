import { ShoppingBag, CreditCard, Star, Award } from "lucide-react";

interface ProfileStatsProps {
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

const ProfileStats = ({
  totalOrders,
  totalSpent,
  loyaltyPoints,
  tier,
}: ProfileStatsProps) => {
  const getTierInfo = (tier: string) => {
    const tiers = {
      bronze: { label: "Bronze", color: "text-orange-700", bg: "bg-orange-100" },
      silver: { label: "Silver", color: "text-gray-600", bg: "bg-gray-100" },
      gold: { label: "Gold", color: "text-yellow-600", bg: "bg-yellow-100" },
      platinum: { label: "Platinum", color: "text-purple-600", bg: "bg-purple-100" },
    };
    return tiers[tier as keyof typeof tiers] || tiers.bronze;
  };

  const tierInfo = getTierInfo(tier);

  const stats = [
    {
      icon: ShoppingBag,
      label: "Commandes",
      value: totalOrders,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: CreditCard,
      label: "Total Dépensé",
      value: `${totalSpent.toFixed(0)}€`,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: Star,
      label: "Points",
      value: loyaltyPoints,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      icon: Award,
      label: "Statut",
      value: tierInfo.label,
      color: tierInfo.color,
      bg: tierInfo.bg,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bg} rounded-lg p-4 text-center transition-transform hover:scale-105`}
          >
            <div className={`${stat.color} flex justify-center mb-2`}>
              <Icon className="h-8 w-8" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ProfileStats;

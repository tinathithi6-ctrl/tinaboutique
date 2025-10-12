import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  loading?: boolean;
}

export const KPICard = ({
  title,
  value,
  trend,
  trendLabel = "vs mois dernier",
  icon: Icon,
  iconColor = "text-gold",
  loading = false,
}: KPICardProps) => {
  const getTrendIcon = () => {
    if (!trend) return Minus;
    return trend > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = () => {
    if (!trend) return "text-gray-500";
    return trend > 0 ? "text-green-600" : "text-red-600";
  };

  const TrendIcon = getTrendIcon();

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
            {trend !== undefined && (
              <div className={cn("flex items-center gap-1 text-sm", getTrendColor())}>
                <TrendIcon className="h-4 w-4" />
                <span className="font-medium">
                  {trend > 0 ? "+" : ""}
                  {trend}%
                </span>
                <span className="text-gray-500 text-xs ml-1">{trendLabel}</span>
              </div>
            )}
          </div>
          <div className={cn("w-12 h-12 rounded-full bg-opacity-10 flex items-center justify-center", iconColor)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
